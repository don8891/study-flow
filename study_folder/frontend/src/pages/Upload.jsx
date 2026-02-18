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
      // Map topics to study days using an Even Distribution algorithm
      // This ensures topics are spread across the entire study period
      // instead of being stacked at the beginning.
      topics.forEach((topic, index) => {
        // Calculate target day by spreading index across total studyDays
        const targetDay = Math.floor(index * studyDays / topics.length);
        const studyDate = addDays(today, targetDay);
        const dateStr = format(studyDate, "yyyy-MM-dd");

        // Study Session
        tasks.push({
          date: dateStr,
          topic: `Study: ${topic}`,
          duration: "90", // 1 hr 30 min
          completed: false
        });

        // Rest Session
        tasks.push({
          date: dateStr,
          topic: "Rest & Recharge ☕",
          duration: "15", // 15 min
          completed: false
        });
      });

      const examDayMinus1 = addDays(today, totalDays - 1);
      tasks.push({
        date: format(examDayMinus1, "yyyy-MM-dd"),
        topic: "Comprehensive Revision",
        duration: "180", // Default to 180 minutes
        completed: false
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
