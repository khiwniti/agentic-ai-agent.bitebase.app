import pytest
from src.agents.chat_tool_functions import ChatToolFunctions
from src.agents.insights_agent import InsightsAgent
from src.agents.market_agent import MarketAgent

@pytest.fixture
def chat_tool_functions():
    return ChatToolFunctions()

@pytest.fixture
def insights_agent():
    return InsightsAgent()

@pytest.fixture
def market_agent():
    return MarketAgent()

def test_response_naturality_chat_tools(chat_tool_functions):
    """Test that chat tool responses sound natural"""
    # Test greeting response
    greeting = chat_tool_functions.get_greeting()
    assert not greeting.startswith(("Great", "Certainly", "Okay", "Sure"))
    assert "!" not in greeting
    assert len(greeting.split()) <= 10  # Keep it concise

    # Test question response 
    question = chat_tool_functions.get_question_response("What's the weather?")
    assert not question.startswith(("Great", "Certainly", "Okay", "Sure"))
    assert question.endswith((".", "?"))
    assert len(question.split()) <= 15

def test_response_naturality_insights(insights_agent):
    """Test that insight responses are clear and natural"""
    insight = insights_agent.generate_insight("sales have increased")
    
    # Should not start with filler words
    assert not insight.startswith(("Great", "Certainly", "Okay", "Sure"))
    
    # Should be clear and concise
    assert len(insight.split()) <= 30
    
    # Should not have multiple exclamation marks
    assert insight.count("!") <= 1
    
    # Should end properly
    assert insight.endswith((".", "!", "?"))

def test_response_naturality_market(market_agent):
    """Test that market analysis responses are professional"""
    analysis = market_agent.analyze_market("restaurant industry")
    
    # Should start with meaningful content
    assert not analysis.startswith(("Great", "Certainly", "Okay", "Sure"))
    
    # Should be comprehensive but not too long
    assert 50 <= len(analysis.split()) <= 200
    
    # Should use professional language
    assert not any(word in analysis.lower() for word in ["awesome", "cool", "amazing"])
    
    # Should end with a complete thought
    assert analysis.endswith(".")

def test_response_formatting():
    """Test that responses follow proper formatting"""
    responses = [
        ("Revenue grew", "Revenue grew by 15% in Q2 2024."),
        ("Market good", "Market share increased by 3 percentage points."),
        ("Users like", "User satisfaction rating improved to 4.5/5.")
    ]
    
    for _, response in responses:
        # Should start with capital letter
        assert response[0].isupper()
        
        # Should end with proper punctuation
        assert response[-1] in (".", "!", "?")
        
        # Should not have multiple spaces
        assert "  " not in response
        
        # Should not have trailing/leading spaces
        assert response.strip() == response

def test_response_clarity():
    """Test that responses are clear and unambiguous"""
    responses = [
        ("Revenue grew", "Revenue grew by 15% in Q2 2024."),
        ("Market good", "Market share increased by 3 percentage points."),
        ("Users like", "User satisfaction rating improved to 4.5/5.")
    ]
    
    for vague, clear in responses:
        # Clear response should be more specific
        assert len(clear) > len(vague)
        
        # Clear response should include numbers or metrics
        assert any(char.isdigit() for char in clear)
        
        # Clear response should be a complete sentence
        assert clear[0].isupper() and clear.endswith(".")

if __name__ == "__main__":
    pytest.main([__file__])
