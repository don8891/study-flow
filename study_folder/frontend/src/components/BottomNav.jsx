import { LayoutDashboard, CalendarKey, User, Brain, Sparkles } from "./Icons";

function BottomNav({ page, setPage }) {
  return (
    <div className="bottom-nav">
      <button
        className={page === "home" ? "active" : ""}
        onClick={() => setPage("home")}
      >
        <LayoutDashboard size={24} />
        <span>Home</span>
      </button>

      <button
        className={page === "calendar" ? "active" : ""}
        onClick={() => setPage("calendar")}
      >
        <CalendarKey size={24} />
        <span>Plan</span>
      </button>

      <button
        className={page === "assistant" ? "active" : ""}
        onClick={() => setPage("assistant")}
      >
        <Sparkles size={24} />
        <span>Assistant</span>
      </button>

      <button
        className={page === "quiz" ? "active" : ""}
        onClick={() => setPage("quiz")}
      >
        <Brain size={24} />
        <span>Quiz</span>
      </button>

      <button
        className={page === "profile" ? "active" : ""}
        onClick={() => setPage("profile")}
      >
        <User size={24} />
        <span>Profile</span>
      </button>
    </div>
  );
}

export default BottomNav;
