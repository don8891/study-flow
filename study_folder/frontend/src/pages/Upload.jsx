import { useState } from "react";
import Card from "../components/Card";
import { uploadSyllabus } from "../api/api";
import { auth } from "../firebase";
import { differenceInDays, addDays, format } from "date-fns";
import { saveStudyPlan } from "../api/firestore";

function Upload({ file, setFile, examDate, setExamDate, status, setStatus, setPage }) {
  async function handleUpload() {
    if (!file || !examDate) {
      alert("Please select syllabus and exam date");
      return;
    }

    const today = new Date();
    const exam = new Date(examDate);
    const totalDays = differenceInDays(exam, today);

    if (totalDays <= 0) {
      alert("Exam date must be in the future");
      return;
    }

    const uid = auth.currentUser.uid;
    setStatus("Generating Study Plan...");

    const res = await uploadSyllabus(file, uid);

    if (res.success) {
      const topics = res.topics;
      const tasks = [];

      topics.forEach((topic, index) => {
        const dayOffset = index % totalDays;
        const studyDate = addDays(today, dayOffset);

        tasks.push({
          date: format(studyDate, "yyyy-MM-dd"),
          topic,
          duration: "2 hours",
          completed: false
        });
      });

      await saveStudyPlan(uid, tasks);
      setStatus("Study plan created successfully!");
      
      // Automatically navigate to calendar after a short delay
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
