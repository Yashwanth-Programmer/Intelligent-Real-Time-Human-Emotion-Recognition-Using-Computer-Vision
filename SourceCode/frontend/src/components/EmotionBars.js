import React, { useEffect, useRef, useState } from 'react';
import { EMOTION_COLORS, EMOTION_EMOJIS } from '../constants';

export default function EmotionBars({ scores, dominant, confidence, facesFound = 1, isDemo = false }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef();

  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 60);
    return () => clearTimeout(t);
  }, [scores]);

  if (!scores) return null;

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const dom    = dominant || sorted[0][0];
  const conf   = confidence ?? sorted[0][1];

  return (
    <div ref={ref}>
      <div
        style={{
          padding: '18px 22px',
          background: '#f0efea',
          borderRadius: 18,
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 6,
          fontFamily: "'Syne', sans-serif",
          color: '#0f0f0f',
          boxShadow: '0 8px 18px rgba(0,0,0,0.06)',
        }}
      >
        {/* Emoji + emotion */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          <span style={{ fontSize: 26 }}>{EMOTION_EMOJIS[dom]}</span>
          <span>{dom}</span>
        </div>

        {/* Faces + confidence underneath */}
        <div
          style={{
            marginTop: 2,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: '#8a8880',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>
            Faces:{' '}
            <strong style={{ color: '#0f0f0f' }}>{facesFound}</strong>
          </span>
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.18)',
              display: 'inline-block',
            }}
          />
          <span>
            Confidence:{' '}
            <strong style={{ color: '#0f0f0f' }}>
              {typeof conf === 'number' ? conf.toFixed(1) : conf}%
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
