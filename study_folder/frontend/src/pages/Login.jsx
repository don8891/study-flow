import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import { loginUser } from "../api/api";

function Login({ onLogin, goToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const res = await loginUser(email, password);
    if (res.success) {
      onLogin();
    } else {
      alert(res.message);
    }
  }

  return (
    <AuthLayout>
      <h2>Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>

      <p>
        Don’t have an account?
        <br />
        <button onClick={goToRegister}>Register</button>
      </p>
    </AuthLayout>
  );
}

export default Login;
