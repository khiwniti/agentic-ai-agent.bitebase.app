from typing import Dict, Any, List, Type, Optional
from datetime import datetime
from pydantic import BaseModel
from src.agents.base_agent import BaseAgent
from src.agents.sales_agent import SalesAgent
from src.agents.pricing_agent import PricingAgent
from src.agents.traffic_agent import TrafficAgent
from src.agents.sentiment_agent import SentimentAgent
from restack_ai.agent import log

class WorkflowMonitoring(BaseModel):
    """Monitoring data for workflow execution"""
    start_time: datetime
    end_time: Optional[datetime] = None
    steps_completed: int = 0
    errors: List[Dict[str, Any]] = []
    performance_metrics: Dict[str, float] = {}
    resource_usage: Dict[str, Any] = {}

class WorkflowStatus(BaseModel):
    """Current status of a workflow"""
    workflow_id: str
    status: str
    primary_agent: str
    supporting_agents: List[str]
    monitoring: WorkflowMonitoring
    results: Dict[str, Any] = {}

class AgentOrchestrator:
    """
    Coordinates multiple specialized agents and manages workflow execution.
    Implements the orchestration layer from the agentic AI architecture plan.
    """

    def __init__(self):
        self._registered_agents: Dict[str, Type[BaseAgent]] = {}
        self._active_workflows: Dict[str, Dict[str, Any]] = {}
        self.initialize_agents()

    def initialize_agents(self) -> None:
        """Register core specialized agents"""
        self.register_agent("sales", SalesAgent)
        self.register_agent("pricing", PricingAgent)
        self.register_agent("traffic", TrafficAgent)
        self.register_agent("sentiment", SentimentAgent)
        # Future agents to be implemented:
        # self.register_agent("menu", MenuAgent)
        # self.register_agent("competitor", CompetitorAgent)

        # Configure agent interactions
        self._configure_agent_dependencies()

        log.info("Agent initialization complete", 
                 registered_agents=list(self._registered_agents.keys()))

    def register_agent(self, name: str, agent_class: Type[BaseAgent]) -> None:
        """Register a new agent type"""
        self._registered_agents[name] = agent_class
        log.info(f"Registered agent: {name}", 
                 agent_capabilities=getattr(agent_class, '__doc__', ''))

    def _create_monitoring(self) -> WorkflowMonitoring:
        """Initialize workflow monitoring"""
        return WorkflowMonitoring(
            start_time=datetime.utcnow(),
            performance_metrics={
                "response_time": 0.0,
                "cpu_usage": 0.0,
                "memory_usage": 0.0
            },
            resource_usage={
                "agent_calls": 0,
                "database_queries": 0,
                "external_api_calls": 0
            }
        )

    async def create_workflow(
        self,
        workflow_id: str,
        primary_agent: str,
        input_data: Dict[str, Any],
        supporting_agents: List[str] = None
    ) -> str:
        """
        Create and initialize a new analysis workflow
        
        Args:
            workflow_id: Unique identifier for the workflow
            primary_agent: Name of the main agent handling the analysis
            input_data: Initial data and parameters for the workflow
            supporting_agents: Optional list of additional agents to assist
            
        Returns:
            Workflow ID for tracking
        """
        if workflow_id in self._active_workflows:
            raise ValueError(f"Workflow {workflow_id} already exists")

        if primary_agent not in self._registered_agents:
            raise ValueError(f"Unknown agent type: {primary_agent}")

        # Create and track new workflow with monitoring
        self._active_workflows[workflow_id] = WorkflowStatus(
            workflow_id=workflow_id,
            status="initialized",
            primary_agent=primary_agent,
            supporting_agents=supporting_agents or [],
            monitoring=self._create_monitoring()
        )

        log.info(f"Created workflow {workflow_id}",
                 workflow_details=self._active_workflows[workflow_id].dict())

        return workflow_id

    async def execute_workflow(
        self,
        workflow_id: str,
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Execute a prepared workflow
        
        Args:
            workflow_id: ID of the workflow to execute
            context: Optional additional context for the workflow
            
        Returns:
            Results from the workflow execution
        """
        if workflow_id not in self._active_workflows:
            raise ValueError(f"Unknown workflow: {workflow_id}")

        start_time = datetime.utcnow()
        workflow = self._active_workflows[workflow_id]
        workflow.status = "running"
        
        try:
            # Initialize primary agent
            primary_agent_class = self._registered_agents[workflow.primary_agent]
            primary_agent = primary_agent_class()

            # Execute supporting agent tasks with parallel processing and error handling
            supporting_results = await self._execute_supporting_agents(
                workflow.supporting_agents,
                context
            )

            # Execute primary agent task with supporting results
            workflow.monitoring.resource_usage["agent_calls"] += 1
            workflow.status = f"executing_{workflow.primary_agent}"
            result = await self._execute_agent_task(
                primary_agent,
                {
                    **(context or {}),
                    "supporting_results": supporting_results
                }
            )

            # Update workflow status and monitoring
            end_time = datetime.utcnow()
            workflow.status = "completed"
            workflow.monitoring.end_time = end_time
            workflow.monitoring.performance_metrics["response_time"] = \
                (end_time - start_time).total_seconds()
            workflow.results = result

            log.info(f"Completed workflow {workflow_id}",
                    execution_time=workflow.monitoring.performance_metrics["response_time"],
                    resource_usage=workflow.monitoring.resource_usage)

            return result

        except Exception as e:
            workflow.status = "failed"
            workflow.monitoring.errors.append({
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat(),
                "agent": workflow.primary_agent
            })
            log.error(f"Workflow {workflow_id} failed",
                     error=str(e),
                     context=workflow.dict())
            raise

    async def _execute_supporting_agents(
        self,
        agent_names: List[str],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute supporting agent tasks with parallel processing"""
        results = {}
        for agent_name in agent_names:
            if agent_name in self._registered_agents:
                try:
                    agent = self._registered_agents[agent_name]()
                    results[agent_name] = await self._execute_agent_task(
                        agent, context
                    )
                except Exception as e:
                    log.error(f"Supporting agent {agent_name} failed",
                            error=str(e))
                    results[agent_name] = {"error": str(e)}
        return results

    async def _execute_agent_task(
        self,
        agent: BaseAgent,
        context: Dict[str, Any],
        max_retries: int = 3,
        retry_delay: float = 1.0
    ) -> Dict[str, Any]:
        """Execute a single agent's task with retry logic and error handling"""
        attempts = 0
        last_error = None

        while attempts < max_retries:
            try:
                return await agent.execute(context)
            except Exception as e:
                attempts += 1
                last_error = e
                if attempts < max_retries:
                    await self._handle_retry(agent, attempts, retry_delay)
                    retry_delay *= 2  # Exponential backoff

        log.error("Agent task failed after retries",
                 agent=agent.__class__.__name__,
                 attempts=attempts,
                 error=str(last_error))
        raise last_error

    async def _handle_retry(
        self,
        agent: BaseAgent,
        attempt: int,
        delay: float
    ) -> None:
        """Handle retry logic for failed agent tasks"""
        log.warning(f"Retrying agent task",
                   agent=agent.__class__.__name__,
                   attempt=attempt,
                   delay=delay)
        # Implement retry delay logic here

    def get_workflow_status(self, workflow_id: str) -> Dict[str, Any]:
        """Get current status and results of a workflow"""
        if workflow_id not in self._active_workflows:
            raise ValueError(f"Unknown workflow: {workflow_id}")
        
        return self._active_workflows[workflow_id]

    def list_active_workflows(self) -> List[WorkflowStatus]:
        """Get details of all active workflows"""
        return [
            workflow for workflow in self._active_workflows.values()
            if workflow.status in ["initialized", "running"]
        ]

    def get_agent_metrics(self) -> Dict[str, Any]:
        """Get performance metrics for all agents"""
        metrics = {}
        for agent_name, agent_class in self._registered_agents.items():
            metrics[agent_name] = {
                "total_executions": 0,  # To be implemented
                "average_response_time": 0.0,  # To be implemented
                "success_rate": 0.0,  # To be implemented
                "error_rate": 0.0  # To be implemented
            }
        return metrics

    def _configure_agent_dependencies(self) -> None:
        """Configure which agents can support each other"""
        self._agent_dependencies = {
            "sales": ["pricing", "traffic", "sentiment"],
            "pricing": ["sales", "traffic", "sentiment"],
            "traffic": ["sales", "sentiment"],
            "sentiment": ["sales", "pricing"],
            # Future dependencies for other agents
        }
