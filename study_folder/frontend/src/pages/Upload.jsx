import React from "react";
import Card from "../components/Card";
import { uploadSyllabus } from "../api/api";
import { auth } from "../firebase";
import { differenceInDays, addDays, format } from "date-fns";
import { saveStudyPlan } from "../api/firestore";

function Upload({ file, setFile, examDate, setExamDate, status, setStatus, setPage }) {
  async function handleUpload() {
    if (!file || !examDate) {
      alert("Please upload syllabus and select exam date");
      return;
    }

    const today = new Date();
    const exam = new Date(examDate);
    const totalDays = differenceInDays(exam, today);

    // Buffer Validation: Need at least 3 days for study + revision
    if (totalDays < 3) {
      alert("Your exam is too close! Please select a date at least 3 days away for a structured plan.");
      return;
    }

    const uid = auth.currentUser.uid;
    setStatus("Generating Your Plan...");

    const res = await uploadSyllabus(file, uid);

    if (res.success) {
      const topics = res.topics;

      if (topics.length === 0) {
        alert("No clear topics were found in your syllabus. Please try a different file or check the file quality.");
        setStatus("Generation failed - No topics found.");
        return;
      }

      const tasks = [];
      
      // Reserve last 2 days for revision
      const studyDays = totalDays - 2;
      
      // Map topics to study days
      // Anti-Overload: Max 3 topics per day
      topics.forEach((topic, index) => {
        const dayIndex = Math.floor(index / 3);
        
        // If topics exceed study days * 3, it will start overfilling earlier days
        // but it's better than dropping topics.
        const targetDay = dayIndex % studyDays;
        const studyDate = addDays(today, targetDay);

        tasks.push({
          date: format(studyDate, "yyyy-MM-dd"),
          topic,
          duration: "2 hours",
          completed: false
        });
      });

      // Add Revision Buffer (Last 2 days)
      const revisionStart = addDays(today, studyDays);
      const examDayMinus1 = addDays(today, totalDays - 1);

      [revisionStart, examDayMinus1].forEach(revDate => {
        tasks.push({
          date: format(revDate, "yyyy-MM-dd"),
          topic: "Comprehensive Revision",
          duration: "3 hours",
          completed: false
        });
      });

      await saveStudyPlan(uid, tasks);
      setStatus("Study plan created successfully!");
      
      setTimeout(() => {
        setPage("calendar");
      }, 1500);
    } else {
      setStatus("Upload failed");
    }
  }

  return (
    <div className="page">
      <h2>Generate Study Plan</h2>

      <Card title="Syllabus">
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        {file && <p style={{ fontSize: '0.8rem', marginTop: '5px', color: 'var(--primary)' }}>Selected: {file.name}</p>}
      </Card>

      <Card title="Exam Date">
        <input
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
        />
      </Card>

      <button onClick={handleUpload} className="btn-sm">
        Generate Plan
      </button>

      {status && <p style={{ marginTop: '15px' }}>{status}</p>}
    </div>
  );
}

export default Upload;
