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
    print("AI FUNCTION CALLED")
    prompt = f"""
    You are an academic planning assistant.

    Extract clear, concise study topics from this syllabus.
    Remove duplicates.
    Do not include numbering.
    Each topic must be short (max 8 words).

    Syllabus:
    {text}
    """

    response = requests.post(
        HF_API_URL,
        headers=headers,
        json={"inputs": prompt}
    )

    print("HF STATUS:", response.status_code)
    result = response.json()

    if isinstance(result, list) and len(result) > 0:
        return result[0].get("generated_text", "")
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
    if "file" not in request.files:
        return {"success": False, "message": "No file"}, 400

    file = request.files["file"]
    uid = request.form.get("uid")

    if not uid:
        return {"success": False, "message": "Missing UID"}, 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    extracted_text = ""

    # PDF handling
    if file.filename.lower().endswith(".pdf"):
        reader = PdfReader(filepath)
        for page in reader.pages:
            extracted_text += page.extract_text() or ""

    # Image handling
    else:
        image = Image.open(filepath)
        extracted_text = pytesseract.image_to_string(image)

    cleaned_text = clean_syllabus_text(extracted_text)
    topics_raw = generate_structured_topics(cleaned_text)

    # Convert AI string response to a clean list of topics
    topics = [
        line.strip()
        for line in topics_raw.split("\n")
        if len(line.strip()) > 5
    ]

    return jsonify({
        "success": True,
        "topics": topics
    })

if __name__ == "__main__":
    app.run(debug=True)
