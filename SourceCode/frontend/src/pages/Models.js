import React, { useState, useEffect } from 'react';
import { API_BASE } from '../constants';

const ARCH_CUSTOM = [
  'Input: 48×48 Grayscale',
  'Conv2D (64) + BatchNorm + MaxPool + Dropout(0.25)',
  'Conv2D (128) + BatchNorm + MaxPool + Dropout(0.25)',
  'Conv2D (256) + BatchNorm + MaxPool + Dropout(0.25)',
  'Flatten → Dense (512) + BatchNorm + Dropout(0.5)',
  'Output: Dense (7) + Softmax',
];

const ARCH_MOBILE = [
  'Input: 48×48 Grayscale (or 224×224 RGB)',
  'Depthwise Separable Conv Blocks ×13',
  'Inverted Residual Blocks with Expansion',
  'Global Average Pooling',
  'Dense Head (fine-tuned)',
  'Output: Dense (7) + Softmax',
];

const COMPARISONS = [
  { metric: 'Validation Accuracy', custom: '89.5%',     mobile: '92.3%',    better: 'mobile' },
  { metric: 'Test Loss',           custom: '0.45',       mobile: '0.25',     better: 'mobile' },
  { metric: 'Parameters',          custom: 'High',       mobile: 'Low',      better: 'mobile' },
  { metric: 'Compute Cost',        custom: 'High',       mobile: 'Low',      better: 'mobile' },
  { metric: 'Training Time',       custom: 'Longer',     mobile: 'Faster',   better: 'mobile' },
  { metric: 'Customizability',     custom: 'High',       mobile: 'Moderate', better: 'custom' },
  { metric: 'Edge Deployment',     custom: 'Difficult',  mobile: 'Easy',     better: 'mobile' },
  { metric: 'Research Insight',    custom: 'High',       mobile: 'Moderate', better: 'custom' },
];

export default function Models() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(r => r.json())
      .then(d => setHealth(d))
      .catch(() => setHealth({ status: 'offline' }));
  }, []);

  const badge = (txt, good) => (
    <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 100,
      fontSize: 11, fontWeight: 500,
      background: good ? '#d8f3dc' : '#fff3cd',
      color: good ? '#2d6a4f' : '#856404' }}>{txt}</span>
  );

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', background: '#f0efea' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 52 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
            color: '#8a8880', marginBottom: 12 }}>Model Comparison</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800,
            fontSize: 'clamp(32px,5vw,56px)', letterSpacing: -2, lineHeight: 1, marginBottom: 14 }}>
            Two Models.<br/>One Clear Winner.
          </h1>
          <p style={{ fontSize: 15, color: '#8a8880', maxWidth: 480 }}>
            Comparing Custom CNN vs MobileNet on FER-2013 — both trained with Adam optimizer,
            batch normalization, and dropout regularization.
          </p>
        </div>

        {/* API Health */}
        {health && (
          <div style={{ padding: '18px 22px', borderRadius: 14, marginBottom: 36,
            background: health.status === 'ok' ? '#d8f3dc' : '#fff0f0',
            display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%',
              background: health.status === 'ok' ? '#2d6a4f' : '#c1121f' }} />
            <div style={{ fontSize: 14, color: health.status === 'ok' ? '#2d6a4f' : '#c1121f' }}>
              {health.status === 'ok'
                ? `✓ Flask API online · Model: ${health.model} · Labels: ${health.labels?.join(', ')}`
                : '✗ Flask API offline — run python app.py in the backend folder'}
            </div>
          </div>
        )}

        {/* Comparison table */}
        <div style={{ background: '#fafaf8', borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)', marginBottom: 40 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f0efea' }}>
                <th style={{ padding: '14px 22px', textAlign: 'left', fontSize: 11,
                  letterSpacing: 2, textTransform: 'uppercase', color: '#8a8880',
                  borderBottom: '1px solid rgba(0,0,0,0.06)', fontWeight: 400 }}>Metric</th>
                <th style={{ padding: '14px 22px', textAlign: 'center', fontSize: 12,
                  fontFamily: "'Syne',sans-serif", fontWeight: 700, color: '#0f0f0f',
                  borderBottom: '1px solid rgba(0,0,0,0.06)' }}>Custom CNN</th>
                <th style={{ padding: '14px 22px', textAlign: 'center', fontSize: 12,
                  fontFamily: "'Syne',sans-serif", fontWeight: 700, color: '#0f0f0f',
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                  background: 'rgba(45,106,79,0.05)' }}>MobileNet ✦</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISONS.map(({ metric, custom, mobile, better }, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <td style={{ padding: '16px 22px', fontSize: 14, fontWeight: 500 }}>{metric}</td>
                  <td style={{ padding: '16px 22px', textAlign: 'center', fontSize: 14 }}>
                    {better === 'custom' ? badge(custom, true) : <span style={{ color: '#8a8880' }}>{custom}</span>}
                  </td>
                  <td style={{ padding: '16px 22px', textAlign: 'center', fontSize: 14,
                    background: 'rgba(45,106,79,0.03)' }}>
                    {better === 'mobile' ? badge(mobile, true) : <span style={{ color: '#8a8880' }}>{mobile}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 12, color: '#8a8880', marginBottom: 52 }}>
          ✦ Recommended for production — FER-2013 · 35,887 images · 7 emotion classes · saved as <code>emotion_model.h5</code>
        </p>

        {/* Architecture side-by-side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 52 }}>
          {[
            { title: 'Custom CNN', subtitle: '89.5% accuracy', layers: ARCH_CUSTOM, accent: '#457b9d' },
            { title: 'MobileNet',  subtitle: '92.3% accuracy ✦', layers: ARCH_MOBILE, accent: '#2d6a4f' },
          ].map(({ title, subtitle, layers, accent }) => (
            <div key={title} style={{ background: '#fafaf8', borderRadius: 20, padding: '28px 24px',
              border: `1px solid ${accent}22`, boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 12, color: accent, marginBottom: 20, fontWeight: 500 }}>{subtitle}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {layers.map((layer, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: accent,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: '#fff', fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
                    <div style={{ fontSize: 13, color: '#0f0f0f' }}>{layer}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Dataset info */}
        <div style={{ background: '#0f0f0f', color: '#fafaf8', borderRadius: 20, padding: '32px 28px' }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 20 }}>
            FER-2013 Dataset
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
            {[['35,887','Total Images'],['48×48','Image Size'],['7','Emotion Classes'],['Grayscale','Color Mode']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center', padding: '20px 12px',
                background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24,
                  letterSpacing: -1, marginBottom: 6 }}>{val}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
            Training split used Adam optimizer · batch size 64 · 25 epochs · data augmentation
            (rotation ±15°, zoom 15%, horizontal flip) · EarlyStopping & ReduceLROnPlateau callbacks.
          </div>
        </div>
      </div>
    </div>
  );
}
