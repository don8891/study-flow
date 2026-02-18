import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";
import { auth } from "../firebase";
import { getStudyPlan, recordActivity, updatePlanTasks } from "../api/firestore";
import Card from "../components/Card";

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
      gap: '15px', 
      marginTop: '10px',
      padding: '8px 12px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '8px',
      width: 'fit-content'
    }}>
      <span style={{ 
        fontFamily: 'monospace', 
        fontSize: '1.1rem', 
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
            padding: '4px 12px', 
            fontSize: '0.8rem', 
            borderRadius: '6px',
            border: 'none',
            background: isActive ? '#ef4444' : 'var(--primary)',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          {isActive ? 'Pause' : 'Start Timer'}
        </button>
      )}
    </div>
  );
}

function Planner({ activePlanId }) {
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

      {selectedDateString === planData?.examDate && (
        <Card style={{ 
          background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)", 
          textAlign: "center",
          padding: "30px",
          color: "white",
          marginBottom: "20px"
        }}>
          <h2 style={{ fontSize: "2rem", margin: "0 0 10px 0" }}>🎯 Exam Day!</h2>
          <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>All the best! Write your exams well. You've got this! 💪</p>
        </Card>
      )}

      {tasksForDay.length === 0 ? (
        <Card>
          <p>{selectedDateString === planData?.examDate ? "No more tasks, just give your best!" : "No tasks for this date."}</p>
        </Card>
      ) : (
        tasksForDay.map((task, index) => (
          <Card key={index} style={{ position: 'relative' }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: task.completed ? 'default' : 'pointer' }}>
              <input
                type="checkbox"
                checked={task.completed}
                readOnly={!task.completed}
                onChange={() => task.completed && toggleTask(task)}
                style={{ width: '18px', height: '18px', cursor: task.completed ? 'default' : 'pointer' }}
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
            <StudyTimer 
              minutes={task.duration} 
              onComplete={() => toggleTask(task)} 
              completed={task.completed}
            />
          </Card>
        ))
      )}
    </div>
  );
}

export default Planner;
