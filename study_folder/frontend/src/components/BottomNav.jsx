import { LayoutDashboard, CalendarKey, User } from "./Icons";

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
