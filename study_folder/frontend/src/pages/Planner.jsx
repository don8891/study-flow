import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";
import { auth } from "../firebase";
import { getStudyPlan } from "../api/firestore";
import Card from "../components/Card";

function Planner() {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (uid) {
      getStudyPlan(uid).then(setTasks);
    }
  }, []);

  const groupedTasks = tasks.reduce((acc, task) => {
    acc[task.date] = acc[task.date] || [];
    acc[task.date].push(task);
    return acc;
  }, {});

  const selectedDateString = format(selectedDate, "yyyy-MM-dd");
  const tasksForDay = groupedTasks[selectedDateString] || [];

  return (
    <div className="page">
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
            <p><strong>{task.topic}</strong></p>
            <p>{task.duration}</p>
          </Card>
        ))
      )}
    </div>
  );
}

export default Planner;
