import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authPage, setAuthPage] = useState("login");

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthPage("login");
  };

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
