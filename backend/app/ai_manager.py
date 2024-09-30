import os
from dotenv import load_dotenv
from openai import OpenAI
from typing import List, Dict
import json

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI client using the API key from environment variable
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_initial_prompt(meeting_description: str, username: str) -> str:
    """
    Generate the initial system message for the meeting preparation.
    """
    return f"""You are an assistant that prepares the following meeting:
{meeting_description}
Help user {username} clarify their expectations for the meeting. 
After the expectations are clear, give the user a summary that they can accept. 
Always be concise and to the point. Just one question at a time.
If they accept the summary, output the summary as {{final_summary}} ... {{final_summary}} and say goodbye."""


def process_user_message(system_message: str, messages: List[str]) -> str:
    """
    Process the user's message and return the assistant's response.
    """
    try:
        # Call the OpenAI API with the system message and messages list
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_message},
                *[{"role": "assistant" if i % 2 == 0 else "user", "content": msg} for i, msg in enumerate(messages)]
            ],
            temperature=0.7,
            max_tokens=150
        )
        assistant_response = response.choices[0].message.content
    except Exception as e:
        print(f"Error in creating chat completion: {e}")
        assistant_response = "I apologize, but I encountered an error while processing your request."
    
    return assistant_response

if __name__ == "__main__":
    # Test data
    test_meeting_description = "Discuss project milestones and deadlines."
    test_username = "Guido"
    
    messages = []
    system_message = generate_initial_prompt(test_meeting_description, test_username)
    print("Initial System Message:", system_message)

    # Generate initial assistant message
    initial_response = process_user_message(system_message, messages)
    messages.append(initial_response)
    print("Assistant:", initial_response)

    while True:
        user_input = input(f"{test_username}: ")
        if user_input.lower() in ['exit', 'quit', 'bye']:
            break
        
        messages.append(user_input)
        assistant_response = process_user_message(system_message, messages)
        messages.append(assistant_response)
        print("Assistant:", assistant_response)
        
        if "{{final_summary}}" in assistant_response:
            break

    print("Conversation ended.")
