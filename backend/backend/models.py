from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String)  # "admin" or "employee"
    name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    profile = relationship("Profile", back_populates="user", uselist=False)
    attendance_records = relationship("Attendance", back_populates="user")
    leave_requests = relationship("LeaveRequest", back_populates="user")
class Profile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    phone = Column(String, default="")
    address = Column(String, default="")
    job_title = Column(String, default="Software Engineer")
    department = Column(String, default="Engineering")
    salary = Column(Float, default=50000.0)
    user = relationship("User", back_populates="profile")
class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, index=True)
    check_in = Column(String, nullable=True)
    check_out = Column(String, nullable=True)
    status = Column(String, default="absent")  # present, absent, half-day, leave
    user = relationship("User", back_populates="attendance_records")
class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    leave_type = Column(String)  # paid, sick, unpaid
    start_date = Column(Date)
    end_date = Column(Date)
    remarks = Column(Text, default="")
    status = Column(String, default="pending")  # pending, approved, rejected
    admin_comment = Column(Text, default="")
    user = relationship("User", back_populates="leave_requests")
