from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import re
import json
import requests
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from PIL import Image
import pytesseract
from groq import Groq
import google.generativeai as genai

load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# ── API Clients ──────────────────────────────────────────────
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# ── Unified AI Call: Groq first, Gemini as fallback ─────────
def call_ai(prompt, system_prompt="You are a helpful assistant.", max_tokens=1024):
    # 1. Try Groq first (fastest)
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",   # Free, very fast
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": prompt}
            ],
            max_tokens=max_tokens,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Groq failed: {e}, falling back to Gemini...")

    # 2. Fallback to Gemini
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        full_prompt = f"{system_prompt}\n\n{prompt}"
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        print(f"Gemini failed: {e}")
        return None


# ── Syllabus Cleaning ────────────────────────────────────────
def clean_syllabus_text(text):
    lines = text.split("\n")
    cleaned = []
    blacklist_keywords = [
        "mark", "score", "credit", "weightage", "hour", "exam", "internal",
        "external", "total", "pattern", "duration", "question paper", "allotment",
        "time", "minute", "mins", "hrs", "maximum", "minimum", "sec", "section",
        "objective", "instruction", "rule", "administrative", "policy", "grade", 
        "grading", "assignment", "project", "presentation", "attendance", "participation",
        "syllabus", "course", "description", "outcome", "prerequisite", "textbook",
        "reference", "material", "university", "department", "faculty", "student"
    ]
    for line in lines:
        line = line.strip()
        if len(line) < 4:
            continue
        if any(kw in line.lower() for kw in blacklist_keywords):
            continue
        line = re.sub(r"^[0-9.\-\s]+", "", line)
        if len(line) > 3:
            cleaned.append(line)
    return "\n".join(cleaned)


# ── Topic Extraction ─────────────────────────────────────────
def generate_structured_topics(text):
    prompt = f"""Extract ONLY the core academic subject topics and their relevant sub-topics from the following syllabus text.

STRICT RULES:
1. Each topic should be 2-6 words maximum.
2. DO NOT include marks, credits, scores, hours, course objectives, textbooks, rules, or administrative text.
3. CLEAN THE NAMES: Completely remove prefixes like "Unit 1", "Chapter 4:", trailing page numbers, and weird symbols like '|' or quotes. Return just the pure conceptual name (e.g. "Moving Charges", "Magnetic Effects").
4. Your response must be ONLY a valid JSON array like this, with NO markdown formatting around it:
   [
     {{ "topic": "Main Topic Name", "subtopics": ["Subtopic A", "Subtopic B"] }}
   ]

Syllabus Content:
{text[:4000]}"""

    result = call_ai(
        prompt=prompt,
        system_prompt="You are a Curriculum Analyst. Extract structured academic topics and return only valid JSON."
    )

    if result:
        json_match = re.search(r"\[.*\]", result, re.DOTALL)
        if json_match:
            try:
                parsed = json.loads(json_match.group(0))
                if isinstance(parsed, list) and len(parsed) > 0:
                    return parsed
            except Exception:
                pass

    # Fallback: simple line extraction
    raw_lines = [line.strip() for line in text.split("\n") if len(line.strip()) > 5]
    return [{"topic": line, "subtopics": []} for line in raw_lines if len(line.split()) <= 10]


# ── Topic Name Cleaning ──────────────────────────────────────
def clean_topic_name(name):
    # Remove 'Unit 1:', 'Chapter-4', 'Module 3', etc.
    name = re.sub(r"^(chapter|unit|module)[\s\-]*[A-Za-z0-9]+[\s\:\-\|]*", "", name, flags=re.IGNORECASE)
    # Remove pipes, weird quotes, underscores
    name = re.sub(r"[\|‘'_\"“\”]", "", name)
    # Remove trailing numbers (e.g. page numbers)
    name = re.sub(r"\s+\d+$", "", name)
    # Strip leading/trailing hyphens, colons, dots, commas
    name = name.strip(" -:.,;")
    # Title case it for a cleaner look
    if name.isupper() or name.islower():
        name = name.title()
    return name.strip()


# ── Routes ───────────────────────────────────────────────────
users = {}

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "Study Flow backend running"})

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
    topics_raw = generate_structured_topics(cleaned_text)

    forbidden = ["mark", "score", "credit", "weightage", "hour", "exam",
                 "internal", "external", "total", "time", "hrs", "mins"]
    final_topics = []

    for item in topics_raw:
        main_topic = item.get("topic", "").strip()
        main_topic = clean_topic_name(main_topic)
        
        if main_topic and len(main_topic.split()) <= 10 and not any(f in main_topic.lower() for f in forbidden):
            subtopics = []
            for s in item.get("subtopics", []):
                s = clean_topic_name(s.strip())
                if s and len(s.split()) <= 10 and not any(f in s.lower() for f in forbidden):
                    subtopics.append(s)
            
            final_topics.append({"topic": main_topic, "subtopics": subtopics})

    return jsonify({"success": True, "topics": final_topics, "text": cleaned_text})


@app.route("/ai-assistant", methods=["POST"])
def ai_assistant():
    data = request.json
    task = data.get("task")
    content = data.get("content")
    syllabus_context = data.get("syllabusContext", "")

    if task == "summary":
        system = "You are a professional academic assistant. Create clear, structured study guides."
        prompt = f"""Analyze the following syllabus and create a comprehensive study guide.

YOUR RESPONSE SHOULD INCLUDE:
1. CONCEPT EXPLANATION: A brief overview of the main subjects.
2. KEY POINTS: The most important theories or laws mentioned.
3. IMPORTANT SUBTOPICS: Core chapters to focus on.
4. MEMORY TIPS: Mnemonics or simple ways to remember complex parts.
5. FAST REVISION NOTES: Bullet points for quick reading before an exam.

FORMATTING:
- Use '-' for bullet points
- Use **bold** for key section titles
- Use __underline__ for critical concepts

SYLLABUS CONTENT:
{content[:3000]}"""

    elif task == "quiz":
        system = "You are an expert quiz creator. Return only valid JSON, no extra text."
        prompt = f"""Generate 5 UNIQUE and RANDOM multiple choice questions based on this syllabus content.
Make sure the questions are different every time to ensure variety.

STRICT CONSTRAINTS:
- Focus only on actual subject matter, theories, and concepts.
- Provide 4 options labeled A, B, C, D.
- Include a brief explanation for the correct answer.
- Return ONLY a JSON array, nothing else:
[
  {{
    "question": "...",
    "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}},
    "answer": "A",
    "explanation": "..."
  }}
]

SYLLABUS CONTENT:
{content[:4000]}"""

    elif task == "doubt":
        system = "You are a helpful academic tutor. Explain concepts clearly using the provided context."
        prompt = f"""CONTEXT FROM SYLLABUS:
{syllabus_context[:1500]}

EXPLAIN THIS CONCEPT:
{content}

INSTRUCTIONS:
- Explain clearly and professionally.
- Use '-' for bullet points.
- Use **bold** for important terms.
- If not in syllabus context, provide a general explanation and note it."""

    else:
        return jsonify({"success": False})

    result = call_ai(prompt=prompt, system_prompt=system, max_tokens=1500)

    if result:
        return jsonify({"success": True, "response": result})
    return jsonify({"success": False, "message": "AI service unavailable. Check your API keys."})


# ── NEW: AI Tutor Endpoint ───────────────────────────────────
@app.route("/ai-tutor", methods=["POST"])
def ai_tutor():
    data = request.json
    topic = data.get("topic", "General")
    difficulty = data.get("difficulty", "Beginner")
    question = data.get("question", "")
    history = data.get("history", [])

    history_text = ""
    for msg in history[-6:]:
        role_label = "Student" if msg["role"] == "user" else "Teacher"
        history_text += f"{role_label}: {msg['content']}\n"

    system = "You are an expert AI Teacher. Adapt your explanations based on the student's level. Always be clear, patient, and encouraging."

    prompt = f"""Topic: {topic}
Student Level: {difficulty}

TEACHING RULES:
- Beginner: Simple analogies, no jargon, explain like the student is new to this.
- Intermediate: Technical terms with clear examples.
- Advanced: Deep dives, edge cases, expert-level discussion.
- Always end with: "Do you want me to explain anything further?"
- Use **bold** for key terms, '-' for bullet points.

CONVERSATION SO FAR:
{history_text}

Student: {question}
Teacher:"""

    # For multi-turn chat, use Groq's full chat API for better context handling
    try:
        messages = [{"role": "system", "content": system}]
        for msg in history[-6:]:
            messages.append({
                "role": "user" if msg["role"] == "user" else "assistant",
                "content": msg["content"]
            })
        messages.append({"role": "user", "content": question})

        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            max_tokens=1024,
            temperature=0.7
        )
        return jsonify({"success": True, "response": response.choices[0].message.content})
    except Exception as e:
        print(f"Groq tutor failed: {e}")

    # Fallback to Gemini
    result = call_ai(prompt=prompt, system_prompt=system)
    if result:
        return jsonify({"success": True, "response": result})

    return jsonify({"success": False, "message": "AI service unavailable."})


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
