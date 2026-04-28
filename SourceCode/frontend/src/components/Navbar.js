import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 48px',
    background: 'rgba(240,239,234,0.88)',
    backdropFilter: 'blur(14px)',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    transition: 'box-shadow 0.3s',
  },
  navScrolled: {
    boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
  },
  logo: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '-0.1px',
    textDecoration: 'none',
    color: '#0f0f0f',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    maxWidth: 420,
    lineHeight: 1.35,
  },
  logoImg: {
    width: 50,
    height: 50,
    flexShrink: 0,
  },
  logoMark: { display: 'flex', gap: 3, alignItems: 'center' },
  sq: { width: 10, height: 10, background: '#0f0f0f' },
  sqOutline: { width: 10, height: 10, border: '1.5px solid #0f0f0f' },
  tri: { width: 0, height: 0, borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent', borderBottom: '10px solid #0f0f0f' },
  links: { display: 'flex', gap: 32, listStyle: 'none' },
  link: { textDecoration: 'none', color: '#8a8880', fontSize: 14, transition: 'color 0.2s' },
  activeLink: { color: '#0f0f0f', fontWeight: 500 },
  cta: {
    background: '#0f0f0f', color: '#fafaf8', border: 'none',
    padding: '10px 22px', borderRadius: 100, fontSize: 14,
    fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none',
    display: 'inline-block',
  },
};

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : {}) }}>
      <Link to="/" style={styles.logo}>
        <img
          src="/logo.svg"
          alt="Emotion recognition logo"
          style={styles.logoImg}
        />
        <span>Intelligent Real-Time Human Emotion Recognition Using Computer Vision</span>
      </Link>

      <ul style={styles.links}>
        {[['/', 'Home'], ['/demo', 'Try Now'], ['/webcam', 'Live Webcam']].map(([path, label]) => (
          <li key={path}>
            <Link to={path} style={{ ...styles.link, ...(isActive(path) ? styles.activeLink : {}) }}>
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <Link to="/demo" style={styles.cta}>Get Started</Link>
    </nav>
  );
}
