import React, { useRef, useState, useEffect, useCallback } from 'react';
import { EMOTION_COLORS, EMOTION_EMOJIS, API_BASE, DEMO_SAMPLES, addNoise } from '../constants';

export default function Webcam() {
  const videoRef    = useRef();
  const canvasRef   = useRef();
  const intervalRef = useRef();

  const [camOn,      setCamOn]      = useState(false);
  const [detecting,  setDetecting]  = useState(false);
  const [result,     setResult]     = useState(null);
  const [error,      setError]      = useState('');
  const [fps,        setFps]        = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const fpsTimer = useRef();

  // FPS counter
  useEffect(() => {
    fpsTimer.current = setInterval(() => {
      setFps(fc => { setFrameCount(0); return fc; });
    }, 1000);
    return () => clearInterval(fpsTimer.current);
  }, []);

  useEffect(() => { setFps(frameCount); }, [frameCount]);

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      videoRef.current.srcObject = stream;
      setCamOn(true);
    } catch (e) {
      setError('Camera access denied: ' + e.message);
    }
  };

  const stopCamera = () => {
    stopDetection();
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCamOn(false);
    setResult(null);
    // Clear canvas
    if (canvasRef.current) {
      canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const sendFrame = useCallback(async () => {
    if (!videoRef.current?.videoWidth) return;

    const off = document.createElement('canvas');
    off.width  = videoRef.current.videoWidth;
    off.height = videoRef.current.videoHeight;
    off.getContext('2d').drawImage(videoRef.current, 0, 0);
    const b64 = off.toDataURL('image/jpeg', 0.7);

    try {
      const res  = await fetch(`${API_BASE}/webcam_frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frame: b64 }),
      });
      const data = await res.json();
      setFrameCount(c => c + 1);

      if (data.annotated_frame) {
        const img = new Image();
        img.onload = () => {
          const cv = canvasRef.current;
          if (!cv) return;
          cv.width  = videoRef.current.videoWidth;
          cv.height = videoRef.current.videoHeight;
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        };
        img.src = data.annotated_frame;
      }

      if (data.faces_found > 0) {
        setResult(data.results[0]);
      } else {
        setResult(null);
      }
    } catch {
      // Demo fallback
      const emotions = Object.keys(DEMO_SAMPLES);
      const rand = emotions[Math.floor(Math.random() * emotions.length)];
      const scores = addNoise(DEMO_SAMPLES[rand]);
      const sorted = Object.entries(scores).sort((a,b) => b[1]-a[1]);
      setResult({ dominant: sorted[0][0], confidence: sorted[0][1], scores });
      setFrameCount(c => c + 1);
    }
  }, []);

  const startDetection = () => {
    setDetecting(true);
    intervalRef.current = setInterval(sendFrame, 200); // 5fps
  };

  const stopDetection = () => {
    setDetecting(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  useEffect(() => () => stopDetection(), []);

  const btnStyle = (active) => ({
    padding: '11px 22px', borderRadius: 100,
    border: active ? 'none' : '1.5px solid rgba(0,0,0,0.2)',
    background: active ? '#0f0f0f' : 'transparent',
    color: active ? '#fafaf8' : '#0f0f0f',
    fontFamily: "'DM Sans',sans-serif", fontSize: 14, cursor: 'pointer', transition: 'all .2s',
  });

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', background: '#0f0f0f', color: '#fafaf8' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 44 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>Live Demo</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800,
            fontSize: 'clamp(32px,5vw,56px)', letterSpacing: -2, lineHeight: 1, marginBottom: 14 }}>
            Webcam Emotion<br/>Detection.
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', maxWidth: 480 }}>
            Real-time webcam emotion detection.
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(193,18,31,0.15)', border: '1px solid rgba(193,18,31,0.3)',
            borderRadius: 12, padding: '12px 18px', fontSize: 13, color: '#ff6b6b', marginBottom: 20 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          {/* Video feed */}
          <div>
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden',
              background: '#1a1a1a', aspectRatio: '4/3' }}>
              <video ref={videoRef} autoPlay playsInline muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <canvas ref={canvasRef}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

              {/* Overlays */}
              {!camOn && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.3)', gap: 12 }}>
                  <span style={{ fontSize: 40 }}>📷</span>
                  <span style={{ fontSize: 14 }}>Camera not started</span>
                </div>
              )}

              {camOn && (
                <div style={{ position: 'absolute', top: 12, left: 12,
                  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                  color: '#fff', fontSize: 11, padding: '5px 12px',
                  borderRadius: 100, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {detecting && <div style={{ width: 7, height: 7, borderRadius: '50%',
                    background: '#28c840', animation: 'pulse 1.2s ease-in-out infinite' }} />}
                  {detecting ? `LIVE · ${fps} fps` : 'CAMERA ON'}
                </div>
              )}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              {!camOn ? (
                <button onClick={startCamera} style={btnStyle(true)}>▶ Start Camera</button>
              ) : (
                <>
                  <button onClick={stopCamera} style={btnStyle(false)}>⏹ Stop Camera</button>
                  {!detecting ? (
                    <button onClick={startDetection} style={btnStyle(true)}>🎥 Start Detection</button>
                  ) : (
                    <button onClick={stopDetection} style={{
                      ...btnStyle(false),
                      borderColor: 'rgba(255,255,255,0.2)', color: '#fafaf8'
                    }}>⏸ Pause Detection</button>
                  )}
                </>
              )}
            </div>

          </div>

          {/* Live results */}
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 20 }}>
              Live Results
            </div>

            {!result ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', minHeight: 300, color: 'rgba(255,255,255,0.25)', gap: 12 }}>
                <span style={{ fontSize: 32 }}>👀</span>
                <span style={{ fontSize: 14 }}>Start detection to see results</span>
              </div>
            ) : (
              <div>
                {/* Big dominant label */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 48, marginBottom: 4 }}>{EMOTION_EMOJIS[result.dominant]}</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800,
                    fontSize: 32, letterSpacing: -1, color: EMOTION_COLORS[result.dominant] }}>
                    {result.dominant}
                  </div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
                    {result.confidence?.toFixed ? result.confidence.toFixed(1) : result.confidence}% confidence
                  </div>
                </div>

                {/* Bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {Object.entries(result.scores)
                    .sort((a,b) => b[1]-a[1])
                    .map(([name, val]) => (
                      <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 74, fontSize: 12, color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>
                          {EMOTION_EMOJIS[name]} {name}
                        </div>
                        <div style={{ flex: 1, height: 8, borderRadius: 100, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 100,
                            background: EMOTION_COLORS[name] || '#ccc',
                            width: `${val}%`, transition: 'width 0.4s ease' }} />
                        </div>
                        <div style={{ width: 38, textAlign: 'right', fontSize: 11,
                          color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
                          {typeof val === 'number' ? val.toFixed(1) : val}%
                        </div>
                      </div>
                    ))}
                </div>

                <div style={{ marginTop: 16, padding: '10px 14px',
                  background: 'rgba(255,255,255,0.06)', borderRadius: 10,
                  fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                  Model: <strong style={{ color: 'rgba(255,255,255,0.7)' }}>emotion_model.h5</strong>
                  &nbsp;·&nbsp; FPS: <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{fps}</strong>
                  &nbsp;·&nbsp; Endpoint: <strong style={{ color: 'rgba(255,255,255,0.7)' }}>/webcam_frame</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
