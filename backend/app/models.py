from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, Table
from sqlalchemy.orm import relationship
from .database import Base

# Add this association table
user_meeting = Table('user_meeting', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('meeting_id', Integer, ForeignKey('meetings.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)

    # Update this relationship
    meetings = relationship("Meeting", secondary=user_meeting, back_populates="users")
    conversations = relationship("Conversation", back_populates="user")

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    date = Column(DateTime)
    meeting_type = Column(String)  # Change this to a String column


    # Add this relationship
    users = relationship("User", secondary="user_meeting", back_populates="meetings")
    # Add this relationship
    conversations = relationship("Conversation", back_populates="meeting")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    system_prompt = Column(String, default="Test", nullable=True)
    finished = Column(Boolean, default=False)

    user = relationship("User", back_populates="conversations")
    meeting = relationship("Meeting", back_populates="conversations")
    chat_messages = relationship("ChatMessage", back_populates="conversation")  # Changed from 'messages' to 'chat_messages'
    meeting_agenda = relationship("MeetingAgenda", back_populates="conversation")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String)
    author = Column(String)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    conversation_id = Column(Integer, ForeignKey("conversations.id"))

    conversation = relationship("Conversation", back_populates="chat_messages")

class MeetingAgenda(Base):
    __tablename__ = "meeting_agendas"

    id = Column(Integer, primary_key=True, index=True)
    agenda_item = Column(String)
    completed = Column(Boolean, default=False)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))

    conversation = relationship("Conversation", back_populates="meeting_agenda")



