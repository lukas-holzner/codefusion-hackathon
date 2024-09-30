from openai import OpenAI
from app.schemas import ChatMessage, Conversation

def init_conversation(system_prompt: str) -> ChatMessage:
    #TODO: Implement this function
    return ChatMessage(message="", author="", timestamp=datetime.now())

# Evaluates if it's part of the conversation or should be added as a meeting agenda
def generate_response(conversation: Conversation, system_prompt: str) -> Conversation:
    #TODO: Implement this function
    return conversation