from pydantic import BaseModel
from datetime import datetime

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    
    class Config:
        orm_mode = True

class MeetingBase(BaseModel):
    title: str
    description: str | None = None
    date: datetime
    user_id: int

class MeetingCreate(MeetingBase):
    pass

class Meeting(MeetingBase):
    id: int
    
    class Config:
        orm_mode = True

class UserWithMeetings(User):
    meetings: list[Meeting] = []

class MeetingWithUser(Meeting):
    user: User

class ChatMessage(BaseModel):
    id: int
    message: str
    user_id: int
    meeting_id: int
    timestamp: datetime

class ChatMessageCreate(BaseModel):
    message: str
