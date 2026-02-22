import { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import Planner from "./Planner";
import Profile from "./Profile";
import Upload from "./Upload";
import Quiz from "./Quiz";
import AIAssistant from "./AIAssistant";
import BottomNav from "../components/BottomNav";
import { auth } from "../firebase";
import { getStudyPlan, updatePlanTasks, recordActivity, logStudySession } from "../api/firestore";

function Home({ onLogout }) {
  const [page, setPage] = useState("home");
  const [activePlanId, setActivePlanId] = useState(null);
  
  // Persisted state for Upload page
  const [uploadFile, setUploadFile] = useState(null);
  const [syllabusName, setSyllabusName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  
  // State for AI features
  const [syllabusText, setSyllabusText] = useState("");

  // Global state to track running timer (Singleton pattern)
  const [activeTimerId, setActiveTimerId] = useState(null); 
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [timerTopic, setTimerTopic] = useState("");
  const [timerDuration, setTimerDuration] = useState(0);

  const handleTimerComplete = async () => {
    if (!activeTimerId) return;
    
    const uid = auth.currentUser?.uid;
    if (uid && activePlanId) {
      // 1. Log session
      const isBreak = timerTopic.toLowerCase().includes("break");
      const duration = parseInt(timerDuration);
      await logStudySession(uid, timerTopic, duration, isBreak ? "Break" : "Focus");

      // 2. Mark task as done in the plan
      const plan = await getStudyPlan(uid, activePlanId);
      if (plan && plan.tasks) {
        // Find the task using the activeTimerId (which matches uniqueId format: date-startTime-topic)
        const updatedTasks = plan.tasks.map(t => {
          const tId = `${t.date}-${t.startTime}-${t.topic}`;
          return tId === activeTimerId ? { ...t, completed: true } : t;
        });
        await updatePlanTasks(uid, activePlanId, updatedTasks);
        await recordActivity(uid);
      }
    }
    
    setActiveTimerId(null);
    setSecondsLeft(0);
  };

  // Background timer interval
  useEffect(() => {
    let interval = null;
    if (activeTimerId && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (activeTimerId && secondsLeft === 0) {
      handleTimerComplete();
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activeTimerId, secondsLeft]);

  const startGlobalTimer = (id, duration, topic) => {
    setActiveTimerId(id);
    setSecondsLeft(duration * 60);
    setTimerDuration(duration);
    setTimerTopic(topic);
  };

  function goToUpload() {
    setPage("upload");
  }

  return (
    <div className="app-container">
      <BottomNav page={page} setPage={setPage} onLogout={onLogout} />
      
      <main className="main-content">
        {page === "home" && (
          <Dashboard 
            goToUpload={goToUpload} 
            activePlanId={activePlanId} 
            setActivePlanId={setActivePlanId} 
            setPage={setPage}
            activeTimerId={activeTimerId}
            secondsLeft={secondsLeft}
            startGlobalTimer={startGlobalTimer}
          />
        )}
        {page === "upload" && (
          <Upload 
            file={uploadFile} 
            setFile={setUploadFile}
            syllabusName={syllabusName}
            setSyllabusName={setSyllabusName}
            examDate={examDate}
            setExamDate={setExamDate}
            status={uploadStatus}
            setStatus={setUploadStatus}
            setPage={setPage}
            setActivePlanId={setActivePlanId}
            setSyllabusText={setSyllabusText}
          />
        )}
        {page === "calendar" && (
          <Planner 
            activePlanId={activePlanId} 
            activeTimerId={activeTimerId}
            secondsLeft={secondsLeft}
            startGlobalTimer={startGlobalTimer}
          />
        )}
        {page === "assistant" && <AIAssistant syllabusText={syllabusText} />}
        {page === "quiz" && <Quiz syllabusText={syllabusText} />}
        {page === "profile" && <Profile onLogout={onLogout} />}
      </main>
    </div>
  );
}

export default Home;
