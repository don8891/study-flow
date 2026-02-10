import Card from "../components/Card";
import { logoutUser } from "../api/api";

function Profile({ onLogout }) {
  async function handleLogout() {
    await logoutUser();
    onLogout();
  }

  return (
    <div className="page">
      <h2>Profile</h2>

      <Card title="Account">
        <p>Firebase Auth User</p>
      </Card>

      <button onClick={handleLogout} style={{ width: "100%" }}>
        Logout
      </button>
    </div>
  );
}

export default Profile;
