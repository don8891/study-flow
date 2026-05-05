<<<<<<< HEAD
# 📚 Study Flow 🚀

**AI-Powered Personalized Study Management System**

Study Flow is an advanced AI-driven study companion that transforms raw syllabus content into a structured, strategic learning path. By combining OCR, cloud-based large language models, and productivity techniques, it enables students to plan, learn, and track progress efficiently in one unified platform.

---

## ✨ Key Features

### 🎯 AI Quiz Master

* Generates conceptual MCQs directly from syllabus topics
* Provides real-time scoring and percentage analysis
* Includes detailed answer review with explanations

### 📘 Smart Study Guide

* Converts syllabus into structured study blocks
* Highlights key concepts, theories, and mnemonics
* Simplifies complex topics for faster understanding

### 💬 Instant Doubt Clearing

* AI-powered tutor trained on syllabus context
* Provides explanations, summaries, and clarifications
* Enables interactive learning through chat

### ⏱️ Pro Pomodoro & Planner

* Integrated study timer for focused sessions
* Interactive calendar with daily task tracking
* Supports manual task completion and planning

### 🖼️ OCR Syllabus Upload

* Upload syllabus as images or PDFs
* Extracts and digitizes content using Tesseract OCR
* Eliminates manual data entry

### 🌐 Network-Ready Access

* Accessible across devices on the same local network
* Seamless experience on mobile, tablet, and desktop

---

## 🛠️ Tech Stack

### **Frontend**

* **React 19 (Vite/Rolldown):** Fast, modern UI framework
* **Firebase Auth & Firestore:** Real-time database and authentication
* **Vanilla CSS:** Glassmorphism-based dark UI design
* **Date-fns:** Efficient date and scheduling utilities

### **Backend**

* **Flask (Python):** Lightweight and high-performance API framework
* **Groq API (Llama 3.1 8B Instant):** Primary AI engine for fast inference
* **Google Gemini (gemini-1.5-flash):** Fallback AI engine for reliability
* **Tesseract OCR & PyPDF2:** Syllabus extraction from images and PDFs
* **Flask-CORS:** Secure cross-origin communication

---

## 🤖 AI Architecture

Study Flow uses a **dual-engine AI system** for reliability and performance:

* **Primary Engine:** Groq (Llama 3.1 8B Instant)
* **Fallback Engine:** Google Gemini (gemini-1.5-flash)

If the primary model fails or is rate-limited, the system automatically switches to the fallback model. This ensures uninterrupted functionality without requiring local GPU resources.

---

## 🚀 Getting Started

### **1. Prerequisites**

* Install **Tesseract OCR** (Windows required)
* Install **Node.js** and **Python 3.x**
* Obtain:

  * Groq API Key
  * Google Gemini API Key

---

### **2. Backend Setup**

=======
# Study Flow 📚🚀
Study Flow is an advanced, AI-powered study companion designed to transform your syllabus into a strategic learning path. It combines cloud LLM intelligence, OCR technology, and classic productivity techniques to help students master their subjects efficiently.

## ✨ Key Features
* **🎯 AI Quiz Master:** Generate conceptual multiple-choice quizzes directly from your syllabus. Features real-time scoring, percentage breakdowns, and detailed review modes.
* **📘 Smart Study Guide:** Instantly summarize complex syllabi into actionable study blocks with mnemonic tips and key theories.
* **💬 Instant Doubt Clear:** Chat with an AI tutor trained on your specific syllabus context.
* **⏱️ Pro Pomodoro & Planner:** Integrated study timer with manual task completion and an interactive calendar to track your learning journey.
* **🖼️ OCR Syllabus Upload:** Upload syllabus PDFs or images; the system extracts content automatically using Tesseract OCR.
* **🌐 Network-Ready:** Host the app on your local network to access your study flow from any phone or tablet in your house.

## 🛠️ Tech Stack

### Frontend
* React 19 with Vite/Rolldown
* Firebase Auth & Firestore: Real-time data persistence and user management.
* Vanilla CSS: Premium, dark-mode glassmorphism design system.
* Date-fns: Precision scheduling and calendar logic.

### Backend
* Flask (Python): High-performance micro-framework.
* Groq API (Llama 3.1 8B Instant): Primary AI engine — ultra-fast cloud inference, free tier available.
* Google Gemini (gemini-1.5-flash): Fallback AI engine if Groq is unavailable.
* Tesseract OCR & PyPDF2: Robust syllabus parsing from various file formats.
* Flask-CORS: Secure cross-origin resource sharing.

## 🚀 Getting Started

### 1. Prerequisites
* Tesseract OCR (Windows installation required)
* Node.js & Python 3.x
* A free Groq API Key
* A free Google Gemini API Key (for fallback)

### 2. Backend Setup
>>>>>>> ab026de (Enabled option to upload PDF)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```
<<<<<<< HEAD

Create a `.env` file in the `backend/` folder:

=======
Create a `.env` file in the `backend/` folder:
>>>>>>> ab026de (Enabled option to upload PDF)
```env
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```
<<<<<<< HEAD

Start the backend server:

```bash
python app.py
```

> Ensure the Tesseract path in `app.py` matches your installation
> Default: `C:\Program Files\Tesseract-OCR\tesseract.exe`

---

### **3. Frontend Setup**

=======
Then start the server:
```bash
python app.py
```
> [!NOTE]
> Ensure the Tesseract path in `app.py` matches your installation (default: `C:\Program Files\Tesseract-OCR\tesseract.exe`).

### 3. Frontend Setup
>>>>>>> ab026de (Enabled option to upload PDF)
```bash
cd frontend
npm install
npm run dev -- --host
```

<<<<<<< HEAD
---

## 📊 Core Workflow

1. User uploads syllabus (image/PDF)
2. OCR extracts and digitizes text
3. AI processes and structures topics
4. Scheduler generates personalized study plan
5. User interacts via planner, quizzes, and AI tutor
6. Progress is tracked and visualized

---

## 🎯 Key Advantages

* Fully automated study planning
* All-in-one platform (planning + learning + testing)
* Real-time AI assistance
* Cross-device accessibility
* Scalable and extensible architecture

---

## 📌 Future Enhancements

* Advanced analytics and performance insights
* Adaptive learning based on user behavior
* Multi-user collaboration features
* Mobile app deployment

---

## 🙌 Acknowledgment

This project was developed as part of a B.Tech mini project to address real-world challenges in student productivity and learning efficiency.

---

## 📬 Contact

For queries or collaboration, feel free to connect.

---

⭐ If you found this project useful, consider giving it a star on GitHub!
=======
## 🤖 AI Architecture
Study Flow uses a dual-engine fallback system for maximum reliability:
* **Groq (Primary)** — Runs `llama-3.1-8b-instant` for near-instant responses with no local GPU required.
* **Google Gemini (Fallback)** — Automatically kicks in if Groq is unavailable or rate-limited.

This ensures the app stays functional even if one provider has downtime, with zero dependency on local hardware.
>>>>>>> ab026de (Enabled option to upload PDF)
