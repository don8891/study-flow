import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import { registerUser } from "../api/api";
import { auth } from "../firebase";
import { createUserProfile } from "../api/firestore";

function Register({ onRegister, goToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  async function handleRegister() {
    try {
      await registerUser(email, password);
      await createUserProfile(auth.currentUser, username);
      onRegister();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <AuthLayout>
      <h2 style={{ color: 'var(--primary)', marginBottom: '30px' }}>Join Study Flow</h2>

      <div className="input-group">
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
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

      <button style={{ width: '100%', marginTop: '10px' }} onClick={handleRegister}>
        Get Started
      </button>

      <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
        Already have an account?{" "}
        <span 
          onClick={goToLogin} 
          style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Login here
        </span>
      </p>
    </AuthLayout>
  );
}

export default Register;
