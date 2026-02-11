import { useState } from "react";
import Dashboard from "./Dashboard";
import Planner from "./Planner";
import Profile from "./Profile";
import Upload from "./Upload"; // Import Upload
import BottomNav from "../components/BottomNav";

function Home({ onLogout }) {
  const [page, setPage] = useState("home");

  function goToUpload() {
    setPage("upload");
  }

  return (
    <div style={{ paddingBottom: "80px" }}>
      {page === "home" && <Dashboard goToUpload={goToUpload} />}
      {page === "upload" && <Upload />}
      {page === "calendar" && <Planner />}
      {page === "profile" && <Profile onLogout={onLogout} />}

      <BottomNav page={page} setPage={setPage} />
    </div>
  );
}

export default Home;
