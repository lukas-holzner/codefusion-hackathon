from enum import Enum
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class MeetingType(Enum):
    DAILY = "daily"
    RETRO = "retro"
    KICKOFF = "kickoff"

class MeetingBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: datetime
    meeting_type: MeetingType

class MeetingCreate(MeetingBase):
    pass

class Meeting(MeetingBase):
    id: int

    class Config:
        from_attributes = True

class UserSchema(User):
    meetings: List[Meeting] = []

class MeetingSchema(Meeting):
    users: List[User] = []

class ChatMessage(BaseModel):
    message: str
    author: str
    timestamp: datetime

class MeetingAgenda(BaseModel):
    agenda_item: str
    completed: bool

class Conversation(BaseModel):
    user_id: int
    meeting_id: int
    chat_messages: list[ChatMessage] = []
    meeting_agenda: list[MeetingAgenda] = []





