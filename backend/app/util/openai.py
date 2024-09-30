from openai import OpenAI
from app.schemas import ChatMessage, Conversation
from datetime import datetime, timezone
def init_conversation(conversation: Conversation) -> Conversation:
    #TODO: Implement this function
    conversation.chat_messages = []
    return conversation

# Evaluates if it's part of the conversation or should be added as a meeting agenda
def generate_response(conversation: Conversation, meeting_type: str) -> Conversation:
    #TODO: Implement this function
    return conversation