import { useEffect, useState } from "react";
import { format } from "date-fns";
import { auth } from "../firebase";
import { getStudyPlan, getUserProfile, getStudyPlansList, deleteStudyPlan, updatePlanTasks, recordActivity } from "../api/firestore";
import Card from "../components/Card";
import PomodoroTimer from "../components/PomodoroTimer";

async function toggleTaskComplete(task, tasks, setTasks, activePlanId) {
  const isNowCompleted = true; // Only marking as completed via timer
  const updatedTasks = tasks.map(t =>
    t.date === task.date && t.topic === task.topic
      ? { ...t, completed: isNowCompleted }
      : t
  );

  setTasks(updatedTasks);
  const uid = auth.currentUser?.uid;
  if (uid && activePlanId) {
    await updatePlanTasks(uid, activePlanId, updatedTasks);
    // XP and Streak are handled within recordActivity (which now increments XP by 10)
    await recordActivity(uid);
  }
}


function Dashboard({ goToUpload, activePlanId, setActivePlanId, setPage, activeTimerId, secondsLeft, startGlobalTimer, onTimerComplete }) {
  const [tasks, setTasks] = useState([]);
  const [userData, setUserData] = useState(null);
  const [plans, setPlans] = useState([]);

  const handleManualComplete = async (task) => {
    // 1. Mark task as done locally and in Firestore (Dashboard logic)
    await toggleTaskComplete(task, tasks, setTasks, activePlanId);
    
    // 2. Reset timer and log session (Home logic)
    if (onTimerComplete) await onTimerComplete();
  };

  useEffect(() => {
    fetchPlans();
    const uid = auth.currentUser?.uid;
    if (uid) {
      getUserProfile(uid).then(data => {
        if (data) {
          setUserData(data);
        } else {
          setUserData({
            username: "",
            streak: 0,
            maxStreak: 0,
            totalXp: 0
          });
        }
      }).catch(err => {
        console.error("Error fetching user profile:", err);
      });
    }
  }, [activePlanId]);

  async function fetchPlans() {
    const uid = auth.currentUser?.uid;
    if (uid) {
      const list = await getStudyPlansList(uid);
      setPlans(list);
      // If activePlanId is invalid or deleted, reset to first available
      if (list.length > 0) {
        if (!activePlanId || !list.find(p => p.id === activePlanId)) {
          setActivePlanId(list[0].id);
        }
      } else {
        setActivePlanId(null);
      }
    }
  }

  async function handleDelete() {
    if (!activePlanId) return;
    
    const planName = plans.find(p => p.id === activePlanId)?.name || "this plan";
    if (window.confirm(`Are you sure you want to delete "${planName}"? This cannot be undone.`)) {
      const uid = auth.currentUser?.uid;
      await deleteStudyPlan(uid, activePlanId);
      await fetchPlans();
    }
  }

  const [examDate, setExamDate] = useState(null);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (uid && activePlanId) {
      getStudyPlan(uid, activePlanId).then(data => {
        setTasks(data?.tasks || []);
        setExamDate(data?.examDate);
      });
    }
  }, [activePlanId]);

  const totalLessons = tasks.length;
  const completedLessons = tasks.filter(t => t.completed).length;
  const xp = completedLessons * 10;
  
  const streak = userData?.streak || 0;
  const maxStreak = userData?.maxStreak || 0;

  // Level Logic
  const getLevelInfo = (xp) => {
    if (xp >= 1000) return { title: "Academic Legend", icon: "👑", next: "MAX", color: "#f59e0b" };
    if (xp >= 600) return { title: "Wisdom Warrior", icon: "🛡️", next: 1000, color: "#8b5cf6" };
    if (xp >= 300) return { title: "Knowledge Knight", icon: "⚔️", next: 600, color: "#ef4444" };
    if (xp >= 100) return { title: "Study Sprout", icon: "🌿", next: 300, color: "#10b981" };
    return { title: "Learning Seedling", icon: "🌱", next: 100, color: "#3b82f6" };
  };

  const level = getLevelInfo(xp);
  const nextTarget = level.next === "MAX" ? xp : level.next;
  const prevTarget = xp >= 600 ? 600 : xp >= 300 ? 300 : xp >= 100 ? 100 : 0;
  const levelProgress = level.next === "MAX" ? 100 : ((xp - prevTarget) / (nextTarget - prevTarget)) * 100;

  const todayString = format(new Date(), "yyyy-MM-dd");
  const todayTasks = tasks.filter(t => t.date === todayString);
  const completedToday = todayTasks.filter(t => t.completed).length;

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <header style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Welcome back, {userData?.username || "Study Master"}! 👋
          </p>
          <h1 style={{ margin: 0, color: "var(--primary)" }}>Dashboard</h1>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}>
            <select 
              value={activePlanId || ""} 
              onChange={(e) => setActivePlanId(e.target.value)}
              style={{
                background: "white",
                border: "1px solid var(--border)",
                padding: "8px 36px 8px 16px",
                borderRadius: "12px",
                fontSize: "0.9rem",
                outline: "none",
                appearance: "none",
                cursor: "pointer"
              }}
            >
              {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {plans.length > 0 && (
              <button 
                onClick={handleDelete}
                style={{
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
                title="Delete Plan"
              >
                🗑️
              </button>
            )}
          </div>
          <button onClick={goToUpload} className="btn-sm">+ New Plan</button>
        </div>
      </header>

      {plans.length === 0 ? (
        <Card>
          <p>You haven't generated any study plans yet.</p>
          <button onClick={goToUpload} className="btn-sm">Create My First Plan</button>
        </Card>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1.5fr 1fr", 
          gap: "24px",
          alignItems: "start"
        }}>
          {/* Left Column: Next Session & Topic List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Next Session Widget */}
            <Card title="Next Session">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {todayTasks.filter(t => !t.completed).length > 0 ? (
                  <div style={{ width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: "6px", 
                        padding: "4px 12px", 
                        borderRadius: "20px", 
                        fontSize: "0.75rem", 
                        fontWeight: "bold",
                        background: todayTasks.filter(t => !t.completed)[0].preference === "morning" ? "#fffbeb" : "#fff7ed",
                        color: todayTasks.filter(t => !t.completed)[0].preference === "morning" ? "#b45309" : "#c2410c",
                        border: "1px solid currentColor"
                      }}>
                        {todayTasks.filter(t => !t.completed)[0].preference === "morning" ? "☀️ MORNING SESSION" : "🌅 AFTERNOON SESSION"}
                      </div>
                      <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--primary)" }}>
                        🕒 {todayTasks.filter(t => !t.completed)[0].startTime} - {todayTasks.filter(t => !t.completed)[0].endTime}
                      </div>
                    </div>
                    <h2 style={{ fontSize: "1.2rem", margin: "0 0 16px 0" }}>
                      {todayTasks.filter(t => !t.completed)[0].topic}
                    </h2>
                    <div style={{ 
                      background: "var(--primary-light)", 
                      padding: "20px", 
                      borderRadius: "16px",
                      display: "flex",
                      justifyContent: "center"
                    }}>
                      <PomodoroTimer 
                        topic={todayTasks.filter(t => !t.completed)[0].topic}
                        duration={todayTasks.filter(t => !t.completed)[0].duration}
                        onComplete={() => handleManualComplete(todayTasks.filter(t => !t.completed)[0])}
                        completed={false}
                        timerId={`${todayTasks.filter(t => !t.completed)[0].date}-${todayTasks.filter(t => !t.completed)[0].startTime || 'slot1'}-${todayTasks.filter(t => !t.completed)[0].topic}`}
                        activeTimerId={activeTimerId}
                        secondsLeft={secondsLeft}
                        startGlobalTimer={startGlobalTimer}
                      />
                    </div>
                  </div>
                ) : (
                  <p>All sessions complete! 🚀</p>
                )}
              </div>
            </Card>

            {/* Today's Mission / Standings Style */}
            <Card title="Today's Mission">
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {todayTasks.length === 0 ? (
                  <p>No tasks for today. Relax! ☕</p>
                ) : (
                  todayTasks.map((task, idx) => (
                    <div key={idx} style={{ 
                      display: "flex", 
                      flexDirection: "column",
                      gap: "8px",
                      padding: "16px",
                      background: task.completed ? "var(--primary-light)" : "rgba(255,255,255,0.5)",
                      borderRadius: "16px",
                      border: "1px solid var(--border)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "1.1rem" }}>{task.preference === "morning" ? "☀️" : "🌅"}</span>
                          <span style={{ 
                            fontWeight: "600", 
                            textDecoration: task.completed ? "line-through" : "none",
                            color: task.completed ? "var(--text-muted)" : "var(--text-main)"
                          }}>
                            {task.topic}
                          </span>
                        </div>
                        {task.completed ? (
                          <span style={{ color: "var(--success)", fontSize: "0.75rem", fontWeight: "bold" }}>+10 XP ✓</span>
                        ) : (
                          <span style={{ color: "var(--accent)", fontSize: "0.75rem", fontWeight: "bold" }}>PENDING</span>
                        )}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "500" }}>
                          🕒 {task.startTime} - {task.endTime}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          ({task.duration} mins)
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: Statistics & Badges */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* General Statistics */}
            <Card title="Study Statistics">
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Course Progress</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: "bold" }}>{Math.round(levelProgress)}%</span>
                </div>
                <div style={{ height: "8px", background: "var(--primary-light)", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ width: `${levelProgress}%`, height: "100%", background: "var(--primary)", transition: "width 0.5s" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "white", padding: "16px", borderRadius: "16px", border: "1px solid var(--border)" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>XP EARNED</p>
                  <h3 style={{ margin: "4px 0 0 0" }}>{xp}</h3>
                </div>
                <div style={{ background: "white", padding: "16px", borderRadius: "16px", border: "1px solid var(--border)" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>STREAK</p>
                  <h3 style={{ margin: "4px 0 0 0" }}>{streak}d</h3>
                </div>
              </div>
            </Card>

            {/* Badges Widget */}
            <Card title="Earned Badges">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                {[
                  { icon: "🚀", show: completedLessons > 0 },
                  { icon: "⚡", show: streak >= 3 },
                  { icon: "🏅", show: completedLessons >= totalLessons / 2 },
                  { icon: "💎", show: completedLessons === totalLessons && totalLessons > 0 }
                ].map((b, i) => (
                  <div key={i} style={{ 
                    fontSize: "1.5rem", 
                    opacity: b.show ? 1 : 0.2, 
                    filter: b.show ? "none" : "grayscale(100%)",
                    textAlign: "center",
                    background: "white",
                    padding: "8px",
                    borderRadius: "12px",
                    border: "1px solid var(--border)"
                  }}>
                    {b.icon}
                  </div>
                ))}
              </div>
            </Card>

            {/* AI Promot Banner */}
            <div style={{ 
              background: "linear-gradient(135deg, var(--primary), var(--accent))",
              borderRadius: "24px",
              padding: "24px",
              color: "white",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{ position: "relative", zIndex: 1 }}>
                <h3 style={{ margin: "0 0 8px 0" }}>Need help?</h3>
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.85rem", marginBottom: "16px" }}>
                  Ask the AI assistant to clear your doubts or generate a quiz!
                </p>
                <button 
                  onClick={() => setPage("assistant")}
                  style={{ background: "white", color: "var(--primary)", boxShadow: "none" }}
                >
                  Start Chat
                </button>
              </div>
              <div style={{ 
                position: "absolute", 
                right: "-20px", 
                bottom: "-20px", 
                fontSize: "5rem", 
                opacity: 0.2 
              }}>🤖</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
