import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format, isSameDay, parseISO } from "date-fns";
import Card from "../components/Card";
import PomodoroTimer from "../components/PomodoroTimer";
import { db, auth } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { getStudyPlan } from "../api/firestore";
import { generateTasks } from "../utils/scheduler";


function Planner({ activePlanId, activeTimerId, secondsLeft, startGlobalTimer }) {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [planData, setPlanData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editHours, setEditHours] = useState(4);
  const [editDate, setEditDate] = useState("");

  useEffect(() => {
    async function loadPlan() {
      const uid = auth.currentUser?.uid;
      if (uid && activePlanId) {
        const plan = await getStudyPlan(uid, activePlanId);
        if (plan) {
          setTasks(plan.tasks || []);
          setPlanData(plan);
          setEditHours(plan.studyHours || 4);
          setEditDate(plan.examDate || "");
        }
      }
    }
    loadPlan();
  }, [activePlanId]);

  async function handleReplan() {
    const uid = auth.currentUser?.uid;
    if (!uid || !activePlanId || !planData?.storedTopics) return;

    const newTasks = generateTasks(
      planData.storedTopics,
      editDate,
      editHours,
      planData.studyPreference || "morning"
    );

    // Maintain completion status for identical topics
    const updatedTasks = newTasks.map(newTask => {
      const existing = tasks.find(t => t.topic === newTask.topic && t.completed);
      return existing ? { ...newTask, completed: true } : newTask;
    });

    const planRef = doc(db, "users", uid, "studyPlans", activePlanId);
    await updateDoc(planRef, {
      tasks: updatedTasks,
      studyHours: editHours,
      examDate: editDate
    });

    setTasks(updatedTasks);
    setPlanData({ ...planData, studyHours: editHours, examDate: editDate, tasks: updatedTasks });
    setIsEditing(false);
    alert("Plan updated successfully!");
  }

  async function toggleTask(task) {
    const isNowCompleted = !task.completed;
    const updatedTasks = tasks.map(t =>
      t.date === task.date && t.topic === task.topic
        ? { ...t, completed: isNowCompleted }
        : t
    );

    setTasks(updatedTasks);
    const uid = auth.currentUser?.uid;
    if (uid && activePlanId) {
      await updatePlanTasks(uid, activePlanId, updatedTasks);

      // If user marks a task as completed today, record activity for streak
      if (isNowCompleted) {
        await recordActivity(uid);
      }
    }
  }

  const groupedTasks = tasks.reduce((acc, task) => {
    acc[task.date] = acc[task.date] || [];
    acc[task.date].push(task);
    return acc;
  }, {});

  const selectedDateString = format(selectedDate, "yyyy-MM-dd");
  const tasksForDay = groupedTasks[selectedDateString] || [];

  return (
    <div className="page" style={{ paddingBottom: '80px' }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ color: "var(--primary)", margin: 0 }}>Study Planner</h1>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          style={{ 
            padding: "10px 20px", 
            borderRadius: "12px", 
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "var(--text)",
            fontSize: "0.9rem",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          {isEditing ? "Cancel Edit" : "⚙️ Plan Settings"}
        </button>
      </div>

      {isEditing && (
        <Card title="Edit Plan Settings" style={{ marginBottom: "25px", border: "1px solid var(--primary)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <p style={{ marginBottom: "10px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Target Exam Date</p>
              <input 
                type="date" 
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
              />
            </div>
            <div>
              <p style={{ marginBottom: "10px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Daily Study Hours: <b>{editHours}h</b></p>
              <input 
                type="range" 
                min="1" 
                max="12" 
                value={editHours}
                onChange={(e) => setEditHours(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "var(--primary)" }}
              />
            </div>
            <button 
              onClick={handleReplan}
              style={{ width: "100%", padding: "14px", background: "var(--primary)", color: "white", borderRadius: "12px", fontWeight: "bold" }}
            >
              Update & Regenerate Plan
            </button>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px" }}>
        {/* Calendar Side */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Card title="Calendar">
            <div className="calendar-center">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="custom-calendar"
                minDetail="month"
                prev2Label={null}
                next2Label={null}
                tileClassName={({ date, view }) => {
                  const dateString = format(date, "yyyy-MM-dd");
                  if (dateString === planData?.examDate) return "exam-tile";
                  if (view === 'month' && tasks.some(t => t.date === dateString)) {
                    return 'study-tile';
                  }
                  return null;
                }}
              />
            </div>
          </Card>
        </div>

        {/* Tasks Side */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>Tasks for {format(selectedDate, "PPP")}</h3>
          </header>

          {selectedDateString === planData?.examDate && (
            <div style={{ 
              background: "linear-gradient(135deg, var(--primary), var(--accent))", 
              textAlign: "center",
              padding: "40px 24px",
              color: "white",
              borderRadius: "24px",
              boxShadow: "0 12px 32px rgba(17, 94, 89, 0.2)",
              position: "relative",
              overflow: "hidden"
            }}>
              <h2 style={{ fontSize: "2.5rem", margin: "0 0 10px 0" }}>🎯</h2>
              <h3 style={{ fontSize: "1.5rem", margin: "0 0 8px 0" }}>Exam Day!</h3>
              <p style={{ fontSize: "1rem", fontWeight: "bold", opacity: 0.9 }}>All the best! Write your exams well. 💪</p>
            </div>
          )}

          {tasksForDay.length === 0 ? (
            <Card>
              <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
                {selectedDateString === planData?.examDate 
                  ? "Your hard work pays off today! Go crush it! 🚀" 
                  : "No tasks scheduled for this day. Enjoy your break! ☕"}
              </p>
            </Card>
          ) : (
            tasksForDay.map((task, index) => {
              const uniqueId = `${task.date}-${task.startTime || index}-${task.topic}`;
              return (
                <Card key={uniqueId} className="card-hover">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ 
                        width: "14px", 
                        height: "14px", 
                        borderRadius: "50%", 
                        background: task.completed ? "var(--success)" : "var(--accent)" 
                      }} />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{
                          fontSize: '1.1rem',
                          fontWeight: "700",
                          textDecoration: task.completed ? "line-through" : "none",
                          color: task.completed ? "var(--text-muted)" : "var(--text-main)",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          {task.preference === "morning" ? "☀️" : "🌅"} {task.topic}
                        </span>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          🕒 {task.startTime} - {task.endTime} ({task.duration} mins)
                        </span>
                      </div>
                    </div>
                    {task.completed && <span style={{ color: "var(--success)", fontWeight: "bold", fontSize: "0.8rem" }}>✓ DONE</span>}
                  </div>
                  <div style={{ marginTop: "16px", padding: "12px", background: "var(--primary-light)", borderRadius: "12px" }}>
                    <PomodoroTimer 
                      topic={task.topic} 
                      duration={task.duration}
                      onComplete={() => toggleTask(task)} 
                      completed={task.completed}
                      timerId={uniqueId}
                      activeTimerId={activeTimerId}
                      secondsLeft={secondsLeft}
                      startGlobalTimer={startGlobalTimer}
                    />
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Planner;
