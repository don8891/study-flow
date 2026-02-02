import Card from "../components/Card";

function Upload() {
  return (
    <div className="page">
      <h2>Generate Study Plan</h2>

      <Card title="Syllabus">
        <input type="file" />
      </Card>

      <Card title="Exam Date">
        <input type="date" />
      </Card>

      <button style={{ width: "100%" }}>
        Generate Plan
      </button>
    </div>
  );
}

export default Upload;

