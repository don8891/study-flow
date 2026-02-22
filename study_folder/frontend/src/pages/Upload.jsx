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
      
      // Time tracking for real-time schedule
      const startHour = studyPreference === "morning" ? 8 : 14; // 8 AM or 2 PM
      let currentTimePointer = new Map(); // Tracks current time for each date

      let taskCounter = 0;
      res.topics.forEach((mainItem, topicIndex) => {
        const targetDay = Math.floor(topicIndex * studyDays / res.topics.length);
        const studyDate = addDays(today, targetDay);
        const dateStr = format(studyDate, "yyyy-MM-dd");

        // Initialize time for this date if it's the first task
        if (!currentTimePointer.has(dateStr)) {
          const startTime = new Date(studyDate);
          startTime.setHours(startHour, 0, 0, 0);
          currentTimePointer.set(dateStr, startTime);
        }

        const itemsToSchedule = mainItem.subtopics.length > 0 
          ? mainItem.subtopics 
          : [mainItem.topic];

        itemsToSchedule.forEach((subtopic, subIndex) => {
          taskCounter++;
          
          let dayTime = currentTimePointer.get(dateStr);

          // Focus Session
          const focusStart = format(dayTime, "hh:mm a");
          dayTime.setMinutes(dayTime.getMinutes() + 25);
          const focusEnd = format(dayTime, "hh:mm a");

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

          // Break
          const isLongBreak = taskCounter % 4 === 0;
          const breakDuration = isLongBreak ? 20 : 5;
          
          const breakStart = format(dayTime, "hh:mm a");
          dayTime.setMinutes(dayTime.getMinutes() + breakDuration);
          const breakEnd = format(dayTime, "hh:mm a");

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

          currentTimePointer.set(dateStr, dayTime);
        });
      });

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
