from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os

from app.routers.users import get_user
from app.ai_manager import generate_initial_prompt, process_user_message, convert_audio_to_text
from .. import schemas
from ..database import get_db
from ..models import Conversation, Meeting, ChatMessage, MeetingAgenda
from ..util.openai import init_conversation, generate_response

import logging
import re

logger = logging.getLogger(__name__)

router = APIRouter()

AUDIO_MIME_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"]
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB in bytes

# Meeting CRUD operations
def get_meeting(db: Session, meeting_id: int):
    return db.query(Meeting).filter(Meeting.id == meeting_id).first()

def get_meetings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Meeting).offset(skip).limit(limit).all()

def get_conversation(db: Session, meeting_id: int, user_id: int) -> Conversation:
    return db.query(Conversation).filter(Conversation.meeting_id == meeting_id, Conversation.user_id == user_id).first()

def create_new_conversation(db: Session, meeting_id: int, user_id: int):
    db_conversation = Conversation(meeting_id=meeting_id, user_id=user_id, system_prompt="")
    db.add(db_conversation)
    db.commit() 

    db_conversation = get_conversation(db, meeting_id=meeting_id, user_id=user_id)
    
    logger.debug(f"Generating initial prompt for meeting_id: {meeting_id}, user_id: {user_id}")
    logger.debug(f"Meeting description: {db_conversation.meeting.description}")
    logger.debug(f"User username: {db_conversation.user.username}")
    
    prompt = generate_initial_prompt(db_conversation.meeting.title, db_conversation.meeting.description, db_conversation.user.username)
    logger.debug(f"Generated initial prompt: {prompt}")
    
    db_conversation.system_prompt = prompt
    initial_message = process_user_message(prompt, [])
    logger.debug(f"Initial AI response: {initial_message['response']}")

    db_conversation.chat_messages = [ChatMessage(message=initial_message["response"], author="assistant", timestamp=datetime.now())]
    db.add(db_conversation)
    db.commit() 
    db.refresh(db_conversation)
    return db_conversation

def update_conversation(db: Session, conversation: schemas.Conversation):
    db_conversation = get_conversation(db, meeting_id=conversation.meeting_id, user_id=conversation.user_id)
    db_conversation.chat_messages = conversation.chat_messages
    db_conversation.meeting_agenda = conversation.meeting_agenda
    db.commit()
    db.refresh(db_conversation)
    return db_conversation

def add_message(db: Session, meeting_id: int, user_id: int, message: schemas.ChatMessage):
    db_conversation = get_conversation(db, meeting_id=meeting_id, user_id=user_id)
    if db_conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db_conversation.chat_messages.append(message)

    # Convert chat_messages to a list of strings
    chat_history = [msg.message for msg in db_conversation.chat_messages]

    assistant_response = process_user_message(db_conversation.system_prompt, chat_history)

    # Add the assistant's response as a new ChatMessage
    db_conversation.chat_messages.append(ChatMessage(
        message=assistant_response["response"],
        author="assistant",
        timestamp=datetime.now()
    ))

    # Create MeetingAgenda objects only if agenda exists and is not empty
    if "agenda" in assistant_response and assistant_response["agenda"]:
        # Delete existing agenda items
        db.query(MeetingAgenda).filter(MeetingAgenda.conversation_id == db_conversation.id).delete()
        
        # Add new agenda items
        for agenda_item in assistant_response["agenda"]:
            db_conversation.meeting_agenda.append(MeetingAgenda(
                agenda_item=agenda_item,
                completed=False
            ))

    if "conversation_ended" in assistant_response and assistant_response["conversation_ended"]:
        db_conversation.finished = True
        
    db.commit()
    db.refresh(db_conversation)
    return db_conversation
    

def create_meeting(db: Session, meeting: schemas.MeetingCreate):
    db_meeting = Meeting(**meeting.model_dump())
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

def update_meeting(db: Session, meeting_id: int, meeting: schemas.MeetingCreate):
    db_meeting = get_meeting(db, meeting_id)
    if db_meeting:
        for key, value in meeting.dict().items():
            setattr(db_meeting, key, value)
        db.commit()
        db.refresh(db_meeting)
    return db_meeting

def delete_meeting(db: Session, meeting_id: int):
    db_meeting = get_meeting(db, meeting_id)
    if db_meeting:
        db.delete(db_meeting)
        db.commit()
    return db_meeting 

# Meeting CRUD endpoints
@router.post("/meetings/", response_model=schemas.Meeting)
def create_meeting_route(meeting: schemas.MeetingCreate, db: Session = Depends(get_db)):
    return create_meeting(db=db, meeting=meeting)

@router.get("/meetings/", response_model=List[schemas.Meeting])
def read_meetings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    meetings = get_meetings(db, skip=skip, limit=limit)
    return meetings

@router.get("/meetings/by_user/{user_id}", response_model=List[schemas.MeetingStatusUser])
def read_meetings_by_user(user_id: int, db: Session = Depends(get_db)):
    status_meetings = []
    meetings = get_meetings(db)
    for meeting in meetings:
        conversation = get_conversation(db, meeting_id=meeting.id, user_id=user_id)
        if conversation is None:
            meeting_status = "todo"
        else:
            if conversation.finished:
                meeting_status = "done"
            else:
                meeting_status = "in_progress"
        status_meetings.append(schemas.MeetingStatusUser(conversation_status=meeting_status, meeting=meeting))
    return status_meetings

@router.get("/meetings/{meeting_id}", response_model=schemas.MeetingSchema)
def read_meeting_route(meeting_id: int, db: Session = Depends(get_db)):
    db_meeting = get_meeting(db, meeting_id=meeting_id)
    if db_meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return db_meeting

@router.put("/meetings/{meeting_id}", response_model=schemas.Meeting)
def update_meeting_route(meeting_id: int, meeting: schemas.MeetingCreate, db: Session = Depends(get_db)):
    db_meeting = update_meeting(db, meeting_id=meeting_id, meeting=meeting)
    if db_meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return db_meeting

@router.post("/meetings/{meeting_id}/add_user", response_model=schemas.MeetingSchema)
def add_user_to_meeting(meeting_id: int, user_id: int, db: Session = Depends(get_db)):
    db_meeting = get_meeting(db, meeting_id=meeting_id)
    if db_meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    db_user = get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    if db_user in db_meeting.users:
        raise HTTPException(status_code=400, detail="User already in meeting")
    
    db_meeting.users.append(db_user)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting


@router.delete("/meetings/{meeting_id}", response_model=schemas.Meeting)
def delete_meeting_route(meeting_id: int, db: Session = Depends(get_db)):
    db_meeting = delete_meeting(db, meeting_id=meeting_id)
    if db_meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return db_meeting


@router.get("/meetings/{meeting_id}/{user_id}/conversation", response_model=schemas.Conversation)
def create_conversation(meeting_id: int, user_id: int, db: Session = Depends(get_db)):
    if get_meeting(db, meeting_id=meeting_id) is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if get_user(db, user_id=user_id) is None:
        raise HTTPException(status_code=404, detail="User not found")   
    if get_conversation(db, meeting_id=meeting_id, user_id=user_id) is None:
        db_conversation = create_new_conversation(db, meeting_id=meeting_id, user_id=user_id)
    else:
        db_conversation = get_conversation(db, meeting_id=meeting_id, user_id=user_id)

    db_conversation.chat_messages = extract_and_format_agenda(db_conversation.chat_messages)
    return db_conversation

@router.post("/meetings/{meeting_id}/{user_id}/conversation/message", response_model=schemas.Conversation)
def router_add_message(meeting_id: int, user_id: int, message: str, db: Session = Depends(get_db)):
    ret = add_message(db, meeting_id=meeting_id, user_id=user_id, message=ChatMessage(message=message, author="user", timestamp=datetime.now()))

    ret.chat_messages = extract_and_format_agenda(ret.chat_messages)
    return ret

@router.post("/meetings/{meeting_id}/{user_id}/conversation/message_audio", response_model=schemas.Conversation)
async def router_add_message_audio(
    meeting_id: int, 
    user_id: int, 
    audio_file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    # Check file type
    if audio_file.content_type not in AUDIO_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Only audio files are allowed.")
    
    # Check file size
    file_size = await audio_file.read()
    await audio_file.seek(0)  # Reset file pointer to the beginning
    if len(file_size) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds the 5 MB limit.")

    audio_text = await convert_audio_to_text(audio_file)
    if audio_text is None:
        raise HTTPException(status_code=500, detail="Failed to transcribe audio file.")
    
    return router_add_message(meeting_id, user_id, audio_text, db)

@router.delete("/meetings/{meeting_id}/{user_id}/conversation", response_model=schemas.Conversation)
def delete_conversation(meeting_id: int, user_id: int, db: Session = Depends(get_db)):
    db_conversation = get_conversation(db, meeting_id=meeting_id, user_id=user_id)
    if db_conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(db_conversation)
    db.commit()
    return db_conversation

@router.post("/meetings/{meeting_id}/{user_id}/conversation/update_agenda", response_model=schemas.Conversation)
def update_agenda(
    meeting_id: int, 
    user_id: int, 
    agenda: List[schemas.MeetingAgenda], 
    db: Session = Depends(get_db)
):
    db_conversation = get_conversation(db, meeting_id=meeting_id, user_id=user_id)
    if db_conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Clear existing agenda items
    db_conversation.meeting_agenda.clear()
    
    # Create new MeetingAgenda objects and add them to the conversation
    for item in agenda:
        new_agenda_item = MeetingAgenda(
            agenda_item=item.agenda_item,
            completed=item.completed,
            conversation_id=db_conversation.id
        )
        db_conversation.meeting_agenda.append(new_agenda_item)
    
    db.commit()
    db.refresh(db_conversation)
    return db_conversation

def extract_and_format_agenda(messages):
    for message in messages:
        agenda_match = re.search(r'<agenda>(.*?)</agenda>', message.message, re.DOTALL)
        if agenda_match:
            agenda_content = agenda_match.group(1)
            agenda_items = [item.strip() for item in agenda_content.split(',')]
            formatted_agenda = '\n'.join(f"{i+1}. {item}" for i, item in enumerate(agenda_items))
            message.message = re.sub(r'<agenda>.*?</agenda>', formatted_agenda, message.message, flags=re.DOTALL)
    return messages