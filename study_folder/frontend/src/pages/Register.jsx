import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import { registerUser } from "../api/api";

function Register({ onRegister, goToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    try {
      await registerUser(email, password);
      onRegister();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <AuthLayout>
      <h2>Register</h2>

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

      <button onClick={handleRegister}>Create Account</button>

      <p>
        Already have an account?
        <br />
        <button onClick={goToLogin}>Login</button>
      </p>
    </AuthLayout>
  );
}

export default Register;
