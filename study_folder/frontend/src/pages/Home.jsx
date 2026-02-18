import { useState } from "react";
import Dashboard from "./Dashboard";
import Planner from "./Planner";
import Profile from "./Profile";
import Upload from "./Upload";
import Quiz from "./Quiz";
import AIAssistant from "./AIAssistant";
import BottomNav from "../components/BottomNav";

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
        {page === "calendar" && <Planner activePlanId={activePlanId} />}
        {page === "assistant" && <AIAssistant syllabusText={syllabusText} />}
        {page === "quiz" && <Quiz syllabusText={syllabusText} />}
        {page === "profile" && <Profile onLogout={onLogout} />}
      </main>
    </div>
  );
}

export default Home;
