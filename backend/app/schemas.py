from pydantic import BaseModel
from datetime import datetime

class ItemBase(BaseModel):
    name: str
    description: str | None = None

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int

    class Config:
        orm_mode = True

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