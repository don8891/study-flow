import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import { loginUser } from "../api/api";

function Login({ onLogin, goToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      await loginUser(email, password);
      onLogin();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <AuthLayout>
      <h2 style={{ color: 'var(--primary)', marginBottom: '30px' }}>Welcome Back</h2>

      <div className="input-group">
        <input
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="input-group">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button style={{ width: '100%', marginTop: '10px' }} onClick={handleLogin}>
        Sign In
      </button>

      <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
        Don’t have an account?{" "}
        <span 
          onClick={goToRegister} 
          style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Create Account
        </span>
      </p>
    </AuthLayout>
  );
}

export default Login;
