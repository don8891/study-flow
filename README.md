# Study Flow 📚🚀

Study Flow is an advanced, AI-powered study companion designed to transform your syllabus into a strategic learning path. It combines local LLM intelligence, OCR technology, and classic productivity techniques to help students master their subjects efficiently.

## ✨ Key Features

- **🎯 AI Quiz Master**: Generate conceptual multiple-choice quizzes directly from your syllabus. Features real-time scoring, percentage breakdowns, and detailed review modes.
- **📘 Smart Study Guide**: Instantly summarize complex syllabi into actionable study blocks with mnemonic tips and key theories.
- **💬 Instant Doubt Clear**: Chat with a local AI tutor trained on your specific syllabus context.
- **⏱️ Pro Pomodoro & Planner**: Integrated study timer with manual task completion and an interactive calendar to track your learning journey.
- **🖼️ OCR Syllabus Upload**: Upload syllabus PDFs or images; the system extracts content automatically using Tesseract OCR.
- **🌐 Network-Ready**: Host the app on your local network to access your study flow from any phone or tablet in your house.

## 🛠️ Tech Stack

### Frontend

- **React 19** with Vite/Rolldown
- **Firebase Auth & Firestore**: Real-time data persistence and user management.
- **Vanilla CSS**: Premium, dark-mode glassmorphism design system.
- **Date-fns**: Precision scheduling and calendar logic.

### Backend

- **Flask (Python)**: High-performance micro-framework.
- **Local AI (Ollama)**: powered by `Llama-3` or `Mistral` for privacy-focused, zero-cost AI.
- **Tesseract OCR & PyPDF2**: Robust syllabus parsing from various file formats.
- **Flask-CORS**: Secure cross-origin resource sharing.

## 🚀 Getting Started

### 1. Prerequisites

- [Ollama](https://ollama.com/) (Run `ollama run llama3`)
- [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki) (Windows installation required)
- Node.js & Python 3.x

### 2. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

> [!NOTE]
> Ensure the Tesseract path in `app.py` matches your installation (default: `C:\Program Files\Tesseract-OCR\tesseract.exe`).

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev -- --host
```

### 4. Network Configuration

To use the app on mobile devices:

1. Find your local IP (e.g., `192.168.1.3`).
2. Update `frontend/src/api/api.js` to point to `http://YOUR_IP:5000`.
3. Open `http://YOUR_IP:5173` on your mobile browser.

## 🛡️ License

MIT License - Developed for elite students.
