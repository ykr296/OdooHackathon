| **Backend** | Stores data, login, attendance, leave |
| **Frontend** | Login page, dashboards, buttons |
| **Database** | SQLite file (`dayflow.db`) — auto-created |
---
## STEP 1 — Open 2 terminals
You need **2 terminal windows** open at the same time:
- **Terminal 1** → Backend (Python)
- **Terminal 2** → Frontend (React)
---
## STEP 2 — Start the Backend (Terminal 1)
Copy-paste these commands **one by one**:
```powershell
cd C:\Users\kushalkumar\Projects\dayflow\backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```
**Success looks like:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```
Open in browser: **http://localhost:8000/docs**  
You should see API documentation (Swagger UI).
**Leave this terminal running. Do NOT close it.**
---
## STEP 3 — Start the Frontend (Terminal 2)
Open a **new** terminal and run:
```powershell
cd C:\Users\kushalkumar\Projects\dayflow\frontend
npm install
npm run dev
```
**Success looks like:**
```
  Local:   http://localhost:5173/
```
Open in browser: **http://localhost:5173**
**Leave this terminal running too.**
---
## STEP 4 — Demo login accounts
| Role | Email | Password |
|------|-------|----------|
| **Admin / HR** | admin@dayflow.com | admin123 |
| **Employee** | emp1@dayflow.com | emp123 |
| **Employee** | emp2@dayflow.com | emp123 |
---
## STEP 5 — Hackathon demo (3 minutes)
Practice this flow **3 times** before presenting:
1. Login as **emp1@dayflow.com** / emp123
2. Go to **Attendance** → click **Check In**
3. Go to **Leave Requests** → apply Sick Leave (pick dates) → Submit
4. **Logout**
5. Login as **admin@dayflow.com** / admin123
6. Go to **Leave Approvals** → click **Approve**
7. **Logout**
8. Login as employee again → see leave **Approved**
9. Go to **Profile** → show salary
---
## Team of 2 — Who does what?
| Person | Job | Folder |
|--------|-----|--------|
| **Person A** | Backend, API, database | `backend/` |
| **Person B** | Frontend, UI, pages | `frontend/` |
**Both of you:** Run the app together and rehearse the demo.
---
## Simple learning map
### What is React?
- Makes web pages interactive (buttons, forms, pages)
- Files in `frontend/src/pages/` = each screen
### What is Python FastAPI?
- Handles requests from React (login, save data)
- Files in `backend/` = API logic
### How they talk
```
Browser (React)  --HTTP-->  Python (FastAPI)  -->  SQLite DB
   :5173                        :8000
```
Example: When you click "Check In", React calls:
```
POST http://localhost:8000/attendance/check-in
```
---
## If something breaks
### Backend won't start
```powershell
cd C:\Users\kushalkumar\Projects\dayflow\backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```
### Frontend won't start (npm error)
Try:
```powershell
npm install --use-system-ca
```
Or:
```powershell
set NODE_OPTIONS=--use-system-ca
npm install
```
### "Network error" on login
- Backend must be running on port 8000
- Check http://localhost:8000/docs opens
### "Invalid email or password"
- Use exact demo accounts above
---
## What to tell judges
> "Dayflow is an HR Management System. Employees check in, apply for leave, and view their profile. HR admins approve leaves and view all employees. Built with React frontend, Python FastAPI backend, and SQLite database with role-based access control."
---
## Optional improvements (if you have extra time)
1. Add company logo on login page
2. Add profile picture upload
3. Better colors / fonts
4. Show pending leave count on admin dashboard
---
## File guide (where things live)
| File | Purpose |
|------|---------|
| `backend/main.py` | All API routes |
| `backend/models.py` | Database tables |
| `frontend/src/App.jsx` | All page routes |
| `frontend/src/pages/Login.jsx` | Login screen |
| `frontend/src/pages/employee/*` | Employee screens |
| `frontend/src/pages/admin/*` | Admin screens |
