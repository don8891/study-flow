import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { getUserProfile, updateUsername, createUserProfile } from "../api/firestore";
import Card from "../components/Card";

const getLevelInfo = (xp) => {
  if (xp >= 1000) return { title: "Academic Legend", icon: "👑", next: "MAX", color: "#f59e0b" };
  if (xp >= 600) return { title: "Wisdom Warrior", icon: "🛡️", next: 1000, color: "#8b5cf6" };
  if (xp >= 300) return { title: "Knowledge Knight", icon: "⚔️", next: 600, color: "#ef4444" };
  if (xp >= 100) return { title: "Study Sprout", icon: "🌿", next: 300, color: "#10b981" };
  return { title: "Learning Seedling", icon: "🌱", next: 100, color: "#3b82f6" };
};

function Profile({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setError("Not logged in. Please log in again.");
        return;
      }

      setAuthUser(user);

      try {
        let data = await getUserProfile(user.uid);

        if (!data) {
          // Auto-create the profile if it doesn't exist
          await createUserProfile(user, user.displayName || "");
          data = {
            email: user.email,
            username: user.displayName || "",
            streak: 0,
            maxStreak: 0,
            totalXp: 0,
            badges: []
          };
        }

        // Always merge Firebase Auth email in case Firestore is missing it
        setProfile({ ...data, email: user.email });
        setNewUsername(data.username || "");
      } catch (err) {
        console.error("Error loading profile:", err);
        // Still show something useful even if Firestore fails
        setProfile({
          email: user.email,
          username: user.displayName || "",
          streak: 0,
          maxStreak: 0,
          totalXp: 0,
          badges: []
        });
      }
    });

    return () => unsubscribe();
  }, []);

  async function handleLogout() {
    await auth.signOut();
    onLogout();
  }

  async function handleUpdateUsername() {
    const user = auth.currentUser;
    if (user && newUsername.trim()) {
      try {
        await updateUsername(user.uid, newUsername.trim());
        setProfile((prev) => ({ ...prev, username: newUsername.trim() }));
        setIsEditing(false);
        alert("Username updated successfully! ✨");
      } catch (err) {
        console.error("Error updating username:", err);
        alert("Failed to update username. Please try again.");
      }
    }
  }

  if (error) {
    return (
      <div className="page" style={{ textAlign: "center", paddingTop: "100px" }}>
        <p style={{ color: "var(--error)" }}>{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page" style={{ textAlign: "center", paddingTop: "100px" }}>
        <h2 style={{ color: "var(--primary)" }}>Loading Profile...</h2>
        <p style={{ color: "var(--text-muted)" }}>Fetching your study identity...</p>
      </div>
    );
  }

  const displayName = profile.username || authUser?.displayName || "";
  const displayEmail = profile.email || authUser?.email || "";
  const avatarLetter = (displayName || displayEmail).charAt(0).toUpperCase() || "?";
  const xp = profile.totalXp || 0;
  const level = getLevelInfo(xp);
  const nextTarget = level.next === "MAX" ? xp : level.next;
  const prevTarget = xp >= 600 ? 600 : xp >= 300 ? 300 : xp >= 100 ? 100 : 0;
  const levelProgress = level.next === "MAX" ? 100 : ((xp - prevTarget) / (nextTarget - prevTarget)) * 100;

  return (
    <div className="page" style={{ paddingBottom: "100px" }}>
      <h1 style={{ color: "var(--primary)", marginBottom: "30px" }}>My Study Identity</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        {/* Left Column: Avatar & Basic Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Card>
            <div style={{ textAlign: "center", paddingTop: "10px" }}>
              {/* Avatar Circle */}
              <div style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary), var(--accent))",
                margin: "0 auto 20px auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3rem",
                color: "white",
                boxShadow: "0 10px 20px rgba(17, 94, 89, 0.2)"
              }}>
                {avatarLetter}
              </div>

              {/* Username */}
              {isEditing ? (
                <div style={{ marginBottom: "15px" }}>
                  <div className="input-group">
                    <input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Set your username"
                      style={{ textAlign: "center" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "10px" }}>
                    <button className="btn-sm" onClick={handleUpdateUsername}>Save</button>
                    <button className="btn-sm" style={{ background: "#e5e7eb", color: "#374151" }} onClick={() => setIsEditing(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: "15px" }}>
                  <h2 style={{ margin: "0 0 5px 0", fontSize: "1.3rem", color: "var(--text-main)" }}>
                    {displayName || "Study Master"}
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent)",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      padding: 0
                    }}
                  >
                    ✎ Edit Username
                  </button>
                </div>
              )}

              {/* Email */}
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem" }}>
                {displayEmail}
              </p>

              {/* Level Badge */}
              <div style={{
                marginTop: "20px",
                padding: "10px 16px",
                background: "var(--primary-light)",
                borderRadius: "16px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span style={{ fontSize: "1.2rem" }}>{level.icon}</span>
                <span style={{ fontWeight: "bold", color: "var(--primary)", fontSize: "0.9rem" }}>
                  {level.title}
                </span>
              </div>
            </div>
          </Card>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="btn-danger"
            style={{ width: "100%", padding: "16px", borderRadius: "16px" }}
          >
            Sign Out
          </button>
        </div>

        {/* Right Column: Detailed Stats & Badges */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* XP Progress */}
          <Card title="Experience Level">
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                  Progress to {level.next === "MAX" ? "MAX LEVEL" : "next level"}
                </span>
                <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                  {xp} / {level.next} XP
                </span>
              </div>
              <div style={{ height: "12px", background: "var(--primary-light)", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{
                  width: `${Math.min(levelProgress, 100)}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, var(--primary), var(--accent))",
                  transition: "width 1s ease-out"
                }} />
              </div>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
              Complete tasks on time to earn XP and level up your study persona!
            </p>
          </Card>

          {/* Streak Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <Card>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Current Streak
              </p>
              <h2 style={{ margin: "10px 0 0 0", color: "var(--primary)", fontSize: "1.8rem" }}>
                🔥 {profile.streak || 0}
              </h2>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>days</p>
            </Card>
            <Card>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Best Streak
              </p>
              <h2 style={{ margin: "10px 0 0 0", color: "var(--primary)", fontSize: "1.8rem" }}>
                🏆 {profile.maxStreak || 0}
              </h2>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>days</p>
            </Card>
          </div>

          {/* Achievement Badges */}
          <Card title="Achievement Gallery">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
              {[
                { icon: "🚀", title: "First Step", desc: "Complete 1 task", unlocked: xp >= 10 },
                { icon: "⚡", title: "Consistent", desc: "3 Day Streak", unlocked: (profile.streak || 0) >= 3 },
                { icon: "🏅", title: "Halfway", desc: "50% Syllabus", unlocked: xp >= 100 },
                { icon: "💎", title: "Expert", desc: "Finish Plan", unlocked: xp >= 300 }
              ].map((badge, i) => (
                <div key={i} style={{
                  textAlign: "center",
                  padding: "16px 8px",
                  background: badge.unlocked ? "var(--primary-light)" : "rgba(0,0,0,0.02)",
                  borderRadius: "20px",
                  border: badge.unlocked ? "1.5px solid var(--accent)" : "1px dashed #ccc",
                  opacity: badge.unlocked ? 1 : 0.5,
                  filter: badge.unlocked ? "none" : "grayscale(100%)",
                  transition: "all 0.2s ease"
                }}>
                  <div style={{ fontSize: "2rem", marginBottom: "8px" }}>{badge.icon}</div>
                  <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: "bold", color: "var(--text-main)" }}>
                    {badge.title}
                  </p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.65rem", color: "var(--text-muted)" }}>
                    {badge.desc}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Profile;
