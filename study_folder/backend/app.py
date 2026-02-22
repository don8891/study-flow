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

HF_TOKEN = os.getenv("HF_TOKEN")
HF_API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-large"

headers = {
    "Authorization": f"Bearer {HF_TOKEN}"
}

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
    print(f"DEBUG: Generating topics for text length: {len(text)}")
    prompt = f"""
    Extract the core academic subject topics and their relevant sub-topics from the following syllabus.
    Group sub-topics under their respective parent topics.
    
    STRICT CATEGORICAL BAN:
    - DO NOT include marks, credits, scores, hours, or exam timings.
    - DO NOT include administrative instructions.
    
    FORMAT REQUIREMENT:
    Return ONLY a valid JSON array of objects in this exact format:
    [
      {{ "topic": "Main Topic Name", "subtopics": ["Subtopic A", "Subtopic B"] }}
    ]

    Syllabus Content:
    {text}
    """

    try:
        response = requests.post(
            HF_API_URL,
            headers=headers,
            json={"inputs": prompt}
        )
        print(f"DEBUG: HF Status: {response.status_code}")
        result = response.json()
        print(f"DEBUG: HF Result: {result}")

        generated_text = ""
        if isinstance(result, list) and len(result) > 0:
            generated_text = result[0].get("generated_text", "")
        
        # Try to extract JSON from the generated text
        try:
            # Look for the JSON array starting with [
            start_idx = generated_text.find('[')
            end_idx = generated_text.rfind(']') + 1
            if start_idx != -1 and end_idx != -1:
                json_str = generated_text[start_idx:end_idx]
                return json.loads(json_str)
        except:
            print("DEBUG: Could not parse AI response as JSON")
            
        return generated_text # Fallback to raw text if JSON fails
    except Exception as e:
        print(f"DEBUG: HF Error: {str(e)}")
        return ""


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

    if task == "summary":
        prompt = f"Summarize this syllabus:\n{content[:2000]}"

    elif task == "quiz":
        prompt = f"""
        Generate 5 multiple choice questions from this syllabus.
        Return ONLY a JSON array in this format:
        [
          {{
            "question": "...",
            "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}},
            "answer": "A"
          }}
        ]

        {content[:2000]}
        """

    elif task == "doubt":
        prompt = f"Explain clearly:\n{content}"

    else:
        return {"success": False}

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
    )

    result = response.json()

    return {
        "success": True,
        "response": result.get("response", "")
    }

if __name__ == "__main__":
    app.run(debug=True)
