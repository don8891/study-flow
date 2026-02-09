import { Mail, Lock, ArrowRight, GraduationCap } from "../components/Icons";

function Login({ onLogin, goToRegister }) {
  return (
    <div style={{ zIndex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}> 
      
      <div style={{ 
        background: 'rgba(56, 189, 248, 0.2)', 
        padding: '16px', 
        borderRadius: '50%', 
        marginBottom: '20px',
        display: 'inline-flex',
        boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)'
      }}>
        <GraduationCap size={40} color="#38bdf8" />
      </div>

      <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome to Study Flow</h2>
      <p style={{ marginBottom: '32px' }}>Enter your details to continue</p>

      <div className="input-group" style={{ width: '100%' }}>
        <Mail size={18} />
        <input placeholder="Email" type="email" />
      </div>

      <div className="input-group" style={{ width: '100%' }}>
        <Lock size={18} />
        <input placeholder="Password" type="password" />
      </div>

      <button onClick={onLogin} style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        Log In <ArrowRight size={18} />
      </button>

      <p style={{ marginTop: '24px', fontSize: '0.9rem' }}>
        Don’t have an account?{" "}
        <span 
          onClick={goToRegister} 
          style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}
        >
          Sign Up
        </span>
      </p>
    </div>
  );
}

export default Login;
