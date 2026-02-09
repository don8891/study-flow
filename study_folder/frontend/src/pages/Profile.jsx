import Card from "../components/Card";

function Profile() {
  const user = {
    email: "user@example.com"
  };

  return (
    <div className="page">
      <h2>Profile</h2>

      <Card title="Account">
        <p>Email: {user.email}</p>
      </Card>

      <Card title="Statistics">
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
