function AuthLayout({ children }) {
  return (
    <div className="auth-container">
      {/* Background Floating Anim elements */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="auth-card glass-card">
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
