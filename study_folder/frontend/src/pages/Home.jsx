import { useState } from "react";
import Dashboard from "./Dashboard";
import Upload from "./Upload";
import Planner from "./Planner";
import BottomNav from "../components/BottomNav";

function Home() {
  const [page, setPage] = useState("dashboard");

  return (
    <div style={{ paddingBottom: "60px" }}>
      {page === "dashboard" && <Dashboard />}
      {page === "upload" && <Upload />}
      {page === "planner" && <Planner />}

      <BottomNav setPage={setPage} />
    </div>
  );
}

export default Home;
