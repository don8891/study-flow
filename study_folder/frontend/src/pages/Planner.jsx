import Card from "../components/Card";

function Planner() {
  const tasks = [];

  return (
    <div className="page">
      <h2>Study Planner</h2>

      {tasks.length === 0 ? (
        <Card>
          <p>No study plan generated yet.</p>
        </Card>
      ) : (
        tasks.map((task, index) => (
          <Card key={index} title={task.date}>
            <p>{task.topic}</p>
            <p>{task.duration}</p>
          </Card>
        ))
      )}
    </div>
  );
}

export default Planner;
