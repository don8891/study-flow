import Card from "../components/Card";

function Profile() {
  return (
    <div className="page">
      <h2>Profile</h2>

      <Card title="User Info">
        <p>Email: user@example.com</p>
      </Card>

      <Card title="Stats">
        <p>Total study hours: 0</p>
        <p>Current streak: 0 days</p>
      </Card>

      <button style={{ width: "100%" }}>
        Logout
      </button>
    </div>
  );
}

export default Profile;
