"""
BUE Scraper V2 - Aggressive scraping for grades and SRS data
"""
import os
import requests
from concurrent.futures import ThreadPoolExecutor
from requests.adapters import HTTPAdapter
from bs4 import BeautifulSoup
import urllib3
from urllib3.util.retry import Retry
import re

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

DEBUG = os.getenv("BUEWRAP_DEBUG", "0") == "1"


def debug_log(message: str, important: bool = False) -> None:
    if important or DEBUG:
        print(message)


def infer_gender_from_name(name: str) -> str | None:
    """Predict gender from first name using local list then genderize.io API"""
    if not name:
        debug_log("LOG: [Gender] Name is empty/None")
        return None
    try:
        # Extract first name (assume first word)
        parts = name.strip().split()
        if not parts:
            return None
        first_name = parts[0]
        
        # Clean non-alpha chars
        first_name = re.sub(r'[^a-zA-Z]', '', first_name)
        
        if len(first_name) < 2:
            debug_log(f"LOG: [Gender] First name too short: '{first_name}'")
            return None
            
        first_name_lower = first_name.lower()
        
        # 1. Local common names list (Egypt/Middle East context)
        common_males = {
            'mostafa', 'mohamed', 'ahmed', 'mahmoud', 'omar', 'youssef', 'khaled', 'amr', 'ali', 
            'hassan', 'hussein', 'ibrahim', 'karim', 'tarek', 'ziad', 'hazem', 'sherif', 'sameh', 
            'waleed', 'yasser', 'emad', 'gamal', 'osama', 'moustafa', 'mohammed', 'ahmad', 'abdallah'
        }
        common_females = {
            'fatma', 'mariam', 'sarah', 'salma', 'nour', 'rana', 'yara', 'haneen', 'mennatullah', 
            'habiba', 'nada', 'may', 'mai', 'mona', 'noha', 'alia', 'farida', 'malak', 'jana',
            'yasmin', 'yasmine', 'dina', 'radwa', 'reem', 'hadeer', 'aya', 'esraa'
        }
        
        if first_name_lower in common_males:
            debug_log(f"LOG: [Gender] Found in local male list: {first_name}")
            return "male"
        if first_name_lower in common_females:
            debug_log(f"LOG: [Gender] Found in local female list: {first_name}")
            return "female"

        # 2. API Fallback
        debug_log(f"LOG: [Gender] Inferring from API for: {first_name}")
        url = f"https://api.genderize.io/?name={first_name}"
        resp = requests.get(url, timeout=2)
        
        if resp.status_code == 200:
            data = resp.json()
            debug_log(f"LOG: [Gender] API response: {data}")
            if data.get('gender') and data.get('probability', 0) > 0.6:
                return data['gender']
        else:
             debug_log(f"LOG: [Gender] API failed with status {resp.status_code}")

    except Exception as e:
        debug_log(f"LOG: [Gender] Error: {e}")
    
    return None


def infer_gender_from_srs(api_data, page_text: str | None, student_name: str | None = None):
    """Best-effort gender detection from SRS data or name."""
    gender = None
    try:
        # Check common fields in the JSON API response
        if isinstance(api_data, dict):
            for key, value in api_data.items():
                k = str(key).lower()
                if k in ("gender", "sex"):
                    val = str(value).strip().lower()
                    if val.startswith("m"):
                        gender = "male"
                    elif val.startswith("f"):
                        gender = "female"
                    if gender:
                        break

        # Fallback: scan page text for explicit Male/Female labels
        if not gender and page_text:
            match = re.search(r"\b(Male|Female)\b", page_text, re.IGNORECASE)
            if match:
                gender = "male" if match.group(1).lower().startswith("m") else "female"
        
        # Fallback: Infer from name
        if not gender and student_name:
            gender = infer_gender_from_name(student_name)
            
    except Exception:
        # This helper must never break scraping; just return None on error
        return None

    return gender

class BUEScraper:
    ELEARN_URL = "https://learn1.bue.edu.eg/login/index.php"
    SRS_URL = "https://srs.bue.edu.eg/bue/default.aspx"
    DEFAULT_TIMEOUT = (8, 30)
    
    def __init__(self):
        self.elearn_session = self._build_session()
        self.srs_session = self._build_session()
        self.username = ""
        self.password = ""
        self.srs_api_data = None  # Will store SRS API response
        
        # Set headers for both sessions
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }
        self.elearn_session.headers.update(headers)
        self.srs_session.headers.update(headers)

    def _build_session(self) -> requests.Session:
        session = requests.Session()

        try:
            retry = Retry(
                total=4,
                connect=4,
                read=4,
                status=4,
                backoff_factor=0.6,
                status_forcelist=(429, 500, 502, 503, 504),
                allowed_methods=frozenset({"GET", "POST", "HEAD", "OPTIONS"}),
                raise_on_status=False,
            )
        except TypeError:
            retry = Retry(
                total=4,
                connect=4,
                read=4,
                status=4,
                backoff_factor=0.6,
                status_forcelist=(429, 500, 502, 503, 504),
                method_whitelist=frozenset({"GET", "POST", "HEAD", "OPTIONS"}),
                raise_on_status=False,
            )

        adapter = HTTPAdapter(max_retries=retry, pool_connections=20, pool_maxsize=20)
        session.mount("https://", adapter)
        session.mount("http://", adapter)
        return session

    def _request(self, session: requests.Session, method: str, url: str, **kwargs):
        if "timeout" not in kwargs or kwargs.get("timeout") is None:
            kwargs["timeout"] = self.DEFAULT_TIMEOUT
        return session.request(method=method, url=url, **kwargs)
    
    def login(self, username, password):
        self.username = username
        self.password = password
        
        debug_log(f"LOG: Attempting login for user: {username}", important=True)

        with ThreadPoolExecutor(max_workers=2) as executor:
            elearn_future = executor.submit(self._login_elearn, username, password)
            srs_future = executor.submit(self._login_srs, username, password)

            elearn_success = False
            srs_success = False

            try:
                elearn_success = bool(elearn_future.result())
            except Exception as e:
                debug_log(f"LOG: [eLearning] Error: {e}", important=True)

            try:
                srs_success = bool(srs_future.result())
            except Exception as e:
                debug_log(f"LOG: [SRS] Error: {e}", important=True)
        
        if elearn_success or srs_success:
            return True, "Login successful"
        else:
            return False, "Invalid university portal credentials. Please check your username and password."

    def _login_elearn(self, username, password):
        try:
            debug_log("LOG: [eLearning] Fetching login page...")
            response = self._request(self.elearn_session, "GET", self.ELEARN_URL)
            soup = BeautifulSoup(response.content, 'html.parser')
            logintoken = soup.find('input', {'name': 'logintoken'})
            
            if not logintoken:
                debug_log("LOG: [eLearning] No login token found.", important=True)
                return False
                
            payload = {
                'username': username,
                'password': password,
                'logintoken': logintoken.get('value'),
                'anchor': ''
            }
            
            debug_log("LOG: [eLearning] Posting credentials...")
            post_response = self._request(self.elearn_session, "POST", self.ELEARN_URL, data=payload)
            
            soup = BeautifulSoup(post_response.content, 'html.parser')
            
            # Strict check: Look for specific logged-in elements
            # Moodle usually has 'usermenu', 'usertext', or a logout link
            user_menu = soup.find(class_='usermenu')
            user_text = soup.find(class_='usertext')
            logout_link = soup.find('a', href=lambda h: h and 'logout.php' in h)
            
            if user_menu or user_text or logout_link:
                debug_log("LOG: [eLearning] Login SUCCESS.", important=True)
                return True
                 
            debug_log("LOG: [eLearning] Login FAILED (No user element found).", important=True)
            return False
        except Exception as e:
            debug_log(f"LOG: [eLearning] Error: {e}", important=True)
            return False

    def _login_srs(self, username, password):
        """Login to SRS using the JSON API"""
        try:
            # The SRS portal uses a JSON API for authentication
            api_url = "https://srs.bue.edu.eg/slcb_new/api/Student/login"
            
            # Prepare email (add @bue.edu.eg if not present)
            email = f"{username}@bue.edu.eg" if '@' not in username else username
            
            debug_log(f"LOG: [SRS] Logging in via API: {api_url}")
            debug_log(f"LOG: [SRS] Email: {email}")
            
            # Make API request
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': 'https://srs.bue.edu.eg',
                'Referer': 'https://srs.bue.edu.eg/studentportal/home.aspx',
            }
            
            payload = {
                'email': email,
                'password': password
            }
            
            import json
            response = self._request(
                self.srs_session,
                "POST",
                api_url,
                headers=headers,
                data=json.dumps(payload),
                verify=False
            )
            
            debug_log(f"LOG: [SRS] API Response Status: {response.status_code}", important=True)
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    debug_log(f"LOG: [SRS] API Response: {json.dumps(data, indent=2)[:500]}")

                    # Check for encryptedID to confirm successful login
                    if not isinstance(data, dict) or not data.get('encryptedID'):
                        debug_log("LOG: [SRS] Login FAILED - No encryptedID in response", important=True)
                        self.srs_api_data = None
                        return False

                    # Store the response data for later use
                    self.srs_api_data = data
                    debug_log("LOG: [SRS] Login SUCCESS via API!", important=True)
                    return True
                except:
                    debug_log(f"LOG: [SRS] API Response (text): {response.text[:500]}")
                    self.srs_api_data = None
                    return False
            else:
                debug_log(f"LOG: [SRS] Login FAILED - Status: {response.status_code}", important=True)
                debug_log(f"LOG: [SRS] Response: {response.text[:500]}")
                self.srs_api_data = None
                return False
            
        except Exception as e:
            debug_log(f"LOG: [SRS] Error: {e}", important=True)
            import traceback
            traceback.print_exc()
            self.srs_api_data = None
            return False

    def get_wrap_data(self):
        data = {
            "profile": {},
            "courses": [],
            "metrics": {},
            "srs_data": {}
        }
        
        # --- eLearning Data ---
        debug_log("LOG: [Data Pull] Starting eLearning scrape...", important=True)
        self.scrape_elearn_dashboard(data)
        
        # Filter and Deep dive each course
        active_courses = []
        
        for course in data['courses']:
            debug_log(f"LOG: [eLearning] === Processing: {course['name']} ===")

            def _is_submitted_like(status, grade):
                s = str(status or "").strip().lower()
                if grade:
                    return True
                if not s:
                    return False
                if s in ["submitted", "graded", "late", "overdue", "completed", "complete", "done", "finished", "attempted"]:
                    return True
                if "submit" in s or "grade" in s or "overdue" in s or "late" in s:
                    return True
                return False

            def _normalize_activity_name(name):
                return re.sub(r"\s+", " ", str(name or "").strip().lower())
            
            # Get all grades from multiple sources
            all_grades = {}
            
            # Source 1: User grade report
            if course.get('id'):
                grades1 = self.scrape_grade_report(course['id'])
                all_grades.update(grades1)
            
            # Source 2: Overview report  
            if course.get('id'):
                grades2 = self.scrape_overview_report(course['id'])
                all_grades.update(grades2)

            # Source 3: Assignment Index (NEW - For accurate submission status)
            assignment_statuses = {}
            if course.get('id'):
                assignment_statuses = self.scrape_assignment_index(course['id'])
                if DEBUG:
                    debug_log(f"LOG: [Assignments] Found {len(assignment_statuses)} statuses from index")

            assignment_statuses_norm = { _normalize_activity_name(k): v for k, v in assignment_statuses.items() }

            # Source 3.5: Quiz Index (NEW)
            quiz_statuses = {}
            if course.get('id'):
                quiz_statuses = self.scrape_quiz_index(course['id'])
                if DEBUG:
                    debug_log(f"LOG: [Quizzes] Found {len(quiz_statuses)} statuses from index")

            quiz_statuses_norm = { _normalize_activity_name(k): v for k, v in quiz_statuses.items() }

            # Source 4: Course page activities
            modules = []
            if course.get('url'):
                modules, real_title = self.scrape_course_modules(course['url'])
                
                # If we have a real title from the page, update the course info if it was missing/bad
                if real_title:
                     # Attempt to re-parse code and name
                     # Check if current name is just the code
                     if not course.get('code') and course.get('name') == course.get('raw_name'):
                         # Try to parse from real_title
                         match = re.match(r'^([A-Z0-9]{3,15})\s*[:\-\s]\s*(.+)$', real_title)
                         if match:
                             course['code'] = match.group(1).strip()
                             course['name'] = match.group(2).strip()
                             debug_log(f"LOG: [eLearning] Updated course info from page: {course['code']} - {course['name']}")
                         else:
                             # Try "Name (CODE)" pattern
                             match_parens = re.search(r'(.+?)\s*\(([A-Z0-9]{5,15})\)$', real_title)
                             if match_parens:
                                 course['name'] = match_parens.group(1).strip()
                                 course['code'] = match_parens.group(2).strip()
                                 debug_log(f"LOG: [eLearning] Updated course info from page (parens): {course['code']} - {course['name']}")
                             elif course.get('name') in real_title:
                                  # If current "name" is found in title (e.g. "25CPES101" inside "25CPES101 Electric Circuits")
                                  # we can try to assume the rest is the name
                              # But simpler: just use the real_title as the name if we don't have a code yet
                              # And try to extract code again
                              match = re.search(r'([A-Z0-9]{3,15})', real_title)
                              if match:
                                  possible_code = match.group(1)
                                  # If the code is at the start
                                  if real_title.startswith(possible_code):
                                       course['code'] = possible_code
                                       course['name'] = real_title.replace(possible_code, '', 1).strip(' :-')
                                  else:
                                      course['name'] = real_title
                              else:
                                  course['name'] = real_title

            if DEBUG:
                for m in modules[:50]:
                    debug_log(f"LOG: [eLearning] Activity scraped: type={m.get('type')} name={m.get('name')} url={bool(m.get('url'))}")

            # Attach course info to each module so consumers can display "CODE - Course Name" beside module name
            for m in modules:
                m['course_code'] = course.get('code', '')
                m['course_name'] = course.get('name', '')
            
            # Fetch details (grade + status) for assignments/quizzes in parallel
            # This is "advanced" scraping - hitting the backend pages for accuracy
            gradeable_modules = [m for m in modules if m['type'] in ['assign', 'quiz'] and m.get('url')]
            
            if gradeable_modules:
                debug_log(f"LOG: [eLearning] Fetching details for {len(gradeable_modules)} activities in parallel...")
                with ThreadPoolExecutor(max_workers=5) as executor:
                    future_to_mod = {
                        executor.submit(self.scrape_activity_details, m['url'], m['type']): m 
                        for m in gradeable_modules
                    }
                    
                    for future in future_to_mod:
                        mod = future_to_mod[future]
                        try:
                            details = future.result()
                            if details:
                                mod.update(details)
                                if details.get('grade'):
                                    all_grades[mod['name']] = details['grade']
                                if DEBUG:
                                    debug_log(
                                        "LOG: [eLearning] Activity details: "
                                        f"name={mod.get('name')} type={mod.get('type')} status={mod.get('status')} grade={mod.get('grade')}"
                                    )
                        except Exception as e:
                            debug_log(f"LOG: [Error] Failed to scrape {mod['name']}: {e}")

            # Merge grades and statuses into modules
            all_grades_norm = { _normalize_activity_name(k): v for k, v in all_grades.items() }
            for mod in modules:
                mod_name = mod['name']
                mod_clean = _normalize_activity_name(mod_name)
                
                # Check assignment index status first (more reliable for submissions)
                # Try exact match first
                idx_status = assignment_statuses_norm.get(mod_clean)
                
                # Check Quiz index status
                quiz_status = quiz_statuses_norm.get(mod_clean)
                
                # Apply best status found
                final_status = None
                if idx_status in ['submitted', 'graded', 'late', 'overdue', 'completed', 'complete', 'done', 'finished']:
                    final_status = idx_status
                elif quiz_status in ['submitted', 'graded', 'late', 'overdue', 'completed', 'complete', 'done', 'finished']:
                    final_status = quiz_status
                
                if final_status:
                    mod['status'] = final_status
                    if DEBUG:
                        debug_log(f"LOG: [Status Update] {mod_name} -> {final_status}")
                
                # If we didn't get grade from page deep-dive, check grade reports
                if not mod.get('grade'):
                    if mod_clean in all_grades_norm:
                        mod['grade'] = all_grades_norm[mod_clean]
                    else:
                        # Try fuzzy match
                        mod_lower = mod_clean
                        for gname, gval in all_grades.items():
                            gname_lower = _normalize_activity_name(gname)
                            if mod_lower and (mod_lower in gname_lower or gname_lower in mod_lower):
                                mod['grade'] = gval
                                break
            
            course['content'] = modules
            course['all_grades'] = all_grades # Expose all found grades
            
            # Log results
            graded_count = sum(1 for m in modules if m.get('grade'))
            submission_count = sum(1 for m in modules if _is_submitted_like(m.get('status'), m.get('grade')))
            
            debug_log(f"LOG: [eLearning] {course['name']}: {len(modules)} items, {graded_count} graded, {submission_count} submitted")
            
            # --- FILTERING LOGIC ---
            # Filter out "junk" courses:
            # - Must have > 1 activity (to exclude just "Announcements")
            # - OR have at least one grade
            # - OR have explicit user enrollment (hard to check, but usually dashboard only shows enrolled)
            
            # Heuristic: If < 3 modules AND 0 grades, it's likely an empty/inactive course
            if len(modules) < 3 and graded_count == 0 and submission_count == 0:
                 debug_log(f"LOG: [Filter] Dropping inactive course: {course['name']} (Modules: {len(modules)}, Grades: {graded_count})", important=True)
                 continue
            
            active_courses.append(course)

        data['courses'] = active_courses
        debug_log(f"LOG: [Data Pull] Final active courses count: {len(active_courses)}", important=True)

        # --- SRS Data ---
        debug_log("LOG: [Data Pull] Starting SRS scrape...", important=True)
        self.scrape_srs_data(data)

        self.calculate_metrics(data)
        return data

    def scrape_elearn_dashboard(self, data):
        """Scrape dashboard for courses"""
        try:
            url = "https://learn1.bue.edu.eg/my/"
            debug_log(f"LOG: [eLearning] Fetching dashboard: {url}")
            res = self._request(self.elearn_session, "GET", url)
            soup = BeautifulSoup(res.content, 'html.parser')
            
            if "login" in res.url.lower():
                debug_log("LOG: [eLearning] WARNING: Not logged in!", important=True)
                return
            
            # Get user name
            user_el = soup.find(class_='usertext') or soup.find(class_='usermenu')
            if user_el:
                data['profile']['name'] = user_el.get_text(strip=True)
                debug_log(f"LOG: [eLearning] User: {data['profile']['name']}")
            
            # Find ALL course links
            courses = []
            seen_ids = set()
            
            for link in soup.find_all('a', href=True):
                href = link.get('href', '')
                if 'course/view.php' in href and 'id=' in href:
                    try:
                        c_id = href.split('id=')[1].split('&')[0]
                        if c_id not in seen_ids:
                            seen_ids.add(c_id)
                            name = link.get_text(strip=True)
                            if name and len(name) > 3:
                                code = ""
                                raw_name = name
                                # Bracketed code: "[CODE] Name"
                                match = re.match(r'^\[([A-Z0-9]{2,15})\]\s*(.+)$', name)
                                if match:
                                    code = match.group(1).strip()
                                    name = match.group(2).strip()
                                else:
                                    # Regex for "CODE: Name", "CODE - Name", "CODE Name"
                                    # Look for code pattern: 2-4 letters + numbers (e.g. CS101, 25CPES101)
                                    # Increased max length to 15 for things like 25CPES101 (9 chars)
                                    match = re.match(r'^([A-Z0-9]{3,10})\s*[:\-\s]\s*(.+)$', name)
                                    if match:
                                        found_code = match.group(1).strip()
                                        found_name = match.group(2).strip()
                                        # Only accept if name is different from code and substantial
                                        if found_code != found_name and len(found_name) > 3:
                                            code = found_code
                                            name = found_name
                                        else:
                                            # If regex matches but looks weird, keep original
                                            pass

                                # Final cleanup: strip any remaining [CODE] tokens anywhere
                                name = re.sub(r'\[[A-Z0-9]{2,15}\]\s*', '', name).strip()
                                
                                courses.append({
                                    'name': name,
                                    'code': code,
                                    'raw_name': raw_name,
                                    'url': href,
                                    'id': c_id
                                })
                                debug_log(f"LOG: [eLearning] Course: {code} - {name} (ID: {c_id})")
                    except:
                        pass
            
            debug_log(f"LOG: [eLearning] Total courses: {len(courses)}", important=True)
            data['courses'] = courses
            
        except Exception as e:
            debug_log(f"LOG: [eLearning] Dashboard error: {e}", important=True)

    def scrape_assignment_index(self, course_id):
        """Scrape the assignment index page for a course /mod/assign/index.php?id=X"""
        statuses = {} # name -> status (submitted, graded, pending)
        try:
            url = f"https://learn1.bue.edu.eg/mod/assign/index.php?id={course_id}"
            # debug_log(f"LOG: [Assignments] Fetching index: {url}") # Reduced noise
            res = self._request(self.elearn_session, "GET", url)
            
            if "course/view.php" in res.url:
                return statuses

            soup = BeautifulSoup(res.content, 'html.parser')
            table = soup.find('table', class_='generaltable')
            
            if table:
                for row in table.find_all('tr'):
                    cells = row.find_all(['td', 'th'])
                    if len(cells) >= 3:
                        name_cell = row.find('a')

                        if not name_cell:
                            continue
                        name = name_cell.get_text(strip=True)

                        row_text = row.get_text(" ", strip=True).lower()
                        status = "pending"

                        if "overdue" in row_text or "late" in row_text:
                            status = "late"
                        elif "submitted" in row_text and "not submitted" not in row_text:
                            status = "submitted"
                        elif "graded" in row_text:
                            status = "graded"

                        for cell in cells:
                            ctext = cell.get_text(strip=True).lower()
                            if "overdue" in ctext or "late" in ctext:
                                status = "late"
                            if "submitted" in ctext and "not submitted" not in ctext:
                                status = "submitted"
                            if "graded" in ctext:
                                status = "graded"

                        # If a numeric grade appears in the row, treat as graded
                        if status == "pending":
                            last_text = cells[-1].get_text(" ", strip=True)
                            if re.search(r"\d", last_text) and last_text.strip() not in ["-", "—"]:
                                status = "graded"

                        statuses[name] = status
        except Exception:
            pass
        return statuses

    def scrape_quiz_index(self, course_id):
        """Scrape the quiz index page for a course /mod/quiz/index.php?id=X"""
        statuses = {} 
        try:
            url = f"https://learn1.bue.edu.eg/mod/quiz/index.php?id={course_id}"
            res = self._request(self.elearn_session, "GET", url)
            
            if "course/view.php" in res.url:
                return statuses

            soup = BeautifulSoup(res.content, 'html.parser')
            table = soup.find('table', class_='generaltable')
            
            if table:
                for row in table.find_all('tr'):
                    cells = row.find_all(['td', 'th'])
                    if len(cells) >= 3:
                        name_cell = row.find('a')
                        if not name_cell: continue
                        name = name_cell.get_text(strip=True)
                        
                        # Quizzes usually have "Finished" or "Closed" or "Grade"
                        row_text = row.get_text(" ", strip=True).lower()
                        status = "pending"

                        if "overdue" in row_text or "late" in row_text:
                            status = "late"
                        
                        if "finished" in row_text or "attempt" in row_text:
                            status = "submitted"
                        
                        # If there is a grade value, it's submitted/graded
                        # Columns usually: Name, Deadline, Grade
                        # Check last cell for grade
                        last_cell = cells[-1].get_text(strip=True)
                        if re.search(r'\d', last_cell) and '-' not in last_cell:
                             status = "graded"
                        
                        statuses[name] = status
        except Exception:
            pass
        return statuses

    def scrape_grade_report(self, course_id):
        """Scrape user grade report for a course"""
        grades = {}
        try:
            url = f"https://learn1.bue.edu.eg/grade/report/user/index.php?id={course_id}"
            debug_log(f"LOG: [Grades] Fetching user report: {url}")
            res = self._request(self.elearn_session, "GET", url)
            soup = BeautifulSoup(res.content, 'html.parser')

            # Find grade table
            table = soup.find('table', class_='user-grade') or soup.find('table', class_='generaltable')
            if table:
                for row in table.find_all('tr'):
                    cells = row.find_all(['td', 'th'])
                    if len(cells) >= 2:
                        item_name = cells[0].get_text(strip=True)
                        # Look for grade in any cell
                        for cell in cells[1:]:
                            text = cell.get_text(strip=True)
                            # Check if it looks like a grade
                            # Exclude date-like patterns if possible (e.g. 2024, 12:00)
                            if re.search(r'\d{4}', text) or ':' in text:
                                continue

                            is_grade = False
                            # Pattern 1: Percentage or score x/y
                            if re.match(r'^[\d.]+\s*/\s*[\d.]+$', text):
                                # Check if it looks like a date (e.g. 8/11) - simple heuristic
                                # If denominator is 12 or less, might be a date? But 8/10 is a common grade.
                                # Let's assume if it matches " / " with spaces it's a grade.
                                # If it's "8/11" with no spaces, it's ambiguous.
                                # Moodle usually puts spaces "8.00 / 10.00".
                                if '/' in text and ' ' not in text:
                                    # Ambiguous "x/y" - strict check
                                    pass
                                else:
                                    is_grade = True

                            # Pattern 2: Letter grade
                            elif text in ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'P', 'Fail']:
                                is_grade = True

                            # Pattern 3: Simple number (0-100)
                            elif re.match(r'^[\d.]+$', text):
                                try:
                                    val = float(text)
                                    if 0 <= val <= 100:
                                        is_grade = True
                                except Exception:
                                    pass

                            if is_grade:
                                if item_name and item_name not in ['Grade item', 'Category', 'Course total']:
                                    grades[item_name] = text
                                    debug_log(f"LOG: [Grades] {item_name} = {text}")
                                break
        except Exception as e:
            debug_log(f"LOG: [Grades] Error: {e}", important=True)
        return grades

    def scrape_overview_report(self, course_id):
        """Scrape overview grade report"""
        grades = {}
        try:
            url = f"https://learn1.bue.edu.eg/grade/report/overview/index.php?id={course_id}"
            res = self._request(self.elearn_session, "GET", url)
            soup = BeautifulSoup(res.content, 'html.parser')

            table = soup.find('table', class_='generaltable')
            if table:
                for row in table.find_all('tr'):
                    cells = row.find_all('td')
                    if len(cells) >= 2:
                        name = cells[0].get_text(strip=True)
                        grade = cells[-1].get_text(strip=True)
                        if name and grade and grade != '-':
                            grades[name] = grade
        except Exception:
            pass
        return grades

    def scrape_course_modules(self, url):
        """Scrape all activities from a course page"""
        modules = []
        course_real_name = None
        try:
            debug_log(f"LOG: [eLearning] Fetching course: {url}")
            res = self._request(self.elearn_session, "GET", url)
            soup = BeautifulSoup(res.content, 'html.parser')
            
            # Try to extract better course name from the page header
            # Usually h1 or inside .page-header-headings
            header = soup.find('div', class_='page-header-headings')
            if not header:
                header = soup.find('h1')
            
            if header:
                full_title = header.get_text(strip=True)
                if full_title:
                     # Try to parse code/name from this full title
                     course_real_name = full_title
                     debug_log(f"LOG: [eLearning] Found real course title: {full_title}")
            
            # Find all activity elements
            activities = soup.find_all('li', class_='activity')
            if not activities:
                activities = soup.find_all('div', class_='activity-item')
            if not activities:
                activities = soup.find_all('div', class_='activityinstance')
            
            for act in activities:
                modtype = "resource"
                classes = act.get('class', [])
                for c in classes:
                    c2 = c
                    if isinstance(c2, str) and c2.startswith('modtype_'):
                        c2 = c2[len('modtype_'):]
                    if c2 in ['assign', 'quiz', 'forum', 'resource', 'folder', 'url', 'attendance', 'page', 'label', 'choice']:
                        modtype = c2
                        break
                
                # Get name
                name_el = act.find('span', class_='instancename') or act.find('a')
                name = name_el.get_text(strip=True) if name_el else "Unknown"
                name = name.split("Hidden")[0].strip()  # Remove "Hidden from students" suffix
                name = re.sub(r'\[[A-Z0-9]{2,15}\]\s*', '', name).strip()
                
                # Get link
                link_el = act.find('a', href=True)
                link = link_el.get('href', '') if link_el else ""

                # --- NEW: Check for submission status in the list item itself ---
                # Moodle often puts a "Submitted" label or status in the activity text
                text_content = act.get_text(" ", strip=True).lower()
                is_submitted_in_list = False
                
                # Check for explicit text indicators
                if 'submitted' in text_content and 'not submitted' not in text_content:
                    is_submitted_in_list = True
                elif 'receive a grade' in text_content: 
                    # "To do: Receive a grade" usually means submitted and waiting
                    is_submitted_in_list = True
                elif 'done' in text_content or 'complete' in text_content or 'completed' in text_content:
                    is_submitted_in_list = True
                elif 'finished' in text_content or 'attempt' in text_content:
                    is_submitted_in_list = True
                
                # Check for "Done" badge (if completion tracking is on)
                if act.find('button', attrs={'data-action': 'toggle-manual-completion', 'aria-checked': 'true'}):
                    # Manual completion ticked
                    is_submitted_in_list = True
                elif act.find('img', alt=re.compile(r'Completed', re.IGNORECASE)):
                     is_submitted_in_list = True

                if name and name != "Unknown":
                    modules.append({
                        'name': name,
                        'type': modtype,
                        'url': link,
                        'grade': None,
                        'status': 'submitted' if is_submitted_in_list else 'pending'
                    })
            
            debug_log(f"LOG: [eLearning] Found {len(modules)} activities")
            
        except Exception as e:
            debug_log(f"LOG: [eLearning] Module error: {e}", important=True)
        return modules, course_real_name

    def scrape_activity_details(self, url, activity_type):
        """Deep scrape of an activity page for grade and submission status"""
        result = {
            'grade': None,
            'status': 'pending', # pending, submitted, graded, late
            'max_grade': None
        }
        
        try:
            if not url:
                return None
                
            res = self._request(self.elearn_session, "GET", url)
            soup = BeautifulSoup(res.content, 'html.parser')
            text = soup.get_text()
            
            # --- 1. Check Submission Status ---
            # Look for "Submission status" table row common in Moodle
            # It usually has a th/td "Submission status" and a td with the status
            status_found = False
            
            # Method A: Search for the specific table cell
            # cell containing "Submission status" or "State" (for quizzes)
            status_label = soup.find(lambda tag: tag.name in ['td', 'th'] and any(x in tag.get_text() for x in ['Submission status', 'State']))
            if status_label:
                # Next sibling or next cell in row
                row = status_label.find_parent('tr')
                if row:
                    status_cell = row.find_all('td')[-1] # Last cell usually has the value
                    if status_cell:
                        status_text = status_cell.get_text(strip=True).lower()
                        if 'submitted' in status_text:
                            result['status'] = 'submitted'
                            status_found = True
                        elif 'graded' in status_text:
                            result['status'] = 'graded'
                            status_found = True
                        elif 'finished' in status_text:
                            # Quizzes often say "State: Finished"
                            result['status'] = 'submitted'
                            status_found = True
                        elif 'overdue' in status_text or 'late' in status_text:
                            result['status'] = 'late'
            
            # Method B: Search for "Attempt number" or "This assignment is overdue" if A failed
            if not status_found:
                if 'Submitted for grading' in text:
                    result['status'] = 'submitted'
                elif 'This assignment is overdue' in text:
                    result['status'] = 'late'
                elif 'Summary of your previous attempts' in text:
                     # This usually implies some activity, check if any state is 'Finished' in table
                     if 'Finished' in text:
                         result['status'] = 'submitted'
                
                # Check for "Edit submission" button - strong indicator of submission
                if not result['status'] == 'submitted':
                    if soup.find('button', string=re.compile('Edit submission', re.IGNORECASE)) or \
                       soup.find('input', {'type': 'submit', 'value': re.compile('Edit submission', re.IGNORECASE)}):
                        result['status'] = 'submitted'
                        status_found = True

            # Method C: Check for file submissions/online text
            if not status_found and result['status'] == 'pending':
                # Look for "File submissions" or "Online text" section which usually means something was sent
                if soup.find('div', class_='submissionstatussubmitted'):
                    result['status'] = 'submitted'
            
            # --- 2. Check Grade ---
            # Try to find the specific "Grade" row in feedback
            # Relaxed check: "Grade", "Mark", "Marks"
            grade_label = soup.find(lambda tag: tag.name in ['td', 'th'] and tag.get_text(strip=True).replace(':', '') in ['Grade', 'Mark', 'Marks', 'Score'])
            if grade_label:
                row = grade_label.find_parent('tr')
                if row:
                    grade_cell = row.find_all('td')[-1]
                    if grade_cell:
                        raw_grade = grade_cell.get_text(strip=True)
                        if raw_grade and raw_grade != '-':
                            result['grade'] = raw_grade
                            result['status'] = 'graded' # If we have a grade, it is graded
            
            # Fallback: Regex search for grade patterns if table lookup failed
            if not result['grade']:
                patterns = [
                    r'(?:Grade|Mark|Score)[:\s]+(\d+\.?\d*)\s*/\s*(\d+\.?\d*)',  # Grade: 8.5 / 10
                    r'(?:Grade|Mark|Score)[:\s]+(\d+\.?\d*)',  # Grade: 85
                ]
                
                for pattern in patterns:
                    match = re.search(pattern, text, re.IGNORECASE)
                    if match:
                        result['grade'] = match.group(0)
                        result['status'] = 'graded'
                        break
            
            # Quizzes usually show "Finished" state
            if activity_type == 'quiz' and not status_found:
                if 'Finished' in text or 'Review' in text:
                    result['status'] = 'submitted'
                    if result['grade']:
                        result['status'] = 'graded'

            return result
            
        except Exception as e:
            debug_log(f"LOG: [Details] Error scraping {url}: {e}")
            return None

    def scrape_srs_data(self, data):
        """Extract SRS data using encryptedID from login"""
        debug_log("LOG: [SRS] Starting SRS data extraction...", important=True)
        
        data['srs_data'] = {
            'student_name': None,
            'student_id': None,
            'profile_picture': None,
            'faculty': None,
            'programme': None,
            'gpa': None,
            'cgpa': None,
            'bue_email': None,
            'gender': None,
            'raw_data': {},
            'registered_courses': []
        }
        
        try:
            # Check if we have API data from login
            if not hasattr(self, 'srs_api_data') or not self.srs_api_data:
                debug_log("LOG: [SRS] No API data available", important=True)
                return
            
            api_data = self.srs_api_data
            encrypted_id = api_data.get('encryptedID')
            
            if not encrypted_id:
                debug_log("LOG: [SRS] No encryptedID in API response", important=True)
                return
            
            debug_log(f"LOG: [SRS] Got encryptedID: {encrypted_id[:50]}...")
            
            # Step 2: POST to studentportal.aspx with encryptedID
            portal_url = "https://srs.bue.edu.eg/studentportal/studentportal.aspx"
            debug_log(f"LOG: [SRS] Fetching student portal: {portal_url}")
            
            payload = {
                'act': 'home',
                'encryptedID': encrypted_id
            }
            
            self.srs_session.headers.update({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Origin': 'https://srs.bue.edu.eg',
                'Referer': 'https://srs.bue.edu.eg/studentportal/home.aspx',
            })
            
            res = self._request(self.srs_session, "POST", portal_url, data=payload, verify=False)
            debug_log(f"LOG: [SRS] Portal response status: {res.status_code}", important=True)
            debug_log(f"LOG: [SRS] Portal response URL: {res.url}")
            
            soup = BeautifulSoup(res.content, 'html.parser')
            page_text = soup.get_text(' ', strip=True)
            debug_log(f"LOG: [SRS] Page length: {len(page_text)} chars")

            # --- Name Extraction (Early) ---
            # Student Name - appears after "Logout" and before "ID:"
            name_match = re.search(r'Logout\s+([A-Za-z\s]+?)\s+ID:', page_text)
            if name_match:
                name = name_match.group(1).strip()
                data['srs_data']['student_name'] = name
                debug_log(f"LOG: [SRS] Student Name: {name}")
            
            # Fallback: Welcome message has first name
            if not data['srs_data']['student_name']:
                welcome_match = re.search(r'Welcome back,\s*([A-Za-z]+)!', page_text)
                if welcome_match:
                    data['srs_data']['student_name'] = welcome_match.group(1)
                    debug_log(f"LOG: [SRS] Name from welcome: {welcome_match.group(1)}")

            # --- Gender detection ---
            gender_label = infer_gender_from_srs(api_data, page_text, data['srs_data']['student_name'])
            data['srs_data']['gender'] = gender_label
            if gender_label:
                debug_log(f"LOG: [SRS] Detected gender: {gender_label.upper()}", important=True)
            else:
                debug_log("LOG: [SRS] Detected gender: UNKNOWN", important=True)
            
            # Check if we got student data
            if 'Registration Card' in page_text or 'Student ID' in page_text or 'Student Name' in page_text:
                debug_log("LOG: [SRS] Found student data in portal!", important=True)
                debug_log("LOG: [SRS] PAGE CONTENT:")
                debug_log(page_text[:3000])
            else:
                debug_log("LOG: [SRS] No student data found, dumping first 2000 chars:")
                debug_log(page_text[:2000])
            
            # Extract profile picture (base64)
            for img in soup.find_all('img'):
                src = img.get('src', '')
                img_class = ' '.join(img.get('class', [])).lower()
                if src.startswith('data:image') or 'avatar' in img_class or 'student' in img_class:
                    data['srs_data']['profile_picture'] = src
                    debug_log(f"LOG: [SRS] Found profile picture!")
                    break
            
            # Extract data using regex - based on actual page format:
            # "Logout Mostafa Mohamed Mostafa Ahmed Tarif ID: 263702 Engineering 4 Years Programs"
            
            # Student ID - format is "ID: 263702"
            id_match = re.search(r'ID:\s*(\d+)', page_text)
            if id_match:
                data['srs_data']['student_id'] = id_match.group(1)
                debug_log(f"LOG: [SRS] Student ID: {id_match.group(1)}", important=True)
            
            # (Name extracted earlier)
            
            # Faculty/Programme - appears after ID number, before "Academic"
            faculty_match = re.search(r'ID:\s*\d+\s+([A-Za-z\s\d]+?)\s+Academic', page_text)
            if faculty_match:
                faculty = faculty_match.group(1).strip()
                data['srs_data']['faculty'] = faculty
                data['srs_data']['programme'] = faculty
                debug_log(f"LOG: [SRS] Faculty: {faculty}")
            
            # BUE Email - construct from username
            if data['srs_data']['student_id']:
                # Try to find email or construct it
                email_match = re.search(r'([\w.]+@bue\.edu\.eg)', page_text)
                if email_match:
                    data['srs_data']['bue_email'] = email_match.group(1)
                else:
                    data['srs_data']['bue_email'] = f"{self.username}@bue.edu.eg"
                debug_log(f"LOG: [SRS] Email: {data['srs_data']['bue_email']}")
            
            # (Welcome message extracted earlier)
            
            # GPA/CGPA - may not be on this page
            gpa_match = re.search(r'GPA[:\s]*([\d.]+)', page_text)
            if gpa_match:
                data['srs_data']['gpa'] = gpa_match.group(1)
                debug_log(f"LOG: [SRS] GPA: {gpa_match.group(1)}")
            
            cgpa_match = re.search(r'CGPA[:\s]*([\d.]+)', page_text)
            if cgpa_match:
                data['srs_data']['cgpa'] = cgpa_match.group(1)
                debug_log(f"LOG: [SRS] CGPA: {cgpa_match.group(1)}")
            
            # Store raw API data
            data['srs_data']['raw_data'] = api_data
            
            # Summary
            debug_log("LOG: [SRS] ========== SUMMARY ==========", important=True)
            debug_log(f"LOG: [SRS] Name: {data['srs_data']['student_name']}")
            debug_log(f"LOG: [SRS] ID: {data['srs_data']['student_id']}", important=True)
            debug_log(f"LOG: [SRS] Picture: {'Yes' if data['srs_data']['profile_picture'] else 'No'}")
            debug_log(f"LOG: [SRS] GPA: {data['srs_data']['gpa']}", important=True)
            debug_log("LOG: [SRS] ==============================")
            
        except Exception as e:
            debug_log(f"LOG: [SRS] Error: {e}", important=True)
            import traceback
            traceback.print_exc()

    def calculate_metrics(self, data):
        """Calculate summary metrics"""
        total_graded = 0
        total_items = 0
        
        for course in data['courses']:
            for item in course.get('content', []):
                total_items += 1
                if item.get('grade'):
                    total_graded += 1
        
        data['metrics'] = {
            'total_courses': len(data['courses']),
            'total_items': total_items,
            'graded_items': total_graded
        }
