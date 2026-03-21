import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import { loginUser } from "../api/api";
import Logo from "../components/Logo";

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
      <div style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <Logo size={48} />
        <h3 style={{ color: 'var(--text-muted)', margin: 0, fontWeight: '500', fontSize: '1rem' }}>Welcome Back!</h3>
      </div>

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
