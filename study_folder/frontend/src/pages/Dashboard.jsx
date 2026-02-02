import Card from "../components/Card";

function Dashboard() {
  return (
    <div className="page">
      <h2>Dashboard</h2>

      <Card title="Today's Progress">
        <p>Tasks completed: 0 / 3</p>
        <p>Study time: 0 hours</p>
      </Card>

      <Card title="Streak">
        <p>Current streak: 0 days</p>
      </Card>
    </div>
  );
}

export default Dashboard;

