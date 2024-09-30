from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import schemas
from ..database import get_db
from ..models import Meeting

router = APIRouter()

# Meeting CRUD operations
def get_meeting(db: Session, meeting_id: int):
    return db.query(Meeting).filter(Meeting.id == meeting_id).first()

def get_meetings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Meeting).offset(skip).limit(limit).all()

def create_meeting(db: Session, meeting: schemas.MeetingCreate):
    db_meeting = Meeting(**meeting.dict())
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

@router.get("/meetings/{meeting_id}", response_model=schemas.MeetingWithUser)
def read_meeting(meeting_id: int, db: Session = Depends(get_db)):
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

@router.delete("/meetings/{meeting_id}", response_model=schemas.Meeting)
def delete_meeting_route(meeting_id: int, db: Session = Depends(get_db)):
    db_meeting = delete_meeting(db, meeting_id=meeting_id)
    if db_meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return db_meeting
