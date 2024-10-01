import os
from dotenv import load_dotenv
from fastapi import UploadFile, HTTPException
from fastapi.responses import FileResponse
from openai import OpenAI
from typing import List, Dict
import json
import io
import tempfile
from starlette.background import BackgroundTask

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI client using the API key from environment variable
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_initial_prompt(meeting_title: str, meeting_description: str, username: str) -> str:
    """
    Generate the initial system message for the meeting preparation.
    """
    return f"""You are an assistant that prepares the following meeting:
Title: {meeting_title}
Description: {meeting_description}
Help user {username} clarify their personal agenda  for the meeting. 
Update the agenda and refine it, while taking to the user. Make sure the agenda is concrete and specific.
Ask the user questions to clarify their agenda and make it concrete, so that the meeting can be more productive.
Always be concise and to the point. Just one question at a time.
You can always output the updated agenda as 

<agenda>
"item1", "item2", "item3", ...
</agenda>

As soon as the user is happy with the agenda, output the agenda again. On top, output a #EOC# as marker that
the systems knows the conversation is over.

and say goodbye."""


def process_user_message(system_message: str, messages: List[str]) -> Dict[str, str]:
    """
    Process the user's message and return the assistant's response along with the agenda if present.
    """
    try:
        # Debug: Print input messages
        print("Debug: System message:", system_message)
        print("Debug: Input messages:", messages)

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

        # Debug: Print raw assistant response
        print("Debug: Raw assistant response:", assistant_response)

        # Parse agenda if present
        agenda = None
        if "<agenda>" in assistant_response and "</agenda>" in assistant_response:
            agenda_start = assistant_response.index("<agenda>") + len("<agenda>")
            agenda_end = assistant_response.index("</agenda>")
            agenda_str = assistant_response[agenda_start:agenda_end].strip()
            
            # Debug: Print agenda string before parsing
            print("Debug: Agenda string before parsing:", agenda_str)
            
            agenda = json.loads(f"[{agenda_str}]")
            
            # Remove the agenda from the assistant's response
            #assistant_response = assistant_response[:agenda_start-len("<agenda>")] + assistant_response[agenda_end+len("</agenda>"):]
        
        # Remove #EOC# marker from the response
        assistant_response = assistant_response.replace("#EOC#", "").strip()
        
        # Debug: Print final processed response and agenda
        print("Debug: Processed response:", assistant_response)
        print("Debug: Processed agenda:", agenda)

        return {
            "response": assistant_response,
            "agenda": agenda,
            "conversation_ended": "#EOC#" in response.choices[0].message.content
        }
    except Exception as e:
        # Debug: Print full exception details
        import traceback
        print(f"Debug: Full exception details:\n{traceback.format_exc()}")
        return {
            "response": "I apologize, but I encountered an error while processing your request.",
            "agenda": None,
            "conversation_ended": False
        }

if __name__ == "__main__":
    # Test data
    test_meeting_description = "Daily Scrum Meeting. Everybody should be prepared to talk about their progress and any issues they are facing."
    test_username = "Guido"
    
    messages = []
    system_message = generate_initial_prompt(test_meeting_description, test_username)
    print("Initial System Message:", system_message)

    # Generate initial assistant message
    initial_response = process_user_message(system_message, messages)

    assistant_response = initial_response["response"]
    agenda = initial_response["agenda"]
    conversation_ended = initial_response["conversation_ended"]  # Add this line
    messages.append(assistant_response)
    print("Assistant:", assistant_response)
    if agenda:
        print("Updated Agenda:", agenda)
        
    while True:
        user_input = input(f"{test_username}: ")
        if user_input.lower() in ['exit', 'quit', 'bye']:
            break
        
        messages.append(user_input)
        result = process_user_message(system_message, messages)
        assistant_response = result["response"]
        agenda = result["agenda"]
        conversation_ended = result["conversation_ended"]  # Add this line
        messages.append(assistant_response)
        print("Assistant:", assistant_response)
        if agenda:
            print("Updated Agenda:", agenda)
        
        if conversation_ended:  # Replace the <final_agenda> check with this
            break

    print("Conversation ended.")

async def convert_audio_to_text(audio_file: UploadFile):
    """
    Convert an uploaded audio file to text using OpenAI's Whisper model.
    """
    try:
        # Read the file content
        file_content = await audio_file.read()
        
        # Create a file-like object from the content
        audio_file_obj = io.BytesIO(file_content)
        audio_file_obj.name = audio_file.filename  # Set the filename

        # Call the OpenAI API to transcribe the audio
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file_obj,
            response_format="text"
        )

        return transcript
    except Exception as e:
        print(f"Error in audio transcription: {str(e)}")
        return None

async def convert_text_to_audio(text: str, voice: str = "alloy"):
    """
    Convert text to audio using OpenAI's text-to-speech API and return a FastAPI FileResponse.
    
    :param text: The text to convert to speech
    :param voice: The voice to use (default is "alloy")
    :return: A FastAPI FileResponse containing the audio file
    """
    try:
        response = client.audio.speech.create(
            model="tts-1",
            voice=voice,
            input=text
        )
        
        # Create a temporary file to store the audio content
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:
            temp_file.write(response.content)
            temp_file_path = temp_file.name

        # Return a FileResponse
        return FileResponse(
            path=temp_file_path,
            media_type="audio/mpeg",
            filename="speech.mp3",
            background=BackgroundTask(lambda: os.unlink(temp_file_path))
        )
    except Exception as e:
        print(f"Error in text-to-speech conversion: {str(e)}")
        raise HTTPException(status_code=500, detail="Text-to-speech conversion failed")
