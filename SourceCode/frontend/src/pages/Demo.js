import React, { useState } from 'react';
import DemoCard from '../components/DemoCard';
import UploadZone from '../components/UploadZone';
import EmotionBars from '../components/EmotionBars';
import { API_BASE, DEMO_SAMPLES, EMOTION_EMOJIS, addNoise } from '../constants';

export default function Demo() {
  const [preview, setPreview]     = useState(null);
  const [annotated, setAnnotated] = useState(null);
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [isDemo, setIsDemo]       = useState(false);
  const [serverStatus, setServerStatus] = useState(null); // 'ok' | 'offline'

  const reset = () => {
    setPreview(null); setAnnotated(null);
    setResult(null);  setError(''); setIsDemo(false);
  };

  const analyze = async (file) => {
    reset();
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    const fd = new FormData();
    fd.append('image', file);
    try {
      const res  = await fetch(`${API_BASE}/predict`, { method: 'POST', body: fd });
      const data = await res.json();
      setServerStatus('ok');
      setLoading(false);
      if (data.error) { setError(data.error); return; }
      if (data.faces_found === 0) { setError(data.message || 'No face detected.'); return; }
      setAnnotated(data.annotated_image);
      setResult({ scores: data.results[0].scores, dominant: data.results[0].dominant,
        confidence: data.results[0].confidence, faces: data.faces_found });
    } catch {
      setServerStatus('offline');
      setLoading(false);
      setError('⚠ AI server not running — showing demo results. Run python app.py to use the AI model.');
      const scores = addNoise(DEMO_SAMPLES['Happy']);
      const sorted = Object.entries(scores).sort((a,b) => b[1]-a[1]);
      setResult({ scores, dominant: sorted[0][0], confidence: sorted[0][1], faces: 1 });
      setIsDemo(true);
    }
  };

  const loadSample = (emotion) => {
    reset(); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const scores = addNoise(DEMO_SAMPLES[emotion]);
      const sorted = Object.entries(scores).sort((a,b) => b[1]-a[1]);
      setResult({ scores, dominant: sorted[0][0], confidence: sorted[0][1], faces: 1 });
      setIsDemo(true);
    }, 500);
  };

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', background: '#f0efea' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '60px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
            color: '#8a8880', marginBottom: 12 }}>Intelligent Real-Time Human Emotion Recognition Using Computer Vision</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800,
            fontSize: 'clamp(28px,4.5vw,44px)', letterSpacing: -2, lineHeight: 1, marginBottom: 14 }}>
            Try It Yourself.
          </h1>
          <p style={{ fontSize: 16, color: '#8a8880', maxWidth: 520 }}>
            Upload a face photo and our AI (<code style={{ background:'rgba(0,0,0,0.06)',padding:'2px 6px',borderRadius:4 }}>emotion_model.h5</code>) analyzes
            emotions via the Flask API. Falls back to demo mode if the server is offline.
          </p>
        </div>

        {/* Server status badge removed */}

        {/* Main card */}
        <DemoCard title="">
          <div style={{ padding: '36px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'center' }}>
            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <UploadZone onFile={analyze} preview={preview} annotated={annotated} />

              {annotated && (
                <button onClick={reset} style={{ marginTop: 10, fontSize: 12, padding: '7px 16px',
                  borderRadius: 100, border: '1px solid rgba(0,0,0,0.15)',
                  background: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                  ↩ Reset
                </button>
              )}

              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 11, color: '#8a8880', marginBottom: 8 }}>Or try a sample emotion:</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {Object.keys(DEMO_SAMPLES).map(em => (
                    <button key={em} onClick={() => loadSample(em)} style={{
                      fontSize: 11, padding: '6px 14px', borderRadius: 100,
                      border: '1px solid rgba(0,0,0,0.15)', background: 'none',
                      cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.2s',
                    }}>{EMOTION_EMOJIS[em]} {em}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right */}
            <div style={{ minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 14, alignSelf: 'center' }}>
                Emotion Analysis
              </div>

              {error && (
                <div style={{ background: '#fff0f0', border: '1px solid #ffc9c9', borderRadius: 10,
                  padding: '12px 16px', fontSize: 13, color: '#c1121f', marginBottom: 12 }}>{error}</div>
              )}

              {loading && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2"
                    style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" strokeOpacity=".2"/>
                    <path d="M12 2a10 10 0 0 1 10 10"/>
                  </svg>
                  <p style={{ fontSize: 14, color: '#8a8880' }}>AI analyzing emotions…</p>
                </div>
              )}

              {!loading && !result && !error && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', color: '#8a8880', gap: 10 }}>
                  <span style={{ fontSize: 32 }}>🧠</span>
                  <span style={{ fontSize: 14, textAlign: 'center' }}>
                    Upload an image or pick a sample to begin
                  </span>
                </div>
              )}

              {!loading && result && (
                <EmotionBars scores={result.scores} dominant={result.dominant}
                  confidence={result.confidence} facesFound={result.faces} isDemo={isDemo} />
              )}
            </div>
          </div>
        </DemoCard>

        {/* API Info removed */}
      </div>
    </div>
  );
}
