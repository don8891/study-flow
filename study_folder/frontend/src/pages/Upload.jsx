import React from "react";
import Card from "../components/Card";
import { uploadSyllabus } from "../api/api";
import { auth } from "../firebase";
import { differenceInCalendarDays, addDays, format } from "date-fns";
import { saveStudyPlan } from "../api/firestore";
import { generateTasks } from "../utils/scheduler";

function Upload({ 
  file, setFile, 
  syllabusName, setSyllabusName,
  examDate, setExamDate, 
  status, setStatus, 
  setPage, setActivePlanId,
  setSyllabusText
}) {
  const [startTime, setStartTime] = React.useState("09:00");
  const [studyHours, setStudyHours] = React.useState(4);

  async function handleUpload() {
    if (!file || !examDate || !syllabusName.trim()) {
      alert("Please provide a syllabus name, upload a file, and select an exam date.");
      return;
    }

    const today = new Date();
    const exam = new Date(examDate);
    const totalDays = differenceInCalendarDays(exam, today);

    if (totalDays < 3) {
      alert("Your exam is too close! Please select a date at least 3 days away.");
      return;
    }

    const uid = auth.currentUser.uid;
    setStatus("Generating Your Plan...");

    try {
      const res = await uploadSyllabus(file, uid);

      if (res.success) {
        setSyllabusText(res.text); // Save the extracted text for AI features
        const topics = res.topics;

        if (topics.length === 0) {
          alert("No clear topics were found. Please try a different file.");
          setStatus("Generation failed - No topics found.");
          return;
        }

        const tasks = generateTasks(res.topics, examDate, studyHours, startTime);

        // Final Check: Validation for exam date
        const lastTaskDate = tasks.length > 0 ? new Date(tasks[tasks.length - 1].date) : today;
        if (lastTaskDate >= exam) {
          setStatus("Warning: Syllabus is too large for these hours. Plan extends to exam date.");
        }

        try {
          const planId = await saveStudyPlan(uid, tasks, syllabusName, examDate, {
            topics: res.topics,
            hours: studyHours,
            preference: startTime,
            syllabusText: res.text
          });
          setActivePlanId(planId);
        } catch (dbErr) {
          console.error("Database save failed:", dbErr);
          setStatus("Plan generated, but failed to save to Dashboard. Check Firestore rules.");
          return;
        }
        setStatus("Study plan created successfully!");
        
        setTimeout(() => {
          setPage("calendar");
        }, 1500);
      } else {
        setStatus("Upload failed: " + (res.message || "Unknown backend error"));
      }
    } catch (error) {
      console.error("Critical error during plan generation:", error);
      if (error.message.includes("fetch")) {
        setStatus("Error: Cannot connect to Backend. Please ensure python app.py is running.");
      } else {
        setStatus("Error: " + error.message);
      }
    }
  }

  return (
    <div className="page" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: "var(--primary)", marginBottom: "30px" }}>Create Study Plan</h1>

      <Card title="Plan Name">
        <div className="input-group">
          <input
            type="text"
            placeholder="e.g., Final Exams Preparations"
            value={syllabusName}
            onChange={(e) => setSyllabusName(e.target.value)}
          />
        </div>
      </Card>

      <Card title="Upload Syllabus">
        <p style={{ marginBottom: "15px", fontSize: "0.9rem" }}>Upload your syllabus in PDF or Image format.</p>
        <div className="input-group">
          <input
            type="file"
            accept=".pdf,image/*"
            style={{ padding: "10px" }}
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
        {file && <p style={{ fontSize: '0.8rem', marginTop: '10px', color: 'var(--primary)', fontWeight: 'bold' }}>Selected: {file.name}</p>}
      </Card>

      <Card title="Target Exam Date">
        <div className="input-group">
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
          />
        </div>
      </Card>

      <Card title="Daily Study Limit">
        <p style={{ marginBottom: "15px", fontSize: "0.9rem" }}>How many hours can you dedicate each day?</p>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <input 
            type="range" 
            min="1" 
            max="12" 
            value={studyHours} 
            onChange={(e) => setStudyHours(parseInt(e.target.value))}
            style={{ flex: 1, accentColor: "var(--primary)" }}
          />
          <span style={{ 
            fontSize: "1.2rem", 
            fontWeight: "bold", 
            color: "var(--primary)",
            minWidth: "80px",
            textAlign: "right"
          }}>
            {studyHours} {studyHours === 1 ? "Hour" : "Hours"}
          </span>
        </div>
      </Card>

      <Card title="Starting Time">
        <p style={{ marginBottom: "15px", fontSize: "0.9rem" }}>When would you like to start your daily study sessions?</p>
        <div className="input-group">
          <input 
            type="time" 
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{ width: "100%", padding: "12px", fontSize: "1rem", borderRadius: "10px", border: "1px solid var(--border)" }}
          />
        </div>
      </Card>

      <button onClick={handleUpload} style={{ width: "100%", padding: "16px", fontSize: "1.1rem" }}>
        Generate My Intelligent Plan
      </button>

      {status && (
        <div style={{ 
          marginTop: "20px", 
          padding: "15px", 
          background: "var(--primary-light)", 
          borderRadius: "12px",
          color: "var(--primary)",
          textAlign: "center",
          fontWeight: "bold"
        }}>
          {status}
        </div>
      )}
    </div>
  );
}

export default Upload;
