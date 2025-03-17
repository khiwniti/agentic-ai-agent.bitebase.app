from typing import Dict, Any, Optional
import time
import psutil
import logging
from datetime import datetime
from collections import defaultdict
import asyncio
from pydantic import BaseModel

class AgentMetrics(BaseModel):
    """Metrics for individual agent operations"""
    total_operations: int = 0
    successful_operations: int = 0
    failed_operations: int = 0
    total_processing_time: float = 0.0
    avg_confidence_score: float = 0.0
    last_operation_timestamp: Optional[datetime] = None
    error_counts: Dict[str, int] = {}

class SystemMetrics(BaseModel):
    """System-wide performance metrics"""
    cpu_percent: float = 0.0
    memory_percent: float = 0.0
    active_agents: int = 0
    pending_operations: int = 0
    cache_hit_rate: float = 0.0
    total_insights_generated: int = 0

class PerformanceMonitor:
    """Monitors and tracks system and agent performance metrics"""
    
    def __init__(self):
        self.agent_metrics: Dict[str, AgentMetrics] = defaultdict(AgentMetrics)
        self.system_metrics = SystemMetrics()
        self.start_time = time.time()
        self._cache_stats = {"hits": 0, "misses": 0}
        self._active_operations: Dict[str, Dict[str, Any]] = {}
        
    async def start_monitoring(self):
        """Start the monitoring system"""
        logging.info("Starting performance monitoring")
        asyncio.create_task(self._periodic_system_check())
    
    def record_operation_start(self, agent_type: str, operation_id: str, details: Dict[str, Any]):
        """Record the start of an agent operation"""
        self._active_operations[operation_id] = {
            "agent_type": agent_type,
            "start_time": time.time(),
            "details": details
        }
        self.agent_metrics[agent_type].total_operations += 1
        self.system_metrics.pending_operations += 1
        self.system_metrics.active_agents += 1
    
    def record_operation_end(
        self,
        operation_id: str,
        success: bool,
        confidence: Optional[float] = None,
        error: Optional[str] = None
    ):
        """Record the completion of an agent operation"""
        if operation_id not in self._active_operations:
            logging.warning(f"Unknown operation ID: {operation_id}")
            return
        
        operation = self._active_operations.pop(operation_id)
        agent_type = operation["agent_type"]
        duration = time.time() - operation["start_time"]
        
        # Update agent metrics
        metrics = self.agent_metrics[agent_type]
        metrics.total_processing_time += duration
        metrics.last_operation_timestamp = datetime.now()
        
        if success:
            metrics.successful_operations += 1
            if confidence is not None:
                # Update running average of confidence scores
                curr_total = metrics.avg_confidence_score * (metrics.successful_operations - 1)
                metrics.avg_confidence_score = (curr_total + confidence) / metrics.successful_operations
        else:
            metrics.failed_operations += 1
            if error:
                metrics.error_counts[error] = metrics.error_counts.get(error, 0) + 1
        
        # Update system metrics
        self.system_metrics.pending_operations -= 1
        self.system_metrics.active_agents -= 1
    
    def record_cache_access(self, hit: bool):
        """Record a cache hit or miss"""
        if hit:
            self._cache_stats["hits"] += 1
        else:
            self._cache_stats["misses"] += 1
            
        total = self._cache_stats["hits"] + self._cache_stats["misses"]
        self.system_metrics.cache_hit_rate = (
            self._cache_stats["hits"] / total if total > 0 else 0.0
        )
    
    def record_insight_generated(self):
        """Record a generated insight"""
        self.system_metrics.total_insights_generated += 1
    
    async def _periodic_system_check(self):
        """Periodically update system metrics"""
        while True:
            try:
                # Update CPU and memory usage
                self.system_metrics.cpu_percent = psutil.cpu_percent()
                self.system_metrics.memory_percent = psutil.virtual_memory().percent
                
                # Log system status
                if self.system_metrics.active_agents > 0:
                    logging.info(
                        "System Status: %s",
                        self.get_system_status()
                    )
                
                # Check for stalled operations
                current_time = time.time()
                for op_id, op_data in list(self._active_operations.items()):
                    if current_time - op_data["start_time"] > 300:  # 5 minutes
                        logging.warning(
                            "Operation potentially stalled: %s (%s)",
                            op_id,
                            op_data["agent_type"]
                        )
                
            except Exception as e:
                logging.error("Error in system monitoring: %s", str(e))
            
            await asyncio.sleep(60)  # Check every minute
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get current system status"""
        return {
            "uptime": time.time() - self.start_time,
            "system_metrics": self.system_metrics.dict(),
            "agent_metrics": {
                agent_type: metrics.dict()
                for agent_type, metrics in self.agent_metrics.items()
            }
        }
    
    def get_agent_performance(self, agent_type: str) -> Dict[str, Any]:
        """Get detailed performance metrics for a specific agent"""
        metrics = self.agent_metrics[agent_type]
        total_ops = metrics.total_operations
        
        if total_ops == 0:
            return {"message": "No operations recorded for this agent"}
        
        return {
            "success_rate": metrics.successful_operations / total_ops,
            "average_processing_time": metrics.total_processing_time / total_ops,
            "average_confidence": metrics.avg_confidence_score,
            "error_distribution": dict(metrics.error_counts),
            "total_operations": total_ops
        }

# Global monitor instance
_monitor: Optional[PerformanceMonitor] = None

def get_monitor() -> PerformanceMonitor:
    """Get the global monitor instance"""
    global _monitor
    if _monitor is None:
        _monitor = PerformanceMonitor()
    return _monitor

async def setup_monitoring() -> None:
    """Initialize and start the monitoring system"""
    monitor = get_monitor()
    await monitor.start_monitoring()