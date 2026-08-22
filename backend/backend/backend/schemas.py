from datetime import date
from typing import Optional
from pydantic import BaseModel, EmailStr
class SignupRequest(BaseModel):
    employee_id: str
    email: EmailStr
    password: str
    role: str  # admin or employee
    name: str
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
class UserResponse(BaseModel):
    id: int
    employee_id: str
    email: str
    role: str
    name: str
    class Config:
        from_attributes = True
class TokenResponse(BaseModel):
    token: str
    user: UserResponse
class ProfileResponse(BaseModel):
    user_id: int
    name: str
    email: str
    employee_id: str
    phone: str
    address: str
    job_title: str
    department: str
    salary: float
class ProfileUpdate(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    salary: Optional[float] = None
class AttendanceResponse(BaseModel):
    id: int
    date: date
    check_in: Optional[str]
    check_out: Optional[str]
    status: str
    class Config:
        from_attributes = True
class LeaveCreate(BaseModel):
    leave_type: str
    start_date: date
    end_date: date
    remarks: str = ""
class LeaveUpdate(BaseModel):
    status: str
    admin_comment: str = ""
class LeaveResponse(BaseModel):
    id: int
    user_id: int
    employee_name: str
    leave_type: str
    start_date: date
    end_date: date
    remarks: str
    status: str
    admin_comment: str
    class Config:
        from_attributes = True
