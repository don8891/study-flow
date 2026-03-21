import { LayoutDashboard, CalendarKey, User, Brain, Sparkles } from "./Icons";
import Logo from "./Logo";

function BottomNav({ page, setPage, onLogout }) {
  return (
    <div className="sidebar">
      <div style={{ marginBottom: "40px", padding: "0 16px" }}>
        <Logo size={36} />
      </div>

      <button
        className={`nav-item ${page === "home" ? "active" : ""}`}
        onClick={() => setPage("home")}
      >
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </button>

      <button
        className={`nav-item ${page === "calendar" ? "active" : ""}`}
        onClick={() => setPage("calendar")}
      >
        <CalendarKey size={20} />
        <span>Study Planner</span>
      </button>

      <button
        className={`nav-item ${page === "assistant" ? "active" : ""}`}
        onClick={() => setPage("assistant")}
      >
        <Sparkles size={20} />
        <span>AI Assistant</span>
      </button>

      <button
        className={`nav-item ${page === "quiz" ? "active" : ""}`}
        onClick={() => setPage("quiz")}
      >
        <Brain size={20} />
        <span>Practice Quiz</span>
      </button>

      <button
        className={`nav-item ${page === "profile" ? "active" : ""}`}
        onClick={() => setPage("profile")}
      >
        <User size={20} />
        <span>My Profile</span>
      </button>

      <div style={{ marginTop: "auto", paddingTop: "20px" }}>
        <button className="nav-item" onClick={onLogout} style={{ color: "var(--error)" }}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default BottomNav;
