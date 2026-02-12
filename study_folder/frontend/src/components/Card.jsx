function Card({ title, children }) {
  return (
    <div className="card glass-card">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}

export default Card;

