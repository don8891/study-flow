import React from "react";
import Card from "../components/Card";
import { uploadSyllabus } from "../api/api";
import { auth } from "../firebase";
import { differenceInCalendarDays, addDays, format } from "date-fns";
import { saveStudyPlan } from "../api/firestore";

function Upload({ 
  file, setFile, 
  syllabusName, setSyllabusName,
  examDate, setExamDate, 
  status, setStatus, 
  setPage, setActivePlanId,
  setSyllabusText
}) {
  const [studyPreference, setStudyPreference] = React.useState("morning");
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

    const res = await uploadSyllabus(file, uid);

    if (res.success) {
      setSyllabusText(res.text); // Save the extracted text for AI features
      const topics = res.topics;

      if (topics.length === 0) {
        alert("No clear topics were found. Please try a different file.");
        setStatus("Generation failed - No topics found.");
        return;
      }

      const tasks = [];
      const studyDays = totalDays - 1; // Only 1 day for revision
      const maxMinsPerDay = studyHours * 60;
      
      // Time tracking for real-time schedule
      const startHour = studyPreference === "morning" ? 8 : 14; 
      let currentStudyDate = new Date(today);
      let currentTimePointer = new Date(currentStudyDate);
      currentTimePointer.setHours(startHour, 0, 0, 0);
      
      let minsUsedToday = 0;
      let taskCounter = 0;

      res.topics.forEach((mainItem, topicIndex) => {
        const itemsToSchedule = mainItem.subtopics.length > 0 
          ? mainItem.subtopics 
          : [mainItem.topic];

        itemsToSchedule.forEach((subtopic, subIndex) => {
          // If we exceed daily limit, move to next day
          if (minsUsedToday + 30 > maxMinsPerDay) { // 25 min session + 5 min break buffer
            currentStudyDate = addDays(currentStudyDate, 1);
            currentTimePointer = new Date(currentStudyDate);
            currentTimePointer.setHours(startHour, 0, 0, 0);
            minsUsedToday = 0;
            taskCounter = 0; // Reset counter for long break tracking
          }

          const dateStr = format(currentStudyDate, "yyyy-MM-dd");
          taskCounter++;
          
          // Focus Session
          const focusStart = format(currentTimePointer, "hh:mm a");
          currentTimePointer.setMinutes(currentTimePointer.getMinutes() + 25);
          const focusEnd = format(currentTimePointer, "hh:mm a");

          tasks.push({
            date: dateStr,
            topic: subIndex === 0 && mainItem.subtopics.length > 0 
              ? `${mainItem.topic}: ${subtopic}` 
              : subtopic,
            duration: "25",
            completed: false,
            type: "focus",
            startTime: focusStart,
            endTime: focusEnd,
            preference: studyPreference
          });

          minsUsedToday += 25;

          // Break
          const isLongBreak = taskCounter % 4 === 0;
          const breakDuration = isLongBreak ? 20 : 5;
          
          const breakStart = format(currentTimePointer, "hh:mm a");
          currentTimePointer.setMinutes(currentTimePointer.getMinutes() + breakDuration);
          const breakEnd = format(currentTimePointer, "hh:mm a");

          tasks.push({
            date: dateStr,
            topic: isLongBreak ? "Long Break 🧘" : "Short Break ☕",
            duration: breakDuration.toString(),
            completed: false,
            type: "break",
            startTime: breakStart,
            endTime: breakEnd,
            preference: studyPreference
          });

          minsUsedToday += breakDuration;
        });
      });

      // Final Check: Validation for exam date
      const lastTaskDate = tasks.length > 0 ? new Date(tasks[tasks.length - 1].date) : today;
      if (lastTaskDate >= exam) {
        setStatus("Warning: Syllabus is too large for these hours. Plan extends to exam date.");
      }

      const planId = await saveStudyPlan(uid, tasks, syllabusName, examDate);
      setActivePlanId(planId);
      setStatus("Study plan created successfully!");
      
      setTimeout(() => {
        setPage("calendar");
      }, 1500);
    } else {
      setStatus("Upload failed");
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

      <Card title="Study Preference">
        <p style={{ marginBottom: "15px", fontSize: "0.9rem" }}>When are you most comfortable studying?</p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={() => setStudyPreference("morning")}
            style={{ 
              flex: 1, 
              padding: "16px", 
              background: studyPreference === "morning" ? "var(--primary)" : "rgba(255,255,255,0.05)",
              color: studyPreference === "morning" ? "white" : "var(--text)",
              border: "none",
              borderRadius: "16px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.2s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>☀️</span>
            <span>Morning (Starts 8 AM)</span>
          </button>
          <button 
            onClick={() => setStudyPreference("afternoon")}
            style={{ 
              flex: 1, 
              padding: "16px", 
              background: studyPreference === "afternoon" ? "var(--primary)" : "rgba(255,255,255,0.05)",
              color: studyPreference === "afternoon" ? "white" : "var(--text)",
              border: "none",
              borderRadius: "16px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.2s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>🌅</span>
            <span>Afternoon (Starts 2 PM)</span>
          </button>
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
