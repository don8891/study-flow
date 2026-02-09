import { useEffect, useState } from "react";
import Card from "../components/Card";
import { checkBackend } from "../api/api";

function Dashboard() {
  const [backendStatus, setBackendStatus] = useState("");

  useEffect(() => {
    checkBackend().then((data) => {
      setBackendStatus(data.message);
    });
  }, []);

  return (
    <div className="page">
      <h2>Dashboard</h2>

      <Card title="Backend Status">
        <p>{backendStatus || "Checking..."}</p>
      </Card>
    </div>
  );
}

export default Dashboard;
