import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";
import { auth } from "../firebase";
import { getStudyPlan, recordActivity, updatePlanTasks, logStudySession } from "../api/firestore";
import Card from "../components/Card";
import PomodoroTimer from "../components/PomodoroTimer";


function Planner({ activePlanId, activeTimerId, setActiveTimerId }) {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [planData, setPlanData] = useState(null);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (uid && activePlanId) {
      getStudyPlan(uid, activePlanId).then(data => {
        setPlanData(data);
        setTasks(data?.tasks || []);
      });
    }
  }, [activePlanId]);

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
      <h1 style={{ color: "var(--primary)", marginBottom: "30px" }}>Study Planner</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px" }}>
        {/* Calendar Side */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Card title="Calendar">
            <div className="calendar-center">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="custom-calendar"
                tileClassName={({ date }) => {
                  const dateString = format(date, "yyyy-MM-dd");
                  if (dateString === planData?.examDate) return "exam-tile";
                  return groupedTasks[dateString] ? "study-tile" : null;
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
            tasksForDay.map((task, index) => (
              <Card key={index} className="card-hover">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ 
                      width: "12px", 
                      height: "12px", 
                      borderRadius: "50%", 
                      background: task.completed ? "var(--success)" : "var(--accent)" 
                    }} />
                    <span style={{
                      fontSize: '1.1rem',
                      fontWeight: "600",
                      textDecoration: task.completed ? "line-through" : "none",
                      color: task.completed ? "var(--text-muted)" : "var(--text-main)"
                    }}>
                      {task.topic}
                    </span>
                  </div>
                  {task.completed && <span style={{ color: "var(--success)", fontWeight: "bold", fontSize: "0.8rem" }}>DONE</span>}
                </div>
                <div style={{ marginTop: "16px", padding: "12px", background: "var(--primary-light)", borderRadius: "12px" }}>
                  <PomodoroTimer 
                    topic={task.topic} 
                    duration={task.duration}
                    onComplete={() => toggleTask(task)} 
                    completed={task.completed}
                    timerId={`${task.date}-${task.topic}`}
                    activeTimerId={activeTimerId}
                    setActiveTimerId={setActiveTimerId}
                  />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Planner;
