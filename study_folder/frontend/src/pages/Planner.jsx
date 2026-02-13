import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";
import { auth } from "../firebase";
import { getStudyPlan, recordActivity, updatePlanTasks } from "../api/firestore";
import Card from "../components/Card";

function Planner({ activePlanId }) {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (uid && activePlanId) {
      getStudyPlan(uid, activePlanId).then(setTasks);
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
      <h2>Study Planner</h2>

      <div className="calendar-center" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileClassName={({ date }) => {
            const dateString = format(date, "yyyy-MM-dd");
            return groupedTasks[dateString] ? "highlight" : null;
          }}
        />
      </div>

      <h3 style={{ marginBottom: '15px' }}>Tasks for {format(selectedDate, "PPP")}</h3>

      {tasksForDay.length === 0 ? (
        <Card>
          <p>No tasks for this date.</p>
        </Card>
      ) : (
        tasksForDay.map((task, index) => (
          <Card key={index}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textDecoration: task.completed ? "line-through" : "none",
                color: task.completed ? "var(--text-muted)" : "var(--text-main)"
              }}>
                {task.topic}
              </span>
            </label>
            <p style={{ marginLeft: '28px', fontSize: '0.9rem' }}>{task.duration}</p>
          </Card>
        ))
      )}
    </div>
  );
}

export default Planner;
