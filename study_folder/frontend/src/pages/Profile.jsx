import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { getUserProfile } from "../api/firestore";
import { logoutUser } from "../api/api";
import Card from "../components/Card";

function Profile({ onLogout }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      getUserProfile(user.uid).then(setProfile);
    }
  }, []);

  async function handleLogout() {
    await logoutUser();
    onLogout();
  }

  return (
    <div className="page">
      <h2>Profile</h2>

      {profile && (
        <Card title="Account">
          <p>Email: {profile.email}</p>
          <p>Streak: {profile.streak} days</p>
          <p>Total Hours: {profile.totalHours}</p>
        </Card>
      )}

      <button onClick={handleLogout} style={{ width: "100%" }}>
        Logout
      </button>
    </div>
  );
}

export default Profile;

