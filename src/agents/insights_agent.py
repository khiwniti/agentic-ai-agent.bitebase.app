class InsightsAgent:
    def generate_insight(self, data: str) -> str:
        """Generate natural insights from data"""
        
        # Handle sales insights
        if "sales" in data.lower():
            return "Revenue growth indicates strong market performance."
            
        # Handle customer insights    
        if "customer" in data.lower():
            return "Customer engagement shows positive trends."
            
        # Default insight
        return "Analysis reveals opportunities for optimization."
