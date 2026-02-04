from pydantic import BaseModel, conint, validator
from typing import Optional
from datetime import date, time, datetime

class AttendanceCheckIn(BaseModel):
    center_id: str
    latitude: float
    longitude: float

class AttendanceCheckOut(BaseModel):
    center_id: str
    latitude: float
    longitude: float

class AttendanceOut(BaseModel):
    id: str
    user_id: str
    center_id: str
    date: date
    check_in_time: Optional[datetime]
    check_in_latitude: Optional[float]
    check_in_longitude: Optional[float]
    check_in_location_valid: bool
    check_out_time: Optional[datetime]
    check_out_latitude: Optional[float]
    check_out_longitude: Optional[float]
    check_out_location_valid: bool
    status: str
    remarks: Optional[str]

    class Config:
        orm_mode = True