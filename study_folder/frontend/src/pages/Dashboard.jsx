import Card from "../components/Card";

function Dashboard() {
  const todayProgress = {
    completed: 0,
    total: 0,
    hours: 0
  };

  return (
    <div className="page">
      <h2>Dashboard</h2>

      <Card title="Today’s Progress">
        <p>
          Tasks completed: {todayProgress.completed} / {todayProgress.total}
        </p>
        
        <div style={{
          height: "8px",
          background: "#1e293b",
          borderRadius: "10px",
          overflow: "hidden",
          marginTop: "8px",
          marginBottom: "12px"
        }}>
          <div style={{
            width: "0%", // Will be dynamic later: `${(todayProgress.completed / todayProgress.total) * 100}%`
            height: "100%",
            background: "var(--success)",
            transition: "width 0.4s ease"
          }} />
        </div>

        <p>Study time: {todayProgress.hours} hours</p>
      </Card>

      <Card title="Streak">
        <p>Current streak: 0 days</p>
      </Card>
    </div>
  );
}

export default Dashboard;
