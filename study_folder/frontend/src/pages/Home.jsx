import { useState } from "react";
import Dashboard from "./Dashboard";
import Planner from "./Planner";
import Profile from "./Profile";
import BottomNav from "../components/BottomNav";

function Home() {
  const [page, setPage] = useState("home");

  return (
    <div style={{ paddingBottom: "80px" }}>
      {page === "home" && <Dashboard />}
      {page === "calendar" && <Planner />}
      {page === "profile" && <Profile />}

      <BottomNav page={page} setPage={setPage} />
    </div>
  );
}

export default Home;

