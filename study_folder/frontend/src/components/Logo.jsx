import React from 'react';

export default function Logo({ size = 40, showText = true, textColor = "var(--primary)" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center" }}>
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${size * 0.25}px`,
        background: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 16px rgba(17, 94, 89, 0.15)",
        border: "1px solid rgba(17, 94, 89, 0.1)"
      }}>
        <svg 
          width={size * 0.6} 
          height={size * 0.6} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop stopColor="#115e59" />
              <stop offset="1" stopColor="#2dd4bf" />
            </linearGradient>
            <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop stopColor="#10b981" />
              <stop offset="1" stopColor="#115e59" />
            </linearGradient>
          </defs>
          
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#logoGrad)" />
          <path d="M2 17L12 22L22 17" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="url(#logoGrad2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {showText && (
        <h2 style={{ 
          color: textColor, 
          fontSize: `${size * 0.55}px`, 
          margin: 0, 
          fontWeight: "800", 
          letterSpacing: "-0.5px" 
        }}>
          Study Flow
        </h2>
      )}
    </div>
  );
}
