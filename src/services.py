import asyncio
import logging
import webbrowser
from pathlib import Path
from typing import List, Dict, Any, Optional

from watchfiles import run_process
from pydantic import BaseModel

from src.agents.chat_tool_functions import AgentChatToolFunctions
from src.agents.insights_agent import InsightsAgent
from src.agents.market_agent import MarketAnalysisAgent
from src.agents.pricing_agent import PricingAgent
from src.agents.sales_agent import SalesAgent
from src.orchestration.agent_orchestrator import AgentOrchestrator, OrchestrationInput, OrchestrationConfig
from src.client import client
from src.functions.llm_chat import llm_chat
from src.functions.fetch_project_data import fetch_project_data
from src.functions.analyze_insights import analyze_insights

class ServiceConfig(BaseModel):
    """Configuration for the BiteBase service"""
    port: int = 5233
    debug: bool = False
    enable_monitoring: bool = True
    cache_results: bool = True
    default_confidence_threshold: float = 0.7
    orchestration_config: OrchestrationConfig = OrchestrationConfig()

class AnalysisRequest(BaseModel):
    """Request model for analysis operations"""
    project_id: str
    analysis_types: List[str]
    query_params: Dict[str, Any]
    confidence_threshold: Optional[float] = None

async def analyze_project(request: AnalysisRequest, config: ServiceConfig) -> Dict[str, Any]:
    """Execute project analysis using the agent orchestration system"""
    orchestration_input = OrchestrationInput(
        analysis_types=request.analysis_types,
        query_params=request.query_params,
        project_id=request.project_id,
        confidence_threshold=request.confidence_threshold or config.default_confidence_threshold,
        config=config.orchestration_config
    )
    
    orchestrator = AgentOrchestrator()
    return await orchestrator.run(orchestration_input)

async def main(config: Optional[ServiceConfig] = None) -> None:
    """Initialize and start the BiteBase service"""
    if config is None:
        config = ServiceConfig()
    
    logging.info("Initializing BiteBase service with configuration: %s", config.dict())
    
    # Register all available agents
    agents = [
        AgentChatToolFunctions,
        InsightsAgent,
        MarketAnalysisAgent,
        PricingAgent,
        SalesAgent
    ]
    
    # Register core functions
    functions = [
        llm_chat,
        fetch_project_data,
        analyze_insights,
        analyze_project
    ]
    
    # Initialize monitoring if enabled
    if config.enable_monitoring:
        from src.monitoring.performance_monitor import setup_monitoring
        await setup_monitoring()
    
    # Start the service
    await client.start_service(
        agents=agents,
        functions=functions,
        port=config.port,
        debug=config.debug
    )

def run_services(config: Optional[ServiceConfig] = None) -> None:
    """Run the BiteBase service"""
    try:
        asyncio.run(main(config))
    except KeyboardInterrupt:
        logging.info("Service interrupted by user. Exiting gracefully.")
    except Exception as e:
        logging.error("Service error: %s", str(e), exc_info=True)
        raise

def watch_services(config: Optional[ServiceConfig] = None) -> None:
    """Run the BiteBase service with hot reloading"""
    watch_path = Path.cwd()
    logging.info("Watching %s and its subdirectories for changes...", watch_path)
    
    if config is None:
        config = ServiceConfig()
    
    webbrowser.open(f"http://localhost:{config.port}")
    run_process(watch_path, recursive=True, target=lambda: run_services(config))

if __name__ == "__main__":
    config = ServiceConfig(
        debug=True,
        enable_monitoring=True,
        cache_results=True
    )
    run_services(config)
