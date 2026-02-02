function BottomNav({ page, setPage }) {
  return (
    <div className="bottom-nav">
      <button
        className={page === "home" ? "active" : ""}
        onClick={() => setPage("home")}
      >
        Home
      </button>

      <button
        className={page === "calendar" ? "active" : ""}
        onClick={() => setPage("calendar")}
      >
        Calendar
      </button>

      <button
        className={page === "profile" ? "active" : ""}
        onClick={() => setPage("profile")}
      >
        Profile
      </button>
    </div>
  );
}

export default BottomNav;


