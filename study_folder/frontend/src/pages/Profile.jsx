import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { getUserProfile, updateUsername } from "../api/firestore";
import { logoutUser } from "../api/api";
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
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      getUserProfile(user.uid).then(data => {
        if (data) {
          setProfile(data);
          setNewUsername(data.username || "");
        } else {
          // Fallback if data is null (legacy users)
          setProfile({
            email: user.email,
            username: "",
            streak: 0,
            maxStreak: 0,
            totalXp: 0,
            badges: []
          });
        }
      });
    } else {
      // If user is somehow null, set a minimal loading state or redirect
      setProfile("error");
    }
  }, []);

  async function handleLogout() {
    await logoutUser();
    onLogout();
  }

  async function handleUpdateUsername() {
    const user = auth.currentUser;
    if (user && newUsername.trim()) {
      try {
        await updateUsername(user.uid, newUsername);
        setProfile({ ...profile, username: newUsername });
        setIsEditing(false);
        alert("Username updated successfully! ✨");
      } catch (err) {
        console.error("Error updating username:", err);
        alert("Failed to update username. Please try again.");
      }
    }
  }

  if (!profile) return <div className="page" style={{ textAlign: "center", paddingTop: "100px" }}><h2>Loading Profile...</h2></div>;
  if (profile === "error") return <div className="page"><p>Error loading profile. Please log in again.</p></div>;

  const xp = profile.totalXp || 0;
  const level = getLevelInfo(xp);
  const nextTarget = level.next === "MAX" ? xp : level.next;
  const prevTarget = xp >= 600 ? 600 : xp >= 300 ? 300 : xp >= 100 ? 100 : 0;
  const levelProgress = level.next === "MAX" ? 100 : ((xp - prevTarget) / (nextTarget - prevTarget)) * 100;

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <h1 style={{ color: "var(--primary)", marginBottom: "30px" }}>My Study Identity</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        {/* Left Column: Avatar & Basic Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Card style={{ textAlign: "center", paddingTop: "40px" }}>
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
              {(profile.username || profile.email)?.charAt(0).toUpperCase()}
            </div>
            
            {isEditing ? (
              <div style={{ marginBottom: "15px" }}>
                <div className="input-group">
                  <input 
                    value={newUsername} 
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Set Username"
                    style={{ textAlign: "center" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "10px" }}>
                  <button className="btn-sm" onClick={handleUpdateUsername}>Save</button>
                  <button className="btn-sm" style={{ background: "#ccc" }} onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: "15px" }}>
                <h2 style={{ margin: "0 0 5px 0", fontSize: "1.2rem" }}>
                  {profile.username || "Study Master"}
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
            
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem" }}>{profile.email}</p>
            
            <div style={{ 
              marginTop: "24px", 
              padding: "12px", 
              background: "var(--primary-light)", 
              borderRadius: "16px",
              display: "inline-block"
            }}>
              <span style={{ fontSize: "1.2rem", marginRight: "8px" }}>{level.icon}</span>
              <span style={{ fontWeight: "bold", color: "var(--primary)", fontSize: "0.9rem" }}>{level.title}</span>
            </div>
          </Card>

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
          {/* Level Progress Widget */}
          <Card title="Experience Level">
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Progress to Level {level.next === "MAX" ? "MAX" : ""}</span>
                <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>{xp} / {level.next} XP</span>
              </div>
              <div style={{ height: "12px", background: "var(--primary-light)", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ 
                  width: `${levelProgress}%`, 
                  height: "100%", 
                  background: "var(--primary)", 
                  transition: "width 1s ease-out" 
                }} />
              </div>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
              Complete tasks on time to earn XP and level up your study persona!
            </p>
          </Card>

          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <Card className="card-hover">
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Current Streak</p>
              <h2 style={{ margin: "8px 0 0 0", color: "var(--primary)" }}>🔥 {profile.streak} Days</h2>
            </Card>
            <Card className="card-hover">
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Best Streak</p>
              <h2 style={{ margin: "8px 0 0 0", color: "var(--primary)" }}>🏆 {profile.maxStreak} Days</h2>
            </Card>
          </div>

          {/* Badges Gallery */}
          <Card title="Achievement Gallery">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
              {[
                { icon: "🚀", title: "First Step", desc: "Complete 1 task", unlocked: xp >= 10 },
                { icon: "⚡", title: "Consistent", desc: "3 Day Streak", unlocked: profile.streak >= 3 },
                { icon: "🏅", title: "Halfway", desc: "50% Syllabus", unlocked: xp >= 100 },
                { icon: "💎", title: "Expert", desc: "Finish Plan", unlocked: xp >= 300 }
              ].map((badge, i) => (
                <div key={i} style={{ 
                  textAlign: "center",
                  padding: "16px",
                  background: badge.unlocked ? "white" : "rgba(0,0,0,0.02)",
                  borderRadius: "20px",
                  border: badge.unlocked ? "1px solid var(--border)" : "1px dashed #ccc",
                  opacity: badge.unlocked ? 1 : 0.5,
                  filter: badge.unlocked ? "none" : "grayscale(100%)"
                }}>
                  <div style={{ fontSize: "2rem", marginBottom: "8px" }}>{badge.icon}</div>
                  <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: "bold" }}>{badge.title}</p>
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

