import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import { auth } from "./firebase";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authPage, setAuthPage] = useState("login");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await auth.signOut();
    setIsLoggedIn(false);
    setAuthPage("login");
  };

  if (loading) {
    return <div className="auth-container"><h2 style={{ color: "var(--primary)" }}>Loading Study Flow...</h2></div>;
  }

  if (!isLoggedIn) {
    return authPage === "login" ? (
      <Login
        onLogin={handleLogin}
        goToRegister={() => setAuthPage("register")}
      />
    ) : (
      <Register
        onRegister={handleLogin}
        goToLogin={() => setAuthPage("login")}
      />
    );
  }

  return <Home onLogout={handleLogout} />;
}

export default App;
