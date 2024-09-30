from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import schemas
from ..database import get_db

router = APIRouter()

# User CRUD endpoints
@router.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

@router.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/users/{user_id}", response_model=schemas.UserWithMeetings)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.update_user(db, user_id=user_id, user=user)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.delete("/users/{user_id}", response_model=schemas.User)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.delete_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# Meeting CRUD endpoints
@router.post("/meetings/", response_model=schemas.Meeting)
def create_meeting(meeting: schemas.MeetingCreate, db: Session = Depends(get_db)):
    return crud.create_meeting(db=db, meeting=meeting)

@router.get("/meetings/", response_model=List[schemas.Meeting])
def read_meetings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    meetings = crud.get_meetings(db, skip=skip, limit=limit)
    return meetings

@router.get("/meetings/{meeting_id}", response_model=schemas.MeetingWithUser)
def read_meeting(meeting_id: int, db: Session = Depends(get_db)):
    db_meeting = crud.get_meeting(db, meeting_id=meeting_id)
    if db_meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return db_meeting

@router.put("/meetings/{meeting_id}", response_model=schemas.Meeting)
def update_meeting(meeting_id: int, meeting: schemas.MeetingCreate, db: Session = Depends(get_db)):
    db_meeting = crud.update_meeting(db, meeting_id=meeting_id, meeting=meeting)
    if db_meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return db_meeting

@router.delete("/meetings/{meeting_id}", response_model=schemas.Meeting)
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    db_meeting = crud.delete_meeting(db, meeting_id=meeting_id)
    if db_meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return db_meeting
