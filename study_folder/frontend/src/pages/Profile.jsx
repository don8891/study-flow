import Card from "../components/Card";

function Profile({ onLogout }) {
  return (
    <div className="page">
      <h2>Profile</h2>

      <Card title="Account">
        <p>Email: user@example.com</p>
      </Card>

      <button
        style={{ width: "100%" }}
        onClick={() => {
          onLogout();
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Profile;
