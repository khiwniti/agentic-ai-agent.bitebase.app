class ChatToolFunctions:
    def get_greeting(self):
        """Return a natural greeting"""
        return "Welcome to BiteBase"
        
    def get_question_response(self, question: str) -> str:
        """Return a natural response to a question"""
        
        # Handle weather related questions
        if "weather" in question.lower():
            return "The current temperature is 25°C."
            
        # Default response
        return "How can I assist you today?"
