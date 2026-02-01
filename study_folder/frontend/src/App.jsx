import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authPage, setAuthPage] = useState("login");

  if (!isLoggedIn) {
    return authPage === "login" ? (
      <Login
        onLogin={() => setIsLoggedIn(true)}
        goToRegister={() => setAuthPage("register")}
      />
    ) : (
      <Register
        onRegister={() => setIsLoggedIn(true)}
        goToLogin={() => setAuthPage("login")}
      />
    );
  }

  return <Home />;
}

export default App;
