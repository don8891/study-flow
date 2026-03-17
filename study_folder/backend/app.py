from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import requests
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from PIL import Image
import pytesseract

load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# If Tesseract path is needed (Windows)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# HF_TOKEN and HF_API_URL removed as syllabus extraction is now handled locally

import re

def clean_syllabus_text(text):
    # Standard cleaning
    lines = text.split("\n")
    cleaned = []
    
    # Metadata keywords to prune entire lines
    blacklist_keywords = [
        "mark", "score", "credit", "weightage", "hour", "exam", "internal", 
        "external", "total", "pattern", "duration", "question paper", "allotment",
        "time", "minute", "mins", "hrs", "maximum", "minimum", "sec", "section"
    ]

    for line in lines:
        line = line.strip()
        if len(line) < 4:
            continue
        
        # Check if line contains any blacklist keywords (case-insensitive)
        if any(kw in line.lower() for kw in blacklist_keywords):
            continue
            
        # Strip leading numbers/bullets
        line = re.sub(r"^[0-9.\-\s]+", "", line)
        
        if len(line) > 3:
            cleaned.append(line)

    return "\n".join(cleaned)

import json

def generate_structured_topics(text):
    print(f"DEBUG: Attempting AI extraction for topics (Text length: {len(text)})")
    
    prompt = f"""
    Extract the core academic subject topics and their relevant sub-topics from the following syllabus text.
    Group sub-topics under their respective parent topics.
    
    STRICT RULES:
    1. DO NOT include marks, credits, scores, or hours.
    2. DO NOT include administrative instructions.
    3. Return ONLY a valid JSON array of objects like this:
       [
         {{ "topic": "Main Topic", "subtopics": ["Sub A", "Sub B"] }}
       ]

    Syllabus Content:
    {text[:4000]}
    """

    # Model priority: llama3 -> mistral
    models = ["llama3:latest", "mistral:latest"]

    for model in models:
        try:
            print(f"DEBUG: Trying extraction with model: {model}")
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=180
            )
            
            if response.status_code == 200:
                result = response.json()
                generation = result.get("response", "")
                
                json_match = re.search(r"\[.*\]", generation, re.DOTALL)
                if json_match:
                    parsed = json.loads(json_match.group(0))
                    if isinstance(parsed, list) and len(parsed) > 0:
                        print(f"DEBUG: AI extracted {len(parsed)} topics successfully using {model}.")
                        return parsed
        except Exception as e:
            print(f"DEBUG: Model {model} failed or timed out: {e}")

    # --- FALLBACK: Smart Local Extraction ---
    print("DEBUG: Using local heuristic extraction fallback.")
    raw_lines = [line.strip() for line in text.split("\n") if len(line.strip()) > 5]
    
    if not raw_lines:
        return []
    
    structured = []
    current_topic = ""
    current_subtopics = []
    has_started = False
    
    for line in raw_lines:
        words = line.split()
        is_short = len(words) <= 6
        starts_with_cap = line[0].isupper() if line else False
        
        if is_short and starts_with_cap:
            if has_started:
                structured.append({
                    "topic": current_topic,
                    "subtopics": list(current_subtopics)
                })
            current_topic = line
            current_subtopics = []
            has_started = True
        else:
            if not has_started:
                current_topic = "General Topics"
                current_subtopics = [line]
                has_started = True
            else:
                current_subtopics.append(line)
    
    if has_started:
        structured.append({
            "topic": current_topic,
            "subtopics": list(current_subtopics)
        })
    
    if len(structured) < 3 and len(raw_lines) > 3:
        return [{"topic": line, "subtopics": []} for line in raw_lines]
    
    return structured


# TEMPORARY in-memory store
users = {}

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "message": "Study Flow backend running"
    })

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"success": False, "message": "Missing fields"}), 400

    if email in users:
        return jsonify({"success": False, "message": "User already exists"}), 409

    users[email] = password
    return jsonify({"success": True})

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if users.get(email) != password:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    return jsonify({"success": True})

@app.route("/upload-syllabus", methods=["POST"])
def upload_syllabus():
    file = request.files["file"]

    filepath = os.path.join("uploads", file.filename)
    file.save(filepath)

    extracted_text = ""

    if file.filename.endswith(".pdf"):
        reader = PdfReader(filepath)
        for page in reader.pages:
            extracted_text += page.extract_text() or ""
    else:
        image = Image.open(filepath)
        extracted_text = pytesseract.image_to_string(image)

    cleaned_text = clean_syllabus_text(extracted_text)
    print(f"DEBUG: Cleaned text length: {len(cleaned_text)}")
    
    topics_raw = generate_structured_topics(cleaned_text)
    
    # Blacklist filter for final topics
    forbidden = ["mark", "score", "credit", "weightage", "hour", "exam", "internal", "external", "total", "time", "hrs", "mins"]
    
    final_topics = []

    if isinstance(topics_raw, list):
        # AI returned structured JSON
        for item in topics_raw:
            main_topic = item.get("topic", "").strip()
            if main_topic and not any(f in main_topic.lower() for f in forbidden):
                subtopics = [
                    s.strip() for s in item.get("subtopics", [])
                    if s.strip() and not any(f in s.lower() for f in forbidden)
                ]
                final_topics.append({
                    "topic": main_topic,
                    "subtopics": subtopics
                })
    else:
        # Fallback to flat list handling if JSON fails
        print("DEBUG: Using flat list fallback for topics")
        raw_lines = [
            line.strip()
            for line in topics_raw.split("\n")
            if line.strip() and len(line.strip()) > 5
        ] if topics_raw else [
            line.strip()
            for line in cleaned_text.split("\n")
            if len(line.strip()) > 10
        ]

        # Filter flat list
        filtered_lines = [
            t for t in raw_lines 
            if not any(f in t.lower() for f in forbidden)
        ]

        # Convert flat list to structured format for frontend consistency
        for t in filtered_lines:
            final_topics.append({
                "topic": t,
                "subtopics": []
            })

    print(f"DEBUG: Final topics count: {len(final_topics)}")
    return jsonify({"success": True, "topics": final_topics, "text": cleaned_text})

@app.route("/ai-assistant", methods=["POST"])
def ai_assistant():
    print("Received AI request")
    data = request.json
    task = data.get("task")
    content = data.get("content")
    syllabus_context = data.get("syllabusContext", "")

    if task == "summary":
        prompt = f"""
        Analyze the following syllabus and create a professional, comprehensive study guide.
        
        SYLLABUS CONTENT:
        {content[:2000]}
        
        YOUR RESPONSE SHOULD INCLUDE:
        1. CONCEPT EXPLANATION: A brief overview of the main subjects.
        2. KEY POINTS: The most important theories or laws mentioned.
        3. IMPORTANT SUBTOPICS: A list of core chapters/topics to focus on.
        4. MEMORY TIPS: Mnemonics or simple ways to remember complex parts.
        5. FAST REVISION NOTES: Bullet points for quick reading before an exam.
        
        FORMATTING CONSTRAINTS:
        - Use ONLY '-' for bullet points (no '+' or '*' at the start of lines).
        - Use **bold** for key section titles and important terms.
        - Use __underline__ for critical academic concepts.
        - Ensure the output is clean and professional without unnecessary conversational filler.
        """

    elif task == "quiz":
        prompt = f"""
        Generate 5 high-quality, conceptual multiple choice questions based on the ACADEMIC CONTENT of this syllabus.
        
        SYLLABUS CONTENT:
        {content[:2000]}
        
        STRICT CONSTRAINTS:
        - DO NOT ask questions about the syllabus structure (e.g., "What is in Chapter 1?" or "Which unit covers X?").
        - FOCUS ONLY on the actual subject matter, theories, facts, and concepts.
        - Each question must test understanding of the topic itself.
        - Provide 4 distinct options labeled A, B, C, D.

        Return ONLY a JSON array in this format:
        [
          {{
            "question": "...",
            "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}},
            "answer": "A"
          }}
        ]
        """

    elif task == "doubt":
        prompt = f"""
        CONTEXT FROM SYLLABUS:
        {syllabus_context[:1500]}

        EXPLAIN THIS CONCEPT:
        {content}

        INSTRUCTIONS:
        - Explain the concept clearly and professionally.
        - Use ONLY '-' for bullet points.
        - Use **bold** for important terms.
        - Use __underline__ for key academic concepts.
        - If the concept is not found in the syllabus context, provide a general accurate explanation but mention it's outside the provided syllabus.
        """

    else:
        return {"success": False}

    # Model priority: llama3 -> mistral
    models = ["llama3:latest", "mistral:latest"]
    
    last_error = ""

    for model in models:
        try:
            print(f"DEBUG: Requesting {task} from model: {model}...")
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=180
            )

            if response.status_code == 200:
                result = response.json()
                generation = result.get("response", "")
                if generation:
                    print(f"DEBUG: Request successful using {model}.")
                    return {
                        "success": True,
                        "response": generation
                    }
            else:
                last_error = f"Ollama error {response.status_code} with {model}"
                print(f"DEBUG: {last_error}")

        except requests.exceptions.Timeout:
            last_error = f"Ollama timed out while using {model}. CPU might be too slow."
            print(f"DEBUG: {last_error}")
        except Exception as e:
            last_error = str(e)
            print(f"DEBUG: Model {model} failed: {e}")

    return {"success": False, "message": f"AI service failed. Last error: {last_error}. Please ensure Ollama is running."}

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
