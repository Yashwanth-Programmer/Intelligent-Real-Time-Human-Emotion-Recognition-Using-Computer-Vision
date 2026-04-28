import React from 'react';

export default function DemoCard({ title = 'noa · emotion_model.h5', children }) {
  return (
    <div style={{
      background: '#fafaf8', borderRadius: 24,
      border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden',
      boxShadow: '0 20px 80px rgba(0,0,0,0.08)',
    }}>
      {/* Top bar */}
      <div style={{
        background: '#e8e7e2', padding: '12px 20px',
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        {['#ff5f57','#febc2e','#28c840'].map((c,i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ fontSize: 12, color: '#8a8880', margin: '0 auto' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}
