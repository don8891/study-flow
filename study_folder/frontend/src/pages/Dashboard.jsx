import { useEffect, useState } from "react";
import { format } from "date-fns";
import { auth } from "../firebase";
import { getStudyPlan, getUserProfile, getStudyPlansList, deleteStudyPlan } from "../api/firestore";
import Card from "../components/Card";

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
    await recordActivity(uid);
  }
}

function StudyTimer({ minutes, onComplete, completed }) {
  const [seconds, setSeconds] = useState(parseInt(minutes) * 60 || 0);
  const [isActive, setIsActive] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0 && isActive && !hasCompleted && !completed) {
      setHasCompleted(true);
      setIsActive(false);
      if (onComplete) onComplete();
      clearInterval(interval);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, onComplete, hasCompleted, completed]);

  const toggle = () => {
    if (completed) return;
    setIsActive(!isActive);
  };
  
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
  };

  if (!minutes || isNaN(parseInt(minutes))) return null;

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px', 
      marginTop: '5px'
    }}>
      <span style={{ 
        fontFamily: 'monospace', 
        fontSize: '1rem', 
        color: completed ? 'var(--text-muted)' : 'var(--primary)', 
        fontWeight: 'bold',
        textDecoration: completed ? 'line-through' : 'none'
      }}>
        {completed ? "Done!" : formatTime(seconds)}
      </span>
      {!completed && (
        <button 
          onClick={(e) => { e.preventDefault(); toggle(); }} 
          style={{ 
            padding: '2px 8px', 
            fontSize: '0.7rem', 
            borderRadius: '4px',
            border: 'none',
            background: isActive ? '#ef4444' : 'var(--primary)',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
      )}
    </div>
  );
}

function Dashboard({ goToUpload, activePlanId, setActivePlanId }) {
  const [tasks, setTasks] = useState([]);
  const [userData, setUserData] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetchPlans();
    const uid = auth.currentUser?.uid;
    if (uid) {
      getUserProfile(uid).then(setUserData);
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
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h2 style={{ margin: 0 }}>Study Context</h2>
            <button onClick={goToUpload} className="btn-sm" style={{ padding: "8px 15px", fontSize: "0.8rem" }}>
              + New Plan
            </button>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select 
              value={activePlanId || ""} 
              onChange={(e) => setActivePlanId(e.target.value)}
              style={{
                background: "rgba(30, 41, 59, 0.8)",
                color: "var(--text-main)",
                border: "1px solid var(--border)",
                padding: "8px 12px",
                borderRadius: "10px",
                outline: "none",
                cursor: "pointer",
                fontSize: "0.9rem",
                flex: 1,
                maxWidth: "220px"
              }}
            >
              {plans.length === 0 && <option value="">No Plans Found</option>}
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {plans.length > 0 && (
              <button 
                onClick={handleDelete} 
                className="btn-danger btn-sm"
                style={{ padding: "8px", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center" }}
                title="Delete Plan"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right", marginLeft: "15px" }}>
          <div style={{ fontSize: "1.5rem" }}>{level.icon}</div>
          <span style={{ fontSize: "0.7rem", fontWeight: "bold", textTransform: "uppercase", color: level.color }}>{level.title}</span>
        </div>
      </header>

      {plans.length === 0 ? (
        <Card>
          <p>You haven't generated any study plans yet.</p>
          <button onClick={goToUpload} className="btn-sm">Create My First Plan</button>
        </Card>
      ) : (
        <>
          {/* Main Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <Card className="card-hover">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="streak-icon" style={{ fontSize: "1.5rem" }}>🔥</span>
            <div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>Current Streak</p>
              <h3 style={{ margin: 0 }}>{streak} Days</h3>
            </div>
          </div>
        </Card>

        <Card className="card-hover">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.5rem" }}>✨</span>
            <div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>Total XP</p>
              <h3 style={{ margin: 0 }}>{xp}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Level Card */}
      <Card style={{ marginBottom: "30px", borderLeft: `4px solid ${level.color}` }} className="card-hover">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <h4 style={{ margin: 0 }}>Level Progress</h4>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            {xp} / {level.next} XP
          </span>
        </div>
        <div style={{ height: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden" }} className="level-shimmer">
          <div style={{ 
            width: `${levelProgress}%`, 
            height: "100%", 
            background: `linear-gradient(90deg, ${level.color}, #ffffff)`, 
            transition: "width 1s ease-out" 
          }} />
        </div>
      </Card>

      {/* Badges Section */}
      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "15px" }}>Badges Earned</h3>
        <div style={{ 
          display: "flex", 
          gap: "15px", 
          overflowX: "auto", 
          paddingBottom: "10px",
          scrollbarWidth: "none" 
        }}>
          {completedLessons > 0 && (
            <div className="badge-item badge-unlock" style={{ minWidth: "80px", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "5px", filter: "drop-shadow(0 0 10px rgba(56,189,248,0.5))" }}>🚀</div>
              <p style={{ fontSize: "0.6rem", margin: 0 }}>First Flight</p>
            </div>
          )}
          {streak >= 3 && (
            <div className="badge-item badge-unlock" style={{ minWidth: "80px", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "5px", filter: "drop-shadow(0 0 10px rgba(239,68,68,0.5))" }}>⚡</div>
              <p style={{ fontSize: "0.6rem", margin: 0 }}>Streak Starter</p>
            </div>
          )}
          {completedLessons >= totalLessons / 2 && totalLessons > 0 && (
            <div className="badge-item badge-unlock" style={{ minWidth: "80px", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "5px", filter: "drop-shadow(0 0 10px rgba(245,158,11,0.5))" }}>🏅</div>
              <p style={{ fontSize: "0.6rem", margin: 0 }}>Halfway Hero</p>
            </div>
          )}
          {completedLessons === totalLessons && totalLessons > 0 && (
            <div className="badge-item badge-unlock" style={{ minWidth: "80px", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "5px", filter: "drop-shadow(0 0 10px rgba(16,185,129,0.5))" }}>💎</div>
              <p style={{ fontSize: "0.6rem", margin: 0 }}>Elite Master</p>
            </div>
          )}
          {completedLessons === 0 && (
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Unlock your first badge by completing a task!</p>
          )}
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>Today's Mission</h3>
          <span style={{ fontSize: '0.8rem', color: '#38bdf8', background: "rgba(56,189,248,0.1)", padding: "4px 10px", borderRadius: "15px" }}>
            {completedToday}/{todayTasks.length} Secured
          </span>
        </div>
        
        {todayString === examDate && (
          <Card style={{ 
            background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)", 
            textAlign: "center",
            padding: "20px",
            color: "white",
            marginBottom: "15px"
          }}>
            <h3 style={{ margin: "0 0 5px 0" }}>🎯 Exam Day!</h3>
            <p style={{ fontSize: "0.9rem", fontWeight: "bold" }}>All the best! Write your exams well. 💪</p>
          </Card>
        )}

        {todayTasks.length === 0 ? (
          <Card>
            <p>{todayString === examDate ? "Go crush it! 🚀" : "No tasks for today. Relax! ☕"}</p>
          </Card>
        ) : (
          todayTasks.map((task, idx) => (
            <Card key={idx} style={{ marginBottom: "10px" }}>
              <p style={{ textDecoration: task.completed ? "line-through" : "none", opacity: task.completed ? 0.6 : 1 }}>
                <strong>{task.topic}</strong>
              </p>
              <StudyTimer 
                minutes={task.duration} 
                onComplete={() => toggleTaskComplete(task, tasks, setTasks, activePlanId)}
                completed={task.completed}
              />
            </Card>
          ))
        )}
      </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
