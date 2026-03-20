import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { logStudySession } from "../api/firestore";

function PomodoroTimer({ topic, duration, onComplete, completed, timerId, activeTimerId, secondsLeft, startGlobalTimer }) {
  // Derive isActive from global activeTimerId
  const isActive = activeTimerId === timerId;

  // Use the global secondsLeft if this timer is active, otherwise show total duration
  const displaySeconds = isActive ? secondsLeft : parseInt(duration) * 60;

  const startTimer = () => {
    if (startGlobalTimer) startGlobalTimer(timerId, parseInt(duration), topic);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
  };

  const isBreak = topic.toLowerCase().includes("break");

  // Auto-complete when timer hits zero
  useEffect(() => {
    if (isActive && secondsLeft === 0) {
      onComplete();
    }
  }, [isActive, secondsLeft, onComplete]);

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
            {formatTime(displaySeconds)}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {isBreak ? (topic.includes("Long") ? "Long Break" : "Short Break") : "Focus Time"}
          </span>
          
          {!completed && (
            <button 
              onClick={(e) => { e.preventDefault(); startTimer(); }} 
              style={{ 
                padding: '6px 16px', 
                fontSize: '0.8rem', 
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'transparent' : 'var(--primary)',
                border: isActive ? '1px solid var(--primary)' : 'none',
                color: isActive ? 'var(--primary)' : 'white',
                cursor: isActive ? 'default' : 'pointer',
                fontWeight: '600',
              }}
              disabled={isActive}
            >
              {isActive ? "Focusing..." : "Start"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PomodoroTimer;
