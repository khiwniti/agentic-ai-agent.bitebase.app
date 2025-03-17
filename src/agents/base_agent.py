from restack_ai.agent import agent, log
from restack_ai.workflow import workflow
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional, Tuple
from datetime import timedelta
import json

class InsightMetadata(BaseModel):
    confidence: float = Field(..., ge=0.0, le=1.0)
    priority: int = Field(..., ge=1, le=5)
    impact_score: float = Field(..., ge=0.0, le=1.0)
    tags: List[str] = Field(default_factory=list)
    data_sources: List[str] = Field(default_factory=list)

class BaseAgentConfig(BaseModel):
    confidence_threshold: float = 0.7
    max_processing_time: int = 120  # seconds
    enable_audit_logging: bool = True
    cache_results: bool = True
    retry_attempts: int = 3
    context_window: int = 1000  # Number of tokens for context

@agent.defn()
class BaseAgent:
    """Base agent class with common functionality for all specialized agents"""
    
    def __init__(self) -> None:
        self.config = BaseAgentConfig()
        self.audit_log: List[Dict[str, Any]] = []
        self.context: Dict[str, Any] = {}
        self._cached_results: Dict[str, Any] = {}
    
    def log_action(self, action: str, details: Dict[str, Any]) -> None:
        """Record agent actions for audit and debugging"""
        if self.config.enable_audit_logging:
            log_entry = {
                "timestamp": agent.current_time_millis(),
                "action": action,
                "agent_type": self.__class__.__name__,
                "details": details
            }
            self.audit_log.append(log_entry)
            log.info(f"Agent action: {action}", details=details)
    
    async def validate_insight(self, insight: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Validate if an insight meets quality criteria"""
        validation_errors = []
        
        # Check confidence threshold
        if "confidence" not in insight:
            validation_errors.append("Missing confidence score")
        elif insight["confidence"] < self.config.confidence_threshold:
            validation_errors.append(f"Confidence below threshold: {insight['confidence']}")
        
        # Validate required fields
        required_fields = ["description", "impact", "recommendations"]
        for field in required_fields:
            if field not in insight:
                validation_errors.append(f"Missing required field: {field}")
        
        # Validate metadata if present
        if "metadata" in insight:
            try:
                InsightMetadata(**insight["metadata"])
            except Exception as e:
                validation_errors.append(f"Invalid metadata: {str(e)}")
        
        return len(validation_errors) == 0, validation_errors
    
    async def get_context(self, query_params: Dict[str, Any]) -> Dict[str, Any]:
        """Get relevant context for agent reasoning"""
        context_key = json.dumps(query_params, sort_keys=True)
        
        # Return cached context if available
        if context_key in self.context:
            return self.context[context_key]
        
        try:
            # Fetch relevant data sources based on query params
            data_sources = await self.identify_data_sources(query_params)
            context_data = await self.fetch_context_data(data_sources)
            
            # Store context with query params as key
            self.context[context_key] = context_data
            return context_data
            
        except Exception as e:
            log.error("Error fetching context", error=str(e))
            return {}
    
    async def identify_data_sources(self, query_params: Dict[str, Any]) -> List[str]:
        """Identify relevant data sources based on query parameters"""
        # This should be implemented by specialized agents
        raise NotImplementedError
    
    async def fetch_context_data(self, data_sources: List[str]) -> Dict[str, Any]:
        """Fetch data from identified sources"""
        # This should be implemented by specialized agents
        raise NotImplementedError
    
    async def process_with_retry(self, func, *args, **kwargs) -> Any:
        """Execute a function with retry logic"""
        attempts = 0
        last_error = None
        
        while attempts < self.config.retry_attempts:
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                attempts += 1
                last_error = e
                log.warning(
                    "Operation failed, retrying",
                    attempt=attempts,
                    error=str(e)
                )
                if attempts < self.config.retry_attempts:
                    await workflow.sleep(2 ** attempts)  # Exponential backoff
        
        raise last_error