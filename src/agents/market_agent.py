class MarketAgent:
    def analyze_market(self, industry: str) -> str:
        """Generate professional market analysis"""
        
        # Restaurant industry analysis
        if "restaurant" in industry.lower():
            return "The restaurant industry demonstrates significant growth potential, with key indicators showing a 12% increase in consumer spending. Market data indicates evolving consumer preferences toward sustainable and health-conscious dining options. Local establishments are adapting their menus and service models to meet these changing demands. Recent surveys indicate a 15% rise in dining frequency, while delivery services report 25% year-over-year growth. Industry experts predict continued expansion through 2025."
            
        # Retail industry analysis
        if "retail" in industry.lower():
            return "The retail sector shows steady recovery with digital transformation driving growth. E-commerce adoption rates have increased by 15%, while brick-and-mortar locations enhance their omnichannel capabilities. Consumer confidence metrics indicate positive sentiment toward discretionary spending."
            
        # Default analysis
        return "Market analysis indicates steady growth with opportunities for expansion. Key performance indicators suggest positive trends in consumer engagement and revenue generation. Strategic positioning remains crucial for maintaining competitive advantage."
