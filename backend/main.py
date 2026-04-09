from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from scraper import BUEScraper
import uuid
import re
import hashlib
import secrets
import os
import base64
import json
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8080", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    username: str
    password: str

class LogoutRequest(BaseModel):
    token: str

# In-memory session store (simplistic for MVP)
# Key: token, Value: BUEScraper instance
sessions = {}

def _get_share_fernet():
    try:
        from cryptography.fernet import Fernet
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Share system not configured (missing cryptography dependency)"
        )

    # Use a default secret for development if env var is missing
    secret = os.getenv("BUEWRAP_SHARE_SECRET", "dev-fallback-secret-key-change-in-prod-v1").strip()
    
    # Derive a 32-byte key from the secret string
    key = base64.urlsafe_b64encode(hashlib.sha256(secret.encode("utf-8")).digest())
    return Fernet(key)

def _derive_password_hash(password: str, salt_b64: str) -> str:
    salt = base64.urlsafe_b64decode(salt_b64.encode("utf-8"))
    dk = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt,
        n=2**14,
        r=8,
        p=1,
        dklen=32,
    )
    return base64.urlsafe_b64encode(dk).decode("utf-8")

def _build_share_payload(summary_data: dict, expires_in_seconds: int, password: str | None) -> dict:
    now = int(time.time())
    exp = now + int(expires_in_seconds)
    now_ms = int(time.time() * 1000)

    payload: dict = {
        "v": 1,
        "exp": exp,
        "iat": now, # Issued At - helps debugging and uniqueness
        "iat_ms": now_ms,
        "nonce": secrets.token_urlsafe(32),
        "data": summary_data,
    }

    if password:
        salt = secrets.token_bytes(16)
        salt_b64 = base64.urlsafe_b64encode(salt).decode("utf-8")
        payload["pwd"] = {
            "salt": salt_b64,
            "hash": _derive_password_hash(password, salt_b64),
        }

    return payload

def _encrypt_share_token(payload: dict) -> str:
    f = _get_share_fernet()
    # Sort keys for consistent serialization, but nonce ensures uniqueness
    raw = json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return f.encrypt(raw).decode("utf-8")

def _decrypt_share_token(token: str) -> dict:
    f = _get_share_fernet()
    try:
        raw = f.decrypt(token.encode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or corrupted share token")

    try:
        payload = json.loads(raw.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid share token payload")

    if not isinstance(payload, dict) or payload.get("v") != 1:
        raise HTTPException(status_code=400, detail="Unsupported share token")

    exp = payload.get("exp")
    if not isinstance(exp, int):
        raise HTTPException(status_code=400, detail="Invalid share token payload")

    if int(time.time()) > exp:
        raise HTTPException(status_code=410, detail="Share link has expired")

    return payload

# Grade to numeric conversion
GRADE_TO_NUMERIC = {
    'A+': 100, 'A': 95, 'A-': 90,
    'B+': 85, 'B': 80, 'B-': 75,
    'C+': 70, 'C': 65, 'C-': 60,
    'D+': 55, 'D': 50, 'F': 0, 'Fail': 0
}

GRADE_RANK = {
    'A+': 12, 'A': 11, 'A-': 10,
    'B+': 9, 'B': 8, 'B-': 7,
    'C+': 6, 'C': 5, 'C-': 4,
    'D+': 3, 'D': 2, 'F': 1, 'Fail': 0
}

def get_clean_course_name(course):
    """Extract clean display name from course data"""
    name = course.get('name', '').strip()
    raw_name = course.get('raw_name', '').strip()
    code = course.get('code', '').strip()

    # If name is empty, try raw_name
    if not name:
        name = raw_name

    # Helper to check if a string looks like a code (e.g. "25CPES101" or "CS101")
    def is_code_like(s):
        if not s: return False
        return bool(re.match(r'^[A-Z0-9]{3,15}$', s.strip()))

    # If the current name looks just like a code (and we have a better raw_name), use raw_name
    if is_code_like(name) and raw_name and not is_code_like(raw_name):
        name = raw_name
    
    # Cleaning patterns to remove code from start of name
    # e.g. "25CPES101: Electric Circuits" -> "Electric Circuits"
    patterns = [
        r'^\[([A-Z0-9]{2,15})\]\s*(.+)$',       # [CODE] Name
        r'^\(([A-Z0-9]{2,15})\)\s*(.+)$',       # (CODE) Name
        r'^([A-Z0-9]{3,15})\s*[:\-\s]\s*(.+)$', # CODE: Name or CODE - Name or CODE Name
    ]

    extracted_code = None
    clean_name = name

    for pattern in patterns:
        match = re.match(pattern, name, re.IGNORECASE)
        if match:
            # We found a code-like prefix
            # Check if group 1 looks like a code
            possible_code = match.group(1).strip()
            rest = match.group(2).strip()
            
            # If extracting this prefix leaves us with something substantial
            if len(rest) > 2:
                if not code:
                    extracted_code = possible_code
                clean_name = rest
                break
    
    # If we didn't find a code in the name, but we have one from the object
    if not extracted_code:
        extracted_code = code

    # Final Fallback: If clean_name is STILL just the code, and we have nothing else
    if is_code_like(clean_name):
        # Check if raw_name helps
        if raw_name and not is_code_like(raw_name):
             # Try to clean raw_name
             for pattern in patterns:
                match = re.match(pattern, raw_name, re.IGNORECASE)
                if match:
                    clean_name = match.group(2).strip()
                    break
             else:
                 clean_name = raw_name

    # If we still have a code-like name, and we have a code, just return the code-like name (don't append)
    if is_code_like(clean_name) and extracted_code:
        # Avoid "25CPES101 (25CPES101)"
        if clean_name.replace(" ", "").upper() == extracted_code.replace(" ", "").upper():
            return clean_name
            
    # Assemble result
    if extracted_code:
        # Normalize for check
        c_name = clean_name.replace(" ", "").upper()
        c_code = extracted_code.replace(" ", "").upper()
        
        # If code is already in name, just return cleaned name (maybe fix format?)
        if c_code in c_name:
             # Try to normalize it to [CODE] Name if we can find the parts
             return clean_name
            
        # Requested Format: [CODE] Name
        return f"[{extracted_code}] {clean_name}"

    return clean_name

def parse_grade_value(grade_str):
    """Convert grade string to numeric value (0-100)"""
    if not grade_str:
        return None
    
    grade_str = str(grade_str).strip()
    
    # Letter grade
    if grade_str in GRADE_TO_NUMERIC:
        return GRADE_TO_NUMERIC[grade_str]
    
    # Numeric with denominator: "8.00 / 10.00" or "85 / 100"
    if '/' in grade_str:
        parts = grade_str.split('/')
        try:
            num = float(parts[0].strip())
            den = float(parts[1].strip())
            if den > 0:
                return (num / den) * 100
        except:
            pass
    
    # Plain numeric
    try:
        val = float(grade_str)
        if 0 <= val <= 100:
            return val
    except:
        pass
    
    return None

def get_grade_rank(grade_str):
    """Get ranking for grade comparison (higher is better)"""
    if not grade_str:
        return -1
    grade_str = str(grade_str).strip()
    if grade_str in GRADE_RANK:
        return GRADE_RANK[grade_str]
    # For numeric grades, convert to rank
    val = parse_grade_value(grade_str)
    if val is not None:
        if val >= 90: return 12
        if val >= 85: return 11
        if val >= 80: return 10
        if val >= 75: return 9
        if val >= 70: return 8
        if val >= 65: return 7
        if val >= 60: return 6
        if val >= 55: return 5
        if val >= 50: return 4
        return 1
    return -1

def calculate_estimated_gpa(percentage):
    """Estimate GPA from percentage (0-100)"""
    if percentage >= 90: return 4.0
    if percentage >= 85: return 3.7
    if percentage >= 80: return 3.3
    if percentage >= 75: return 3.0
    if percentage >= 70: return 2.7
    if percentage >= 65: return 2.3
    if percentage >= 60: return 2.0
    if percentage >= 56: return 1.7
    if percentage >= 53: return 1.3
    if percentage >= 50: return 1.0
    return 0.0

def compute_wrap_metrics(data):
    """Compute all wrap metrics from scraped data"""
    courses = data.get('courses', [])
    srs_data = data.get('srs_data', {})

    def _is_submitted_like(status, grade):
        if grade:
            return True
        s = str(status or "").strip().lower()
        if not s:
            return False
        if s in ['submitted', 'graded', 'late', 'overdue', 'completed', 'complete', 'done', 'finished']:
            return True
        if 'not submitted' in s:
            return False
        if 'submit' in s or 'grade' in s or 'overdue' in s or 'late' in s or 'attempt' in s:
            return True
        return False
    
    # Initialize metrics
    total_courses = len(courses)
    graded_courses = 0
    graded_items = 0
    submitted_items = 0
    total_items = 0
    activities_per_course = {}
    a_plus_count = 0
    grade_values = []
    
    # Track courses for best/worst determination
    # List of tuples: (rank, value, activity_count, course_obj)
    ranked_courses = []

    most_active_course = None
    most_active_count = 0
    most_active_code = ""
    
    DEBUG_WRAP = True

    for course in courses:
        course_name = get_clean_course_name(course)
        course_code = course.get('code', '')
        
        # Analyze content for submission status
        content = course.get('content', [])
        course_total_items = len(content)
        total_items += course_total_items
        
        course_submitted = 0
        
        print(f"LOG: [Metrics] analyzing course: {course_name} ({course_code})")
        
        for item in content:
            # Check explicit status from scraper or fallback to having a grade
            status = item.get('status', 'pending')
            grade = item.get('grade')
            item_name = item.get('name', 'Unknown')
            item_type = item.get('type', 'unknown')

            is_submitted = _is_submitted_like(status, grade)
            reason = "Submitted-like" if is_submitted else "Pending/No Grade"
            
            if is_submitted:
                course_submitted += 1
                if DEBUG_WRAP:
                    print(f"LOG: [Metrics]   [+] COUNTED: {item_name} ({item_type}) | Reason: {reason}")
            else:
                if DEBUG_WRAP:
                    print(f"LOG: [Metrics]   [-] SKIPPED: {item_name} ({item_type}) | Reason: {reason} | Status={status}")

        submitted_items += course_submitted
        activities_per_course[course_code or course_name] = course_submitted
        
        # Track most active (by submissions)
        if course_submitted > most_active_count:
            most_active_count = course_submitted
            most_active_course = course_name
            most_active_code = course_code
        
        # Process grades
        all_grades = course.get('all_grades', {})
        course_has_grade = False
        course_best_rank = -1
        course_best_grade = None
        
        for item_name, grade in all_grades.items():
            grade_str = str(grade).strip()
            graded_items += 1
            course_has_grade = True
            
            # Count A+
            if grade_str in ['A+', 'A']:
                a_plus_count += 1
            
            # Parse numeric value
            numeric = parse_grade_value(grade_str)
            if numeric is not None:
                grade_values.append(numeric)
            
            # Track best grade in this course
            rank = get_grade_rank(grade_str)
            if rank > course_best_rank:
                course_best_rank = rank
                course_best_grade = grade_str
        
        if course_has_grade:
            graded_courses += 1
            # Add to ranked list for global sorting
            # Use max grade rank as primary sort, activity count as secondary
            ranked_courses.append({
                'name': course_name,
                'code': course_code,
                'grade': course_best_grade,
                'rank': course_best_rank,
                'activities': course_submitted,
                'raw_course': course
            })
            
    # --- BEST / WORST Logic ---
    # Sort by Rank (DESC), then Activities (DESC)
    ranked_courses.sort(key=lambda x: (x['rank'], x['activities']), reverse=True)
    
    best_course = None
    worst_course = None
    
    if ranked_courses:
        # Best is the first one
        top = ranked_courses[0]
        best_course = {
            'name': top['name'],
            'code': top['code'],
            'grade': top['grade'],
            'activities': top['activities']
        }
        
        # Worst is the last one
        # But we must ensure Best != Worst
        if len(ranked_courses) > 1:
            bottom = ranked_courses[-1]
            worst_course = {
                'name': bottom['name'],
                'code': bottom['code'],
                'grade': bottom['grade'],
                'activities': bottom['activities']
            }
            
            # If they are still the same (e.g. duplicates or logic error), walk up the list
            if worst_course['name'] == best_course['name']:
                for i in range(len(ranked_courses) - 2, 0, -1):
                    cand = ranked_courses[i]
                    if cand['name'] != best_course['name']:
                        worst_course = {
                            'name': cand['name'],
                            'code': cand['code'],
                            'grade': cand['grade'],
                            'activities': cand['activities']
                        }
                        break
    
    
    # Calculate A+ percentage
    a_plus_percentage = round((a_plus_count / total_courses) * 100) if total_courses > 0 else 0
    
    # Calculate average grade
    avg_grade = sum(grade_values) / len(grade_values) if grade_values else 0
    
    # Determine GPA (SRS or Calculated Fallback)
    final_gpa = srs_data.get('gpa')
    if not final_gpa or final_gpa == '0.0' or final_gpa == '0':
        estimated = calculate_estimated_gpa(avg_grade)
        final_gpa = f"{estimated:.2f}"
    
    # Calculate Grade Energy Score
    # Formula: (A+ count * 25) + (graded items * 10) + (average grade percent * 0.6)
    grade_energy_score = round((a_plus_count * 25) + (graded_items * 10) + (avg_grade * 0.6))
    
    # Calculate Consistency Ribbon width
    # Formula: (graded items * 5) + (submitted items * 3)
    # Submission is key for consistency
    ribbon_width = (graded_items * 5) + (submitted_items * 3)
    ribbon_width = min(ribbon_width, 100)  # Cap at 100%
    
    # Determine Academic Persona
    persona = determine_persona(
        a_plus_count=a_plus_count,
        graded_items=graded_items,
        total_courses=total_courses,
        avg_grade=avg_grade,
        activities_total=submitted_items # Use submitted count for persona
    )
    
    # Build wrap data
    wrap_data = {
        'profile': {
            'name': srs_data.get('student_name') or data.get('profile', {}).get('name', 'Student'),
            'id': srs_data.get('student_id', ''),
            'email': srs_data.get('bue_email', ''),
            'faculty': srs_data.get('faculty', 'BUE Student'),
            'picture': srs_data.get('profile_picture', ''),
            'gpa': str(final_gpa),
            'cgpa': srs_data.get('cgpa', ''),
            'gender': srs_data.get('gender') or None,
        },
        'metrics': {
            'totalCourses': total_courses,
            'gradedCourses': graded_courses,
            'gradedItems': graded_items,
            'submittedItems': submitted_items,
            'totalAvailableItems': total_items,
            'activitiesTotal': submitted_items, # Maintain backward compatibility naming but use submitted
            'activitiesPerCourse': activities_per_course,
            'aPlusCount': a_plus_count,
            'aPlusPercentage': a_plus_percentage,
            'averageGrade': round(avg_grade, 1),
            'gradeEnergyScore': grade_energy_score,
            'ribbonWidth': ribbon_width
        },
        'bestCourse': best_course,
        'worstCourse': worst_course,
        'mostActiveCourse': {
            'name': most_active_course or 'N/A',
            'code': most_active_code,
            'activities': most_active_count
        },
        'persona': persona,
        'elearning': {
            'courses': [
                {
                    'code': c.get('code', ''),
                    'name': get_clean_course_name(c),
                    'modules': [
                        {
                            'courseCode': c.get('code', ''),
                            'courseName': get_clean_course_name(c),
                            'moduleName': i.get('name', 'Unknown'),
                            'type': i.get('type', ''),
                            'status': i.get('status', 'pending'),
                            'grade': i.get('grade'),
                            'url': i.get('url', ''),
                        }
                        for i in c.get('content', [])
                    ],
                }
                for c in courses
            ]
        },
        'courses': [
            {
                'name': get_clean_course_name(c),
                'code': c.get('code', ''),
                'activities': len(c.get('content', [])),
                'submitted': sum(1 for i in c.get('content', []) if _is_submitted_like(i.get('status'), i.get('grade'))),
                'grades': c.get('all_grades', {})
            }
            for c in courses
        ]
    }
    
    return wrap_data

def determine_persona(a_plus_count, graded_items, total_courses, avg_grade, activities_total):
    """Determine academic persona based on performance patterns"""
    
    # Perfect student: Extremely high A+ count
    if a_plus_count >= 8 or (graded_items > 0 and a_plus_count / max(graded_items, 1) >= 0.7):
        return {
            'name': 'The Academic Weapon',
            'description': 'You don\'t just ace exams, you obliterate them. Professors fear your power.',
            'emoji': '⚔️'
        }
    
    # High achiever: Many A+ grades
    if a_plus_count >= 5 or (graded_items > 0 and a_plus_count / max(graded_items, 1) >= 0.5):
        return {
            'name': 'The Overachiever',
            'description': 'Excellence is your baseline. You make A+ look easy.',
            'emoji': '🏆'
        }
    
    # Good grades with moderate A+
    if a_plus_count >= 3 and avg_grade >= 80:
        return {
            'name': 'The Grade Hunter',
            'description': 'Strategic and focused. You know exactly what it takes to win.',
            'emoji': '🎯'
        }
    
    # Very active with good performance
    if activities_total >= 30 and avg_grade >= 75:
        return {
            'name': 'The Grind Master',
            'description': 'Hustle culture personified. You submit assignments in your sleep.',
            'emoji': '💼'
        }
    
    # High activity count
    if activities_total >= 25:
        return {
            'name': 'The Workaholic',
            'description': 'Always busy, always submitting. Your laptop is your best friend.',
            'emoji': '💻'
        }
    
    # Consistent performer: Good average, steady grades
    if avg_grade >= 80 and graded_items >= 4:
        return {
            'name': 'The Steady Hand',
            'description': 'Reliable and consistent. You maintain solid performance across the board.',
            'emoji': '⚡'
        }
    
    # Moderate performance with decent activity
    if avg_grade >= 70 and activities_total >= 15:
        return {
            'name': 'The Balanced Student',
            'description': 'You know when to push and when to chill. Work-life balance achieved.',
            'emoji': '⚖️'
        }
    
    # Active learner with moderate grades
    if activities_total >= 20:
        return {
            'name': 'The Busy Bee',
            'description': 'Always engaged and curious. You dive deep into every course.',
            'emoji': '🐝'
        }
    
    # Mixed performance: Has both highs and lows
    if a_plus_count >= 2 and avg_grade < 75:
        return {
            'name': 'The Comeback Kid',
            'description': 'You have your moments of brilliance. Consistency is just a suggestion.',
            'emoji': '🎲'
        }
    
    # Has at least one A+ but low overall
    if a_plus_count >= 1 and avg_grade < 70:
        return {
            'name': 'The Wild Card',
            'description': 'Unpredictable but capable. You peak when it matters most.',
            'emoji': '🃏'
        }
    
    # Low activity, decent grades
    if activities_total < 10 and avg_grade >= 70:
        return {
            'name': 'The Minimalist',
            'description': 'Work smarter, not harder. You do just enough to succeed.',
            'emoji': '😎'
        }
    
    # Low activity and grades
    if activities_total < 10 and avg_grade < 65:
        return {
            'name': 'The Ghost',
            'description': 'Stealth mode activated. You appear only when absolutely necessary.',
            'emoji': '👻'
        }
    
    # Multiple courses
    if total_courses >= 6:
        return {
            'name': 'The Juggler',
            'description': 'Managing multiple courses with grace. Multitasking is your superpower.',
            'emoji': '🤹'
        }
    
    # Default
    return {
        'name': 'The Rising Star',
        'description': 'Your journey is just beginning. Great things await!',
        'emoji': '⭐'
    }

@app.post("/login")
def login(login_request: LoginRequest):
    scraper = BUEScraper()
    success, message = scraper.login(login_request.username, login_request.password)
    
    if success:
        token = str(uuid.uuid4())
        sessions[token] = scraper
        return {"token": token, "message": "Login successful"}
    else:
        raise HTTPException(status_code=401, detail=message)

@app.post("/logout")
def logout(request: LogoutRequest):
    if request.token in sessions:
        sessions.pop(request.token, None)
    return {"success": True}

@app.get("/wrap")
def get_wrap(token: str):
    scraper = sessions.get(token)
    if not scraper:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    raw_data = scraper.get_wrap_data()
    wrap_data = compute_wrap_metrics(raw_data)
    return wrap_data

class ShareCreateRequest(BaseModel):
    token: str
    wrap_data: dict
    expires_in_seconds: int | None = 7 * 24 * 60 * 60
    password: str | None = None

@app.post("/share/create")
def create_share_token(request: ShareCreateRequest):
    # Allow sharing without active session since data is provided in request
    # scraper = sessions.get(request.token)
    # if not scraper:
    #    raise HTTPException(status_code=401, detail="Invalid or expired session")

    expires_in = int(request.expires_in_seconds or (7 * 24 * 60 * 60))
    if expires_in < 60 or expires_in > (30 * 24 * 60 * 60):
        raise HTTPException(status_code=400, detail="Invalid expiry")

    student_id = request.wrap_data.get("profile", {}).get("id")
    if not student_id:
        raise HTTPException(status_code=400, detail="Invalid wrap data: missing student ID")

    summary_data = {
        "profile": {
            "name": request.wrap_data.get("profile", {}).get("name", "Student"),
            "id": student_id,
            # Exclude picture to keep token size small for QR codes
            "picture": "", 
            "gpa": request.wrap_data.get("profile", {}).get("gpa", "0.0"),
        },
        "metrics": request.wrap_data.get("metrics", {}),
        "persona": request.wrap_data.get("persona", {}),
    }

    payload = _build_share_payload(summary_data, expires_in_seconds=expires_in, password=request.password)
    share_token = _encrypt_share_token(payload)

    return {
        "success": True,
        "share_token": share_token,
        "share_url": f"/wrap/shared/{share_token}",
    }

@app.get("/share/resolve/{share_token}")
def resolve_share_token(share_token: str, password: str | None = None):
    payload = _decrypt_share_token(share_token)

    pwd = payload.get("pwd")
    if pwd:
        if not password:
            raise HTTPException(status_code=401, detail="Password required")
        if not isinstance(pwd, dict) or "salt" not in pwd or "hash" not in pwd:
            raise HTTPException(status_code=400, detail="Invalid share token payload")
        expected = str(pwd.get("hash"))
        computed = _derive_password_hash(password, str(pwd.get("salt")))
        if not secrets.compare_digest(expected, computed):
            raise HTTPException(status_code=401, detail="Invalid password")

    data = payload.get("data")
    if not isinstance(data, dict):
        raise HTTPException(status_code=400, detail="Invalid share token payload")

    return data

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
