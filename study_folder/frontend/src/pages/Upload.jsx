import React from "react";
import Card from "../components/Card";
import { uploadSyllabus } from "../api/api";
import { auth } from "../firebase";
import { differenceInDays, addDays, format } from "date-fns";
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
    const totalDays = differenceInDays(exam, today);

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
      const studyDays = totalDays - 2;
      // Map topics to study days using an Even Distribution algorithm
      // This ensures topics are spread across the entire study period
      // instead of being stacked at the beginning.
      topics.forEach((topic, index) => {
        // Calculate target day by spreading index across total studyDays
        const targetDay = Math.floor(index * studyDays / topics.length);
        const studyDate = addDays(today, targetDay);

        tasks.push({
          date: format(studyDate, "yyyy-MM-dd"),
          topic,
          duration: "2 hours",
          completed: false
        });
      });

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

      const planId = await saveStudyPlan(uid, tasks, syllabusName);
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
    <div className="page">
      <h2>Generate Study Plan</h2>

      <Card title="Syllabus Name">
        <input
          type="text"
          placeholder="e.g. Physics 101, Final Exam"
          value={syllabusName}
          onChange={(e) => setSyllabusName(e.target.value)}
        />
      </Card>

      <Card title="Upload Content">
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
