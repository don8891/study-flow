function BottomNav({ setPage }) {
  return (
    <div style={styles.nav}>
      <button onClick={() => setPage("dashboard")}>Dashboard</button>
      <button onClick={() => setPage("upload")}>Upload</button>
      <button onClick={() => setPage("planner")}>Planner</button>
    </div>
  );
}

const styles = {
  nav: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    backgroundColor: "#1e293b",
    padding: "10px"
  }
};

export default BottomNav;
