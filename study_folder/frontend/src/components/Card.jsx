function Card({ title, children, className = "" }) {
  return (
    <div className={`glass-card ${className}`}>
      {title && <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>{title}</h3>}
      {children}
    </div>
  );
}

export default Card;

