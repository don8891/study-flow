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

def clean_syllabus_text(text):
    lines = text.split("\n")
    cleaned = []

    for line in lines:
        line = line.strip()
        if len(line) < 5:
            continue
        if any(char.isdigit() for char in line[:2]):
            line = line.lstrip("0123456789. ")
        cleaned.append(line)

    return "\n".join(cleaned)

def generate_structured_topics(text):
    print(f"DEBUG: Generating topics for text length: {len(text)}")
    prompt = f"""
    Extract clear, concise study topics from this syllabus.
    Each topic must be short (max 8 words).

    Syllabus:
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

        if isinstance(result, list) and len(result) > 0:
            return result[0].get("generated_text", "")
        return ""
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
    
    # NEW Fallback Logic: If AI fails, use raw lines
    if not topics_raw.strip():
        print("DEBUG: AI failed or returned empty - using fallback extraction")
        topics = [
            line.strip()
            for line in cleaned_text.split("\n")
            if len(line.strip()) > 10 # Only lines with substantial content
        ]
    else:
        topics = [
            line.strip()
            for line in topics_raw.split("\n")
            if line.strip()
        ]

    print(f"DEBUG: Final topics count: {len(topics)}")
    return jsonify({"success": True, "topics": topics, "text": cleaned_text})

@app.route("/ai-assistant", methods=["POST"])
def ai_assistant():
    data = request.json
    task = data.get("task")  # summary, quiz, doubt
    content = data.get("content")

    if task == "summary":
        prompt = f"""
        Summarize the following syllabus clearly in structured bullet points:

        {content[:3000]}
        """

    elif task == "quiz":
        prompt = f"""
        Generate 5 multiple choice questions from this syllabus.

        Requirements:
        - 4 options (A, B, C, D)
        - Provide correct answer
        - Return JSON format only

        {content[:3000]}
        """

    elif task == "doubt":
        prompt = f"""
        Explain clearly and simply:

        {content}
        """

    else:
        return {"success": False, "message": "Invalid task"}

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
    )

    result = response.json()
    output = result.get("response", "")

    return {"success": True, "response": output}

if __name__ == "__main__":
    app.run(debug=True)
