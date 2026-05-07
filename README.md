# 📚 Study Flow

**AI-Powered Personalized Study Management System**

> Live Demo: [study-flow-pi-six.vercel.app](https://study-flow-pi-six.vercel.app)

Study Flow transforms your raw syllabus into a structured, AI-driven learning path. Upload a PDF or image of your syllabus, and the app extracts topics, builds a personalized Pomodoro-based study schedule, lets you chat with an AI tutor, generates quizzes, and tracks your XP and streaks — all in one platform.

---

## ✨ Features

### 🎯 AI Quiz Master
- Generates 5 unique MCQs directly from your uploaded syllabus
- Real-time scoring with percentage breakdown
- Detailed answer review with AI-generated explanations

### 📘 Smart Study Guide
- Converts your syllabus into a structured, bullet-pointed revision guide
- Highlights key concepts, mnemonics, and fast-revision notes

### 💬 Instant Doubt Clearing
- Context-aware AI tutor chat, grounded in your syllabus content
- Auto-generates visual diagrams for each concept (via Gemini / Pollinations.ai fallback)

### ⏱️ Pomodoro Planner
- Auto-schedules 25-min focus sessions + short/long breaks across your calendar
- Global timer that persists across page navigation
- XP awarded (+10) on each completed session
- Auto-reschedules missed tasks to today onwards

### 🖼️ OCR Syllabus Upload
- Supports PDF and image uploads
- Tesseract OCR extracts text from images; PyPDF2 handles PDFs
- AI cleans and structures raw text into topics and subtopics

### 🏆 Gamification
- XP points, streak tracking, and level progression (Seedling → Legend)
- Badge gallery unlocked by milestones
- Full completed task history with total minutes studied

### 📱 Responsive Design
- Full mobile support with a fixed bottom navigation bar
- Desktop sidebar layout on larger screens

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite (Rolldown) | UI framework |
| Firebase Auth | Email/password authentication |
| Firebase Firestore | Real-time database for plans, sessions, XP |
| Vanilla CSS | Glassmorphism UI, mobile-responsive |
| date-fns | Scheduling and calendar logic |
| react-calendar | Interactive calendar component |

### Backend
| Technology | Purpose |
|---|---|
| Flask (Python) | REST API server |
| Groq API (Llama 3.1 8B Instant) | Primary AI engine — fast inference |
| Google Gemini (gemini-1.5-flash) | Fallback AI + image generation |
| Tesseract OCR + Pillow | Syllabus extraction from images |
| PyPDF2 | Syllabus extraction from PDFs |
| Gunicorn | Production WSGI server |
| Flask-CORS | Cross-origin request handling |

### Infrastructure
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| Firebase Firestore | Database |

---

## 🤖 AI Architecture

Study Flow uses a **dual-engine fallback system**:

1. **Primary — Groq (Llama 3.1 8B Instant):** Ultra-fast cloud inference, free tier
2. **Fallback — Google Gemini (gemini-1.5-flash):** Kicks in automatically if Groq is unavailable or rate-limited

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 20+
- Python 3.10+
- Tesseract OCR installed (Windows: `C:\Program Files\Tesseract-OCR\tesseract.exe`)

### 1. Clone the repository
```bash
git clone https://github.com/don8891/Health-Chatbot-.git
cd study_folder
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```env
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend:
```bash
python app.py
```

> Backend runs on `http://localhost:10000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

> Frontend runs on `http://localhost:5173`

---

## 📁 Project Structure
