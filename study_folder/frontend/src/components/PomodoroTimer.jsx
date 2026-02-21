import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { logStudySession } from "../api/firestore";

function PomodoroTimer({ topic, duration, onComplete, completed }) {
  const [secondsLeft, setSecondsLeft] = useState(parseInt(duration) * 60 || 25 * 60);
  const [isActive, setIsActive] = useState(false);

  // Sync with duration if topic changes
  useEffect(() => {
    setSecondsLeft(parseInt(duration) * 60 || 25 * 60);
    setIsActive(false);
  }, [topic, duration]);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      handlePhaseEnd();
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const handlePhaseEnd = async () => {
    setIsActive(false);
    const uid = auth.currentUser?.uid;
    
    // Determine type for logging
    const isBreak = topic.toLowerCase().includes("break");
    
    if (uid) {
      await logStudySession(uid, topic, parseInt(duration), isBreak ? "Break" : "Focus");
    }

    if (onComplete) onComplete(); 
  };

  const toggle = () => setIsActive(!isActive);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
  };

  const isBreak = topic.toLowerCase().includes("break");

  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '10px',
        padding: '12px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        width: 'fit-content',
        border: `1px solid ${isActive ? 'var(--primary)' : 'transparent'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ 
            fontFamily: 'monospace', 
            fontSize: '1.2rem', 
            color: completed ? 'var(--text-muted)' : (isBreak ? 'var(--accent)' : 'var(--primary)'), 
            fontWeight: 'bold',
          }}>
            {formatTime(secondsLeft)}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {isBreak ? (topic.includes("Long") ? "Long Break" : "Short Break") : "Focus Time"}
          </span>
          {!completed && !isActive && (
            <button 
              onClick={(e) => { e.preventDefault(); toggle(); }} 
              style={{ 
                padding: '6px 16px', 
                fontSize: '0.8rem', 
                borderRadius: '8px',
                border: 'none',
                background: 'var(--primary)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Start
            </button>
          )}
          {isActive && (
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>
              Focusing...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default PomodoroTimer;
