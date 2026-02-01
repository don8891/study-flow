import AuthLayout from "../components/AuthLayout";

function Register({ onRegister, goToLogin }) {
  return (
    <AuthLayout>
      <h2>Register</h2>

      <input placeholder="Email" />
      <input type="password" placeholder="Password" />

      <button onClick={onRegister}>Create Account</button>

      <p>
        Already have an account?
        <br />
        <button onClick={goToLogin}>Login</button>
      </p>
    </AuthLayout>
  );
}

export default Register;
