from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from PyPDF2 import PdfReader
from PIL import Image
import pytesseract

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# If Tesseract path is needed (Windows)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

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

    return {
        "success": True,
        "text": extracted_text.strip()
    }

if __name__ == "__main__":
    app.run(debug=True)
