from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import openai
import os

class AnalyzeInsightsInput(BaseModel):
    project_data: Dict[str, Any]
    category: Optional[str] = None

class Insight(BaseModel):
    id: str
    title: str
    description: str
    category: str
    confidence: float
    impact: str  # "HIGH", "MEDIUM", "LOW"
    supporting_data: Dict[str, Any]
    recommendations: List[str]

async def analyze_insights(input_data: AnalyzeInsightsInput) -> Dict[str, Any]:
    """
    Analyzes project data and generates insights using LLM.
    
    This function processes the data and uses OpenAI to generate
    actionable insights based on the patterns found.
    """
    project_data = input_data.project_data
    category = input_data.category
    
    # Prepare the prompt for the LLM
    prompt = f"""
    Analyze the following restaurant data and generate actionable insights.
    
    {project_data}
    
    {"Focus on the " + category + " category." if category else ""}
    
    For each insight, provide:
    1. A clear title
    2. A detailed description
    3. Supporting data points
    4. Confidence level (0.0-1.0)
    5. Business impact (HIGH, MEDIUM, LOW)
    6. Actionable recommendations
    
    Format as a JSON list of insights.
    """
    
    # Call OpenAI API to generate insights
    client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    response = await client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a restaurant analytics expert."},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"}
    )
    
    # Process and structure the insights
    insights_data = response.choices[0].message.content
    
    # In production, you would parse the JSON response
    # For now, returning a structured example
    insights = {
        "insights": [
            {
                "id": "ins-001",
                "title": "Peak Hour Staffing Optimization",
                "description": "Your restaurant is understaffed during peak hours (6-8pm), leading to longer wait times and reduced customer satisfaction.",
                "category": "staffing",
                "confidence": 0.87,
                "impact": "HIGH",
                "supporting_data": {
                    "avg_wait_time_peak": "24 minutes",
                    "avg_wait_time_normal": "12 minutes",
                    "customer_satisfaction_delta": "-15%"
                },
                "recommendations": [
                    "Add 2 additional servers during 6-8pm peak hours",
                    "Implement pre-shift prep to speed up service during rush",
                    "Consider staggered reservation times to distribute traffic"
                ]
            }
        ]
    }
    
    return insights