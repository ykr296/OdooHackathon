    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile_to_response(target, profile)
@app.post("/attendance/check-in", response_model=AttendanceResponse)
def check_in(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    record = (
        db.query(Attendance)
        .filter(Attendance.user_id == user.id, Attendance.date == today)
        .first()
    )
    now = datetime.now().strftime("%H:%M:%S")
    if record and record.check_in:
        raise HTTPException(status_code=400, detail="Already checked in today")
    if not record:
        record = Attendance(user_id=user.id, date=today, status="present")
        db.add(record)
    record.check_in = now
    record.status = "present"
    db.commit()
    db.refresh(record)
    return AttendanceResponse.model_validate(record)
@app.post("/attendance/check-out", response_model=AttendanceResponse)
def check_out(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    record = (
        db.query(Attendance)
        .filter(Attendance.user_id == user.id, Attendance.date == today)
        .first()
    )
    if not record or not record.check_in:
        raise HTTPException(status_code=400, detail="Check in first before check out")
    if record.check_out:
        raise HTTPException(status_code=400, detail="Already checked out today")
    record.check_out = datetime.now().strftime("%H:%M:%S")
    db.commit()
    db.refresh(record)
    return AttendanceResponse.model_validate(record)
@app.get("/attendance/me", response_model=list[AttendanceResponse])
def my_attendance(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = (
        db.query(Attendance)
        .filter(Attendance.user_id == user.id)
        .order_by(Attendance.date.desc())
        .limit(30)
        .all()
    )
    return [AttendanceResponse.model_validate(r) for r in records]
@app.get("/attendance/all")
def all_attendance(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    records = db.query(Attendance).order_by(Attendance.date.desc()).limit(100).all()
    result = []
    for r in records:
        u = db.query(User).filter(User.id == r.user_id).first()
        result.append(
            {
                "id": r.id,
                "employee_name": u.name if u else "Unknown",
                "date": r.date,
                "check_in": r.check_in,
                "check_out": r.check_out,
                "status": r.status,
            }
        )
    return result
@app.post("/leave", response_model=LeaveResponse)
def apply_leave(
    body: LeaveCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.leave_type not in ("paid", "sick", "unpaid"):
        raise HTTPException(status_code=400, detail="Invalid leave type")
    if body.end_date < body.start_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")
    leave = LeaveRequest(
        user_id=user.id,
        leave_type=body.leave_type,
        start_date=body.start_date,
        end_date=body.end_date,
        remarks=body.remarks,
        status="pending",
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return leave_to_response(leave, user)
@app.get("/leave/me", response_model=list[LeaveResponse])
def my_leaves(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    leaves = (
        db.query(LeaveRequest)
        .filter(LeaveRequest.user_id == user.id)
        .order_by(LeaveRequest.id.desc())
        .all()
    )
    return [leave_to_response(l, user) for l in leaves]
@app.get("/leave/all", response_model=list[LeaveResponse])
def all_leaves(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    leaves = db.query(LeaveRequest).order_by(LeaveRequest.id.desc()).all()
    result = []
    for leave in leaves:
        user = db.query(User).filter(User.id == leave.user_id).first()
        result.append(leave_to_response(leave, user))
    return result
@app.put("/leave/{leave_id}", response_model=LeaveResponse)
def update_leave(
    leave_id: int,
    body: LeaveUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if body.status not in ("approved", "rejected", "pending"):
        raise HTTPException(status_code=400, detail="Invalid status")
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    leave.status = body.status
    leave.admin_comment = body.admin_comment
    db.commit()
    db.refresh(leave)
    user = db.query(User).filter(User.id == leave.user_id).first()
    return leave_to_response(leave, user)
@app.get("/employees", response_model=list[UserResponse])
def list_employees(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).filter(User.role == "employee").all()
    return [UserResponse.model_validate(u) for u in users]
