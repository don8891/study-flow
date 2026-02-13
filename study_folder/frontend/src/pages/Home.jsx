import { useState } from "react";
import Dashboard from "./Dashboard";
import Planner from "./Planner";
import Profile from "./Profile";
import Upload from "./Upload"; // Import Upload
import BottomNav from "../components/BottomNav";

function Home({ onLogout }) {
  const [page, setPage] = useState("home");
  const [activePlanId, setActivePlanId] = useState(null);
  
  // Persisted state for Upload page
  const [uploadFile, setUploadFile] = useState(null);
  const [syllabusName, setSyllabusName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");

  function goToUpload() {
    setPage("upload");
  }

  return (
    <div style={{ paddingBottom: "80px" }}>
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
        />
      )}
      {page === "calendar" && <Planner activePlanId={activePlanId} />}
      {page === "profile" && <Profile onLogout={onLogout} />}

      <BottomNav page={page} setPage={setPage} />
    </div>
  );
}

export default Home;
