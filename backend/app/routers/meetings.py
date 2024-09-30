from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.routers.users import get_user
from app.ai_manager import generate_initial_prompt, process_user_message
from .. import schemas
from ..database import get_db
from ..models import Conversation, Meeting, ChatMessage, MeetingAgenda
from ..util.openai import init_conversation, generate_response

import logging

logger = logging.getLogger(__name__)

router = APIRouter()

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
        for agenda_item in assistant_response["agenda"]:
            db_conversation.meeting_agenda.append(MeetingAgenda(
                agenda_item=agenda_item,
                completed=False
            ))

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

@router.get("/meetings/{meeting_id}", response_model=schemas.MeetingSchema)

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
    return db_conversation

@router.post("/meetings/{meeting_id}/{user_id}/conversation/message", response_model=schemas.Conversation)
def router_add_message(meeting_id: int, user_id: int, message: str, db: Session = Depends(get_db)):
    return add_message(db, meeting_id=meeting_id, user_id=user_id, message=ChatMessage(message=message, author="user", timestamp=datetime.now()))




