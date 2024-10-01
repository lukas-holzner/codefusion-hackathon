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

class MeetingBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: datetime
    meeting_type: str  # Change this to a string
    


class Meeting(MeetingBase):
    id: int

    class Config:
        from_attributes = True

class MeetingCreate(MeetingBase):
    pass

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
    system_prompt: str = "EMPTY"
    finished: bool = False

class ConversationStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"

class MeetingStatusUser(BaseModel):
    conversation_status: ConversationStatus
    meeting: Meeting





