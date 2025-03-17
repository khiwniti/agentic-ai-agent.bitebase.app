import asyncio
import time
from restack_ai import Restack
from typing import List, Dict, Any

async def run_orchestration(analysis_types: List[str], query_params: Dict[str, Any]):
    client = Restack()
    
    workflow_id = f"orchestration-{int(time.time() * 1000)}"
    run_id = await client.schedule_workflow(
        workflow_name="AgentOrchestrator",
        workflow_id=workflow_id,
        input={
            "analysis_types": analysis_types,
            "query_params": query_params,
            "confidence_threshold": 0.7
        }
    )
    
    print(f"Started orchestration workflow: {workflow_id}")
    print("Waiting for results...")
    
    # Poll for results
    result = await client.get_workflow_result(
        workflow_id=workflow_id,
        run_id=run_id
    )
    
    print("\nOrchestration completed!")
    print(f"Analysis types: {', '.join(analysis_types)}")
    
    # Print summary of insights
    for analysis_type, data in result.items():
        if analysis_type == "errors":
            continue
            
        if "insights" in data:
            print(f"\n{analysis_type.upper()} INSIGHTS: {len(data['insights'])}")
            for i, insight in enumerate(data["insights"], 1):
                print(f"  {i}. {insight['title']} (Confidence: {insight['confidence']:.2f})")
    
    # Print any errors
    if "errors" in result:
        print("\nERRORS:")
        for error in result["errors"]:
            print(f"  - {error['analysis_type']}: {error['error']}")
    
    return result

def main():
    # Example usage
    analysis_types = ["sales", "pricing"]
    query_params = {
        "timeframe": "last_90_days",
        "metrics": ["revenue", "volume", "average_order_value"],
        "product_ids": ["product-123", "product-456"],
        "competitor_analysis": True
    }
    
    asyncio.run(run_orchestration(analysis_types, query_params))

if __name__ == "__main__":
    main()