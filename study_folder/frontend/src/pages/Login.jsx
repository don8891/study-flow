import AuthLayout from "../components/AuthLayout";

function Login({ onLogin, goToRegister }) {
  return (
    <AuthLayout>
      <h2>Login</h2>

      <input placeholder="Email" />
      <input type="password" placeholder="Password" />

      <button onClick={onLogin}>Login</button>

      <p>
        Don’t have an account?
        <br />
        <button onClick={goToRegister}>Register</button>
      </p>
    </AuthLayout>
  );
}

export default Login;
