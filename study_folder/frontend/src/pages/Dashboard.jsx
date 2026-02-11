import Card from "../components/Card";

function Dashboard({ goToUpload }) {
  return (
    <div className="page">
      <h2>Dashboard</h2>

      <button onClick={goToUpload} className="btn-sm">
        Upload Syllabus
      </button>
    </div>
  );
}

export default Dashboard;

