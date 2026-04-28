import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import DemoCard from '../components/DemoCard';
import UploadZone from '../components/UploadZone';
import EmotionBars from '../components/EmotionBars';
import { API_BASE, DEMO_SAMPLES, addNoise, EMOTION_EMOJIS } from '../constants';

/* ── tiny hook for scroll-reveal ── */
function useReveal() {
  const ref = useRef();
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function Reveal({ children, delay = 0 }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : 'translateY(28px)',
      transition: `opacity 0.7s ${delay}s ease, transform 0.7s ${delay}s ease`,
    }}>{children}</div>
  );
}

/* ── Hero mini demo ── */
function HeroDemo() {
  const [preview, setPreview]     = useState(null);
  const [annotated, setAnnotated] = useState(null);
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [isDemo, setIsDemo]       = useState(false);

  const analyze = async (file) => {
    setLoading(true); setError(''); setResult(null); setAnnotated(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    const fd = new FormData();
    fd.append('image', file);
    try {
      const res  = await fetch(`${API_BASE}/predict`, { method: 'POST', body: fd });
      const data = await res.json();
      setLoading(false);
      if (data.error) { setError(data.error); return; }
      if (data.faces_found === 0) { setError(data.message || 'No face detected.'); return; }
      setAnnotated(data.annotated_image);
      setResult({ scores: data.results[0].scores, dominant: data.results[0].dominant, confidence: data.results[0].confidence, faces: data.faces_found });
      setIsDemo(false);
    } catch {
      setLoading(false);
      setError('AI server not running — showing demo results.');
      loadSample('Happy');
      setIsDemo(true);
    }
  };

  const loadSample = (emotion) => {
    setLoading(true); setError(''); setAnnotated(null);
    // show a matching sample preview image (SVG data-URL) so image and emotion align
    try { setPreview(SAMPLE_IMAGES[emotion] || null); } catch { setPreview(null); }
    setTimeout(() => {
      setLoading(false);
      const scores = addNoise(DEMO_SAMPLES[emotion]);
      const sorted = Object.entries(scores).sort((a,b) => b[1]-a[1]);
      setResult({ scores, dominant: sorted[0][0], confidence: sorted[0][1], faces: 1 });
      setIsDemo(true);
    }, 600);
  };

  return (
    <DemoCard title="">
      <div style={{ padding: '32px 32px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <UploadZone onFile={analyze} preview={preview} annotated={annotated} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            <span style={{ fontSize: 11, color: '#8a8880', alignSelf: 'center' }}>Quick test:</span>
            {Object.keys(DEMO_SAMPLES).map(em => (
              <button key={em} onClick={() => loadSample(em)} style={{
                fontSize: 11, padding: '5px 12px', borderRadius: 100,
                border: '1px solid rgba(0,0,0,0.15)', background: 'none',
                cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
              }}>{EMOTION_EMOJIS[em]} {em}</button>
            ))}
          </div>
        </div>
        <div style={{ minHeight: 240, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 14, alignSelf: 'center' }}>
            Emotion Analysis
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            {error ? (
              <div style={{ background: '#fff0f0', border: '1px solid #ffc9c9', borderRadius: 10,
                padding: '12px 16px', fontSize: 13, color: '#c1121f', marginBottom: 12 }}>{error}</div>
            ) : loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 12 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2"
                  style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" strokeOpacity=".2"/>
                  <path d="M12 2a10 10 0 0 1 10 10"/>
                </svg>
                <p style={{ fontSize: 13, color: '#8a8880' }}>AI analyzing emotions…</p>
              </div>
            ) : !result ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', color: '#8a8880', gap: 10 }}>
                <span style={{ fontSize: 28 }}>🧠</span>
                <span style={{ fontSize: 14, textAlign: 'center' }}>Upload a face or pick a sample</span>
              </div>
            ) : (
              <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EmotionBars scores={result.scores} dominant={result.dominant}
                  confidence={result.confidence} facesFound={result.faces} isDemo={isDemo} />
              </div>
            )}
          </div>
        </div>
      </div>
    </DemoCard>
  );
}

/* ── Feature card ── */
function FeatCard({ icon, title, desc }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: hover ? '#e8e7e2' : '#fafaf8',
      padding: '34px 28px', borderRight: '1px solid rgba(0,0,0,0.08)',
      transition: 'background 0.3s',
    }}>
      <div style={{ width: 44, height: 44, background: '#0f0f0f', borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#8a8880', lineHeight: 1.65 }}>{desc}</div>
    </div>
  );
}

const FEATURES = [
  { icon: '🤖', title: 'AI-Powered Detection',   desc: 'Our AI uses Haar cascade + CNN to process images and webcam frames in under 100ms per inference.' },
  { icon: '🎯', title: '92.3% Accuracy',        desc: 'AI model fine-tuned on FER-2013 (35,887 images) for reliable emotion recognition.' },
  { icon: '🧠', title: 'Deep Learning Models',   desc: 'Custom CNN and MobileNet architectures — 89.5% and 92.3% accuracy via Flask API.' },
  { icon: '📷', title: 'Webcam Streaming',      desc: 'Browser streams frames at 5fps to /webcam_frame; AI analyzes in real time.' },
  { icon: '📱', title: 'Edge-Ready',            desc: "MobileNet's depthwise separable convolutions enable mobile and embedded AI deployment." },
  { icon: '🔌', title: 'REST API',              desc: 'Flask exposes /predict, /webcam_frame, /labels, /health — CORS enabled for React.' },
];

const STEPS = [
  { n:1, title:'Face Detection',  desc:'OpenCV Haar cascade locates and crops faces from the input frame automatically.' },
  { n:2, title:'Preprocessing',   desc:'Resize to 48×48 grayscale, normalize to [0,1], expand dims for the AI model.' },
  { n:3, title:'AI Inference',    desc:'Our CNN (emotion_model.h5) runs Conv2D → BatchNorm → Pooling → Dense → Softmax.' },
  { n:4, title:'JSON Response',   desc:'API returns dominant emotion, 7 confidence scores, and an annotated image.' },
];

export default function Home() {
  const [statsRef, statsVis] = useReveal();

  return (
    <div>
      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '120px 24px 60px', position: 'relative', overflow: 'hidden' }}>

        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
          color: '#8a8880', marginBottom: 28, animation: 'fadeUp 0.8s ease both' }}>
          Intelligent Real-Time Human Emotion Recognition Using Computer Vision · Deep Learning
        </div>

        <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800,
          fontSize: 'clamp(40px,7vw,72px)', lineHeight: 0.95,
          letterSpacing: -3, marginBottom: 20, animation: 'fadeUp 0.8s 0.1s ease both' }}>
          Unlock<br />Feelings.
        </h1>

        <p style={{ fontSize: 'clamp(16px,2.2vw,22px)', color: '#8a8880', fontWeight: 300,
          marginBottom: 44, maxWidth: 560, lineHeight: 1.5, animation: 'fadeUp 0.8s 0.2s ease both' }}>
          AI detects 7 emotions in real time from images or your webcam — powered by our trained
          <code style={{ background:'rgba(0,0,0,0.06)',padding:'2px 6px',borderRadius:4,fontSize:'0.9em' }}> emotion_model.h5</code>
        </p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeUp 0.8s 0.3s ease both', marginBottom: 56 }}>
          <Link to="/demo" style={{ background: '#0f0f0f', color: '#fafaf8', padding: '15px 34px',
            borderRadius: 100, fontSize: 15, fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
            textDecoration: 'none', transition: 'all .2s' }}>Get Started</Link>
          <Link to="/webcam" style={{ background: 'transparent', color: '#0f0f0f',
            border: '1.5px solid rgba(0,0,0,0.2)', padding: '15px 34px', borderRadius: 100,
            fontSize: 15, fontFamily: "'DM Sans',sans-serif", fontWeight: 500, textDecoration: 'none' }}>
            Live Webcam Demo
          </Link>
        </div>

        {/* Hero demo card */}
        <div style={{ width: '100%', maxWidth: 840, animation: 'fadeUp 0.8s 0.4s ease both' }}>
          <HeroDemo />
        </div>
      </section>

      {/* ── STATS ── */}
      <div ref={statsRef} style={{ display: 'flex', justifyContent: 'center',
        maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
        {[['92.3%','MobileNet Accuracy'],['7','Emotions Detected'],['35K+','FER-2013 Images'],['<100ms','Inference Speed']].map(([num,label],i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '44px 20px',
            borderRight: i < 3 ? '1px solid rgba(0,0,0,0.08)' : 'none',
            opacity: statsVis ? 1 : 0, transform: statsVis ? 'none' : 'translateY(20px)',
            transition: `opacity 0.6s ${i*0.1}s ease, transform 0.6s ${i*0.1}s ease` }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800,
              fontSize: 'clamp(30px,4vw,46px)', letterSpacing: -2, lineHeight: 1 }}>{num}</div>
            <div style={{ fontSize: 12, color: '#8a8880', marginTop: 6 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <section style={{ padding: '100px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <Reveal><div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#8a8880', marginBottom: 16 }}>What We Offer</div></Reveal>
        <Reveal delay={0.1}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(28px,4vw,48px)',
            letterSpacing: -1.5, lineHeight: 1.05, maxWidth: 540, marginBottom: 52 }}>
            Everything to understand human emotions.
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
            border: '1px solid rgba(0,0,0,0.08)', borderRadius: 24, overflow: 'hidden' }}>
            {FEATURES.map((f, i) => <FeatCard key={i} {...f} />)}
          </div>
        </Reveal>
      </section>

      {/* ── EMOTIONS SHOWCASE ── */}
      <section style={{ padding: '80px 48px', background: '#0f0f0f' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal><div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>Emotion Classes</div></Reveal>
          <Reveal delay={0.1}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800,
              fontSize: 'clamp(28px,4vw,48px)', letterSpacing: -1.5, color: '#fafaf8',
              lineHeight: 1.05, marginBottom: 44 }}>
              7 emotions from a single frame.
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[['😊','Happy'],['😢','Sad'],['😠','Angry'],['😨','Fear'],['😲','Surprise'],['🤢','Disgust'],['😐','Neutral']].map(([emoji,label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10,
                  padding: '13px 20px', borderRadius: 100,
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fafaf8', fontSize: 15, fontWeight: 500,
                  background: 'rgba(255,255,255,0.05)', transition: 'all 0.3s', cursor: 'default' }}>
                  <span style={{ fontSize: 20 }}>{emoji}</span>{label}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '100px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <Reveal><div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#8a8880', marginBottom: 16 }}>Pipeline</div></Reveal>
        <Reveal delay={0.1}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(28px,4vw,48px)',
            letterSpacing: -1.5, lineHeight: 1.05, maxWidth: 540, marginBottom: 52 }}>
            From raw pixels to insight in milliseconds.
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 27, left: '8%', right: '8%',
              height: 1, background: 'rgba(0,0,0,0.1)', zIndex: 0 }} />
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#fafaf8',
                  border: '1.5px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 18px',
                  fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16 }}>{n}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 7 }}>{title}</div>
                <div style={{ fontSize: 13, color: '#8a8880', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 48px', textAlign: 'center', background: '#0f0f0f',
        color: '#fafaf8', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 130%, rgba(255,255,255,0.07) 0%, transparent 65%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800,
            fontSize: 'clamp(28px,4vw,48px)', letterSpacing: -1.5, marginBottom: 18 }}>
            Ready to unlock feelings?
          </div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 17, maxWidth: 440, margin: '0 auto' }}>
            Run the AI server, open the app, and start detecting emotions in real time.
          </p>
          <Link to="/demo" style={{ display: 'inline-block', marginTop: 32,
            background: '#fafaf8', color: '#0f0f0f', padding: '17px 40px',
            borderRadius: 100, fontSize: 16, fontFamily: "'DM Sans',sans-serif",
            fontWeight: 500, textDecoration: 'none' }}>Try It Now</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#f0efea', padding: '34px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16 }}>Intelligent Real-Time Human Emotion Recognition Using Computer Vision</div>
        <div style={{ fontSize: 12, color: '#8a8880' }}>© 2026 · Facial emotion recognition via deep learning</div>
      </footer>
    </div>
  );
}
