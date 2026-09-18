'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// ─── Theme Context ────────────────────────────────────────────────────────────
function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const t = saved ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
  }, []);
  const toggle = useCallback(() => {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }, []);
  return { theme, toggle };
}

// ─── Particle Field ───────────────────────────────────────────────────────────
function ParticleField() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i, left: `${(i * 37 + 11) % 97}%`, top: `${(i * 53 + 7) % 95}%`,
    size: 1.5 + (i % 3) * 0.5, duration: 10 + (i % 13), delay: -(i * 1.3),
    color: i % 3 === 0 ? 'rgba(6,182,212,0.5)' : i % 3 === 1 ? 'rgba(139,92,246,0.45)' : 'rgba(255,255,255,0.2)',
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map(p => <div key={p.id} style={{ position: 'absolute', left: p.left, top: p.top, width: p.size, height: p.size, borderRadius: '50%', background: p.color, animation: `particleDrift ${p.duration}s ${p.delay}s ease-in-out infinite alternate` }} />)}
    </div>
  );
}

// ─── Face Mesh Background ────────────────────────────────────────────────────
function FaceMeshBg() {
  // 68-point facial landmark layout in 200×240 viewBox
  const jaw =       [[45,85],[40,105],[40,125],[44,145],[53,163],[65,175],[80,185],[100,190],[120,185],[135,175],[147,163],[156,145],[160,125],[160,105],[155,85]];
  const rightBrow = [[60,68],[70,62],[82,58],[94,60],[102,64]];
  const leftBrow  = [[98,64],[106,60],[118,58],[130,62],[140,68]];
  const noseBridge= [[100,72],[100,88],[100,104],[100,118]];
  const noseBot   = [[84,122],[92,128],[100,130],[108,128],[116,122]];
  const rightEye  = [[62,86],[70,80],[80,78],[90,80],[90,88],[80,90],[70,90],[62,86]];
  const leftEye   = [[110,80],[120,78],[130,80],[138,86],[130,90],[120,90],[110,88],[110,80]];
  const outerLip  = [[74,148],[82,142],[91,138],[100,136],[109,138],[118,142],[126,148],[118,158],[109,162],[100,163],[91,162],[82,158],[74,148]];
  const forehead  = [[60,48],[80,40],[100,38],[120,40],[140,48]];
  const extras    = [[52,130],[148,130],[45,65],[155,65]];

  const toPath = (pts: number[][]) => pts.map(([x,y]) => `${x},${y}`).join(' ');
  const allPts = [...jaw,...rightBrow,...leftBrow,...noseBridge,...noseBot,...rightEye,...leftEye,...outerLip,...forehead,...extras];

  // Extra triangulation lines for mesh look
  const mesh: [number,number,number,number][] = [
    [45,85,60,68],[155,85,140,68],[60,68,62,86],[102,64,90,80],[98,64,110,80],[140,68,138,86],
    [62,86,44,145],[62,86,53,163],[138,86,147,163],[138,86,156,145],
    [90,88,84,122],[110,88,116,122],[84,122,74,148],[116,122,126,148],[100,130,100,136],
    [74,148,65,175],[126,148,135,175],[60,48,45,85],[140,48,155,85],[60,48,60,68],
    [140,48,140,68],[80,40,70,62],[120,40,130,62],[100,38,100,72],
    [40,105,62,86],[160,105,138,86],[52,130,62,86],[148,130,138,86],[52,130,53,163],[148,130,147,163],
  ];

  const faces = [
    { left: '-8%',  top: '2%',  w: 480, anim: 'faceMeshPulse 8s ease-in-out infinite' },
    { left: '58%',  top: '8%',  w: 320, anim: 'faceMeshPulse2 11s ease-in-out 3s infinite' },
    { left: '30%',  top: '55%', w: 260, anim: 'faceMeshPulse2 9s ease-in-out 6s infinite reverse' },
  ];

  return (
    <div className="face-mesh-bg" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {faces.map((f, fi) => (
        <svg key={fi} viewBox="0 0 200 240"
          style={{ position: 'absolute', left: f.left, top: f.top, width: f.w, height: f.w * 1.2, animation: f.anim }}>
          {/* Triangulation mesh lines */}
          {mesh.map(([x1,y1,x2,y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#06b6d4" strokeWidth="0.5" strokeOpacity="0.7" />
          ))}
          {/* Feature contours */}
          <polyline points={toPath(jaw)}       fill="none" stroke="#06b6d4" strokeWidth="0.9" />
          <polyline points={toPath(rightBrow)} fill="none" stroke="#8b5cf6" strokeWidth="0.8" />
          <polyline points={toPath(leftBrow)}  fill="none" stroke="#8b5cf6" strokeWidth="0.8" />
          <polyline points={toPath(noseBridge)}fill="none" stroke="#06b6d4" strokeWidth="0.6" />
          <polyline points={toPath(noseBot)}   fill="none" stroke="#06b6d4" strokeWidth="0.6" />
          <polyline points={toPath(rightEye)}  fill="none" stroke="#8b5cf6" strokeWidth="1" />
          <polyline points={toPath(leftEye)}   fill="none" stroke="#8b5cf6" strokeWidth="1" />
          <polyline points={toPath(outerLip)}  fill="none" stroke="#06b6d4" strokeWidth="0.7" />
          <polyline points={toPath(forehead)}  fill="none" stroke="#06b6d4" strokeWidth="0.5" />
          {/* Landmark dots */}
          {allPts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.4" fill={i % 3 === 0 ? '#8b5cf6' : '#06b6d4'}
              style={{ animation: `nodeBlink ${2 + (i % 4)}s ease-in-out ${(i * 0.15) % 3}s infinite` }} />
          ))}
          {/* Corner scan box */}
          <path d="M20,15 L40,15 M20,15 L20,35" stroke="#06b6d4" strokeWidth="1.5" fill="none" strokeOpacity="0.8" />
          <path d="M180,15 L160,15 M180,15 L180,35" stroke="#06b6d4" strokeWidth="1.5" fill="none" strokeOpacity="0.8" />
          <path d="M20,225 L40,225 M20,225 L20,205" stroke="#06b6d4" strokeWidth="1.5" fill="none" strokeOpacity="0.8" />
          <path d="M180,225 L160,225 M180,225 L180,205" stroke="#06b6d4" strokeWidth="1.5" fill="none" strokeOpacity="0.8" />
        </svg>
      ))}
    </div>
  );
}

// ─── Glitch Overlay ───────────────────────────────────────────────────────────
function GlitchOverlay() {
  const strips = [
    { top: '12%', h: 2, color: 'rgba(6,182,212,0.5)',  dur: '5s',  delay: '0s' },
    { top: '34%', h: 3, color: 'rgba(244,63,94,0.4)',  dur: '7s',  delay: '1.8s' },
    { top: '58%', h: 2, color: 'rgba(139,92,246,0.45)',dur: '4.5s',delay: '3.2s' },
    { top: '72%', h: 4, color: 'rgba(6,182,212,0.3)',  dur: '6s',  delay: '0.9s' },
    { top: '88%', h: 2, color: 'rgba(244,63,94,0.35)', dur: '8s',  delay: '4.5s' },
  ];
  return (
    <div className="glitch-overlay" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {strips.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', left: 0, right: 0, top: s.top, height: s.h,
          background: `linear-gradient(90deg, transparent 0%, ${s.color} 30%, ${s.color} 70%, transparent 100%)`,
          transformOrigin: 'left center',
          animation: `glitchStrip ${s.dur} ${s.delay} ease-in-out infinite`,
          filter: 'blur(0.5px)',
        }} />
      ))}
      {/* RGB chroma layers */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(244,63,94,0.04)', animation: 'chromaShiftR 7s 0s linear infinite', mixBlendMode: 'screen' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,182,212,0.04)',  animation: 'chromaShiftB 7s 1.5s linear infinite', mixBlendMode: 'screen' }} />
    </div>
  );
}

// ─── Background ───────────────────────────────────────────────────────────────
function Background() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: 1000, height: 1000, marginTop: -500, marginLeft: -500, borderRadius: '40% 60% 55% 45% / 45% 55% 60% 40%', background: 'conic-gradient(from 0deg, rgba(6,182,212,0.18), rgba(139,92,246,0.24), rgba(99,102,241,0.18), rgba(6,182,212,0.1), rgba(244,63,94,0.14), rgba(6,182,212,0.18))', filter: 'blur(55px)', animation: 'aurora 20s linear infinite' }} />
      <div style={{ position: 'absolute', top: '-8%', left: '-3%', width: 650, height: 650, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.5) 0%, rgba(6,182,212,0.18) 40%, transparent 70%)', filter: 'blur(38px)', animation: 'orbDrift1 14s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '-12%', right: '-8%', width: 750, height: 750, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.45) 0%, rgba(139,92,246,0.16) 40%, transparent 70%)', filter: 'blur(42px)', animation: 'orbDrift2 18s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', top: '30%', left: '35%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.32) 0%, rgba(99,102,241,0.1) 45%, transparent 70%)', filter: 'blur(50px)', animation: 'orbDrift3 22s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', top: '3%', right: '3%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,63,94,0.3) 0%, rgba(244,63,94,0.08) 50%, transparent 70%)', filter: 'blur(42px)', animation: 'orbDrift2 26s ease-in-out infinite reverse' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.3) 0%, rgba(20,184,166,0.08) 50%, transparent 70%)', filter: 'blur(46px)', animation: 'orbDrift1 30s ease-in-out infinite reverse' }} />
      {/* Face mesh — on-theme deepfake detection visual */}
      <FaceMeshBg />
      {/* Glitch strips — digital manipulation theme */}
      <GlitchOverlay />
      <ParticleField />
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface AnalysisResult { prediction: 'Real' | 'Fake'; fake_probability: number; faces_detected?: number; frames_analyzed?: number; }
interface HistoryItem { id: number; filename: string; result: AnalysisResult; timestamp: Date; preview?: string; }
interface Toast { id: number; message: string; type: 'success' | 'error' | 'info'; }
interface BatchItem { id: number; file: File; preview: string | null; result: AnalysisResult | null; loading: boolean; error: string | null; }

// ─── Ripple helper ────────────────────────────────────────────────────────────
function useRipple() {
  return (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple-wave';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };
}

// ─── Tooltip wrapper ──────────────────────────────────────────────────────────
function Tip({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <span className="tooltip-wrap">
      {children}
      <span className="tooltip-text">{text}</span>
    </span>
  );
}

// ─── Animated count number ────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0; const steps = 40; const inc = value / steps;
    const t = setInterval(() => { start += inc; if (start >= value) { setDisplay(value); clearInterval(t); } else setDisplay(Math.round(start)); }, 30);
    return () => clearInterval(t);
  }, [value]);
  return <span className="count-up">{display}{suffix}</span>;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function ShieldIcon({ style }: { style?: React.CSSProperties }) {
  return <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>;
}
function UploadIcon({ style }: { style?: React.CSSProperties }) {
  return <svg style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>;
}
function VideoIcon({ style }: { style?: React.CSSProperties }) {
  return <svg style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>;
}
function GitHubIcon({ style }: { style?: React.CSSProperties }) {
  return <svg style={style} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>;
}

// ─── API Health Indicator ─────────────────────────────────────────────────────
function HealthDot() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  useEffect(() => {
    const check = async () => {
      try { await fetch('http://localhost:8000/health', { signal: AbortSignal.timeout(2500) }); setStatus('online'); }
      catch { setStatus('offline'); }
    };
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);
  const color = status === 'online' ? '#10b981' : status === 'offline' ? '#f43f5e' : '#f59e0b';
  const label = status === 'online' ? 'API Online' : status === 'offline' ? 'API Offline' : 'Checking…';
  return (
    <Tip text={label}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'default' }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, animation: status === 'online' ? 'scanPulse 2s ease-in-out infinite' : 'none' }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{status === 'checking' ? '…' : status}</span>
      </div>
    </Tip>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ theme, toggleTheme, compareMode, setCompareMode }: {
  theme: 'dark' | 'light'; toggleTheme: () => void;
  compareMode: boolean; setCompareMode: (v: boolean) => void;
}) {
  return (
    <nav id="main-navbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 60, background: 'rgba(3,3,10,0.08)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(139,92,246,0.3))', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldIcon style={{ width: 18, height: 18, color: '#06b6d4' }} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Deepfake<span className="gradient-text">Detector</span></span>
      </div>
      <HealthDot />
      <div className="nav-badge" style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', fontSize: 11, fontWeight: 600, color: '#a78bfa' }}>⚡ EfficientNet B0</div>
      {/* Compare toggle */}
      <button
        onClick={() => setCompareMode(!compareMode)}
        style={{ padding: '5px 12px', borderRadius: 8, background: compareMode ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${compareMode ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.08)'}`, color: compareMode ? 'var(--accent-cyan)' : 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
      >
        ↔ Compare
      </button>
      {/* Theme toggle */}
      <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <a href="https://github.com/hepin281-alt/deepfakedetection" target="_blank" rel="noopener noreferrer" id="github-link" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
        <GitHubIcon style={{ width: 16, height: 16 }} />GitHub
      </a>
    </nav>
  );
}

// ─── Stats Strip ─────────────────────────────────────────────────────────────
function StatsStrip() {
  const [counts, setCounts] = useState([0, 0, 0]);
  const targets = [10000, 94, 2];
  const labels = ['Scans Completed', 'Accuracy Rate', 'Avg. Speed'];
  const formats = [(n: number) => `${n.toLocaleString()}+`, (n: number) => `${n}%`, (n: number) => `< ${n}s`];
  useEffect(() => {
    const steps = 60; const duration = 1800; let step = 0;
    const timer = setInterval(() => { step++; const ease = 1 - Math.pow(1 - step / steps, 3); setCounts(targets.map(t => Math.round(t * ease))); if (step >= steps) clearInterval(timer); }, duration / steps);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="stats-strip" style={{ display: 'flex', marginBottom: 40, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
      {counts.map((count, i) => (
        <div key={i} style={{ flex: 1, padding: '20px 16px', textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
          <p style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 4 }}><span className="gradient-text">{formats[i](count)}</span></p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{labels[i]}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Circular Gauge ───────────────────────────────────────────────────────────
function CircularGauge({ probability, isFake }: { probability: number; isFake: boolean }) {
  const radius = 52; const circumference = 2 * Math.PI * radius;
  const safeProb = isNaN(probability) ? 0 : probability;
  const displayPct = isFake ? safeProb : 1 - safeProb;
  const color = isFake ? '#f43f5e' : '#10b981';
  const offset = String(circumference * (1 - displayPct));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      <Tip text={isFake ? 'Probability this media is AI-generated' : 'Probability this media is authentic'}>
        <div style={{ position: 'relative', width: 130, height: 130 }}>
          <svg width="130" height="130" viewBox="0 0 130 130">
            <defs><filter id="gauge-glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
            <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <circle cx="65" cy="65" r={radius} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={String(circumference)} strokeDashoffset={offset} transform="rotate(-90 65 65)" filter="url(#gauge-glow)" style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}><AnimatedNumber value={Math.round(displayPct * 100)} suffix="%" /></span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>{isFake ? 'Fake' : 'Real'}</span>
          </div>
        </div>
      </Tip>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Confidence Gauge</p>
    </div>
  );
}

// ─── Confidence Bar ───────────────────────────────────────────────────────────
function ConfidenceBar({ probability, isFake }: { probability: number; isFake: boolean }) {
  const pct = isFake ? Math.round(probability * 100) : Math.round((1 - probability) * 100);
  const color = isFake ? 'linear-gradient(90deg,#f43f5e,#fb7185)' : 'linear-gradient(90deg,#10b981,#34d399)';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <Tip text={isFake ? 'How likely the model thinks this is AI-generated' : 'How confident the model is this media is real'}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', cursor: 'help', borderBottom: '1px dashed rgba(255,255,255,0.15)' }}>{isFake ? 'Fake Probability' : 'Real Confidence'} ⓘ</span>
        </Tip>
        <span style={{ fontSize: 13, fontWeight: 700, color: isFake ? 'var(--fake-color)' : 'var(--real-color)' }}><AnimatedNumber value={pct} suffix="%" /></span>
      </div>
      <div style={{ height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 999, background: color, width: `${pct}%`, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)', boxShadow: isFake ? '0 0 12px rgba(244,63,94,0.5)' : '0 0 12px rgba(16,185,129,0.5)' }} />
      </div>
    </div>
  );
}

// ─── Risk Meter ───────────────────────────────────────────────────────────────
function RiskMeter({ probability }: { probability: number }) {
  const pct = probability * 100;
  let label = 'Safe'; let color = '#10b981';
  if (pct >= 40 && pct < 70) { label = 'Suspicious'; color = '#f59e0b'; }
  if (pct >= 70) { label = 'Deepfake Detected'; color = '#f43f5e'; }
  const segColors = ['#10b981', '#84cc16', '#f59e0b', '#f97316', '#f43f5e'];
  const segLabels = ['0–20%', '20–40%', '40–60%', '60–80%', '80–100%'];
  return (
    <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
      <Tip text="Segmented risk scale based on fake probability ranges">
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, cursor: 'help', borderBottom: '1px dashed rgba(255,255,255,0.1)', display: 'inline-block' }}>Risk Level ⓘ</p>
      </Tip>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, display: 'flex', gap: 3 }}>
          {segColors.map((c, i) => (
            <Tip key={i} text={segLabels[i]}>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: pct >= i * 20 ? c : 'rgba(255,255,255,0.08)', boxShadow: pct >= i * 20 ? `0 0 8px ${c}60` : 'none', transition: `all 0.8s ease ${i * 0.1}s`, cursor: 'help' }} />
            </Tip>
          ))}
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 130, textAlign: 'right' }}>{label}</span>
      </div>
    </div>
  );
}

// ─── Toast System ─────────────────────────────────────────────────────────────
function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: number) => void }) {
  const styles = { success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', icon: '✅' }, error: { bg: 'rgba(244,63,94,0.15)', border: 'rgba(244,63,94,0.4)', icon: '❌' }, info: { bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.4)', icon: '💡' } };
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 300, display: 'flex', flexDirection: 'column-reverse', gap: 8 }}>
      {toasts.map(t => { const s = styles[t.type]; return (
        <div key={t.id} className="animate-fade-slide-up" onClick={() => removeToast(t.id)} style={{ padding: '12px 16px', borderRadius: 12, background: s.bg, border: `1px solid ${s.border}`, backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', gap: 10, minWidth: 240, maxWidth: 320, cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <span style={{ fontSize: 16 }}>{s.icon}</span>
          <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>{t.message}</span>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>×</span>
        </div>
      ); })}
    </div>
  );
}

// ─── URL Paste Dialog ─────────────────────────────────────────────────────────
function UrlDialog({ onClose, onLoad }: { onClose: () => void; onLoad: (url: string) => void }) {
  const [url, setUrl] = useState('');
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="glass-card animate-fade-slide-up" style={{ padding: 28, width: '90%', maxWidth: 460 }}>
        <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: 'var(--text-primary)' }}>Load from URL</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Enter a direct image URL (jpg, png, webp, gif)</p>
        <input autoFocus value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && url && onLoad(url)}
          placeholder="https://example.com/image.jpg"
          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', marginBottom: 14, boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button className="glow-button ripple-btn" onClick={() => url && onLoad(url)} style={{ flex: 1, padding: '10px', fontSize: 13, borderRadius: 10 }}>Load Image</button>
        </div>
      </div>
    </div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);
  return (
    <div className="lightbox-overlay" onClick={onClose}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Fullscreen preview" onClick={e => e.stopPropagation()} />
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
    </div>
  );
}

// ─── Share Card ───────────────────────────────────────────────────────────────
function ShareCard({ result, filename, onExport }: { result: AnalysisResult; filename: string; onExport: () => void }) {
  const isFake = result.prediction === 'Fake';
  const ripple = useRipple();
  return (
    <div id="share-card" className="share-card">
      <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 8 }}>Analysis Result</p>
      <p style={{ fontSize: 36, fontWeight: 900, color: isFake ? 'var(--fake-color)' : 'var(--real-color)', marginBottom: 6, textShadow: isFake ? '0 0 20px var(--fake-glow)' : '0 0 20px var(--real-glow)' }}>{isFake ? '❌ FAKE' : '✅ REAL'}</p>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{filename}</p>
      <p style={{ fontSize: 22, fontWeight: 800, color: isFake ? 'var(--fake-color)' : 'var(--real-color)' }}>{(result.fake_probability * 100).toFixed(1)}% fake probability</p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>DeepfakeDetector · EfficientNet B0</p>
      <button id="export-btn" className="ripple-btn" onClick={(e) => { ripple(e); onExport(); }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
        ⬇ Export as PNG
      </button>
    </div>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { icon: '📤', title: 'Upload Media', desc: 'Drag & drop, click to browse, paste URL, or press Ctrl+V to paste from clipboard.' },
    { icon: '🔬', title: 'AI Analysis', desc: 'EfficientNet B0 scans for deepfake artifacts, GAN patterns and face inconsistencies.' },
    { icon: '✅', title: 'Get Results', desc: 'Receive a verdict with confidence gauge, risk meter, probability scores, and share card.' },
  ];
  return (
    <div style={{ marginTop: 60 }}>
      <p style={{ textAlign: 'center', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 24 }}>How it works</p>
      <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {steps.map((step, i) => (
          <div key={i} className="glass-card" style={{ padding: '24px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>{step.icon}</div>
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, color: 'var(--text-primary)' }}>{step.title}</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Session History ──────────────────────────────────────────────────────────
function HistoryPanel({ history }: { history: HistoryItem[] }) {
  const [open, setOpen] = useState(false);
  if (history.length === 0) return null;
  return (
    <div style={{ marginTop: 32 }}>
      <button id="history-toggle" onClick={() => setOpen(o => !o)} style={{ width: '100%', padding: '12px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>🕓 Recent Scans ({history.length})</span>
        <span style={{ transition: 'transform 0.25s', transform: open ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>▾</span>
      </button>
      {open && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }} className="animate-fade-slide-up">
          {history.map(item => (
            <div key={item.id} className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              {item.preview && <img src={item.preview} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.filename}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.timestamp.toLocaleTimeString()}</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, flexShrink: 0, background: item.result.prediction === 'Fake' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)', color: item.result.prediction === 'Fake' ? '#f43f5e' : '#10b981', border: `1px solid ${item.result.prediction === 'Fake' ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)'}` }}>
                {item.result.prediction === 'Fake' ? '❌ FAKE' : '✅ REAL'}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0 }}>{(item.result.fake_probability * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Batch Results Grid ───────────────────────────────────────────────────────
function BatchResultsGrid({ items }: { items: BatchItem[] }) {
  return (
    <div className="batch-grid">
      {items.map((item, idx) => {
        const isFake = item.result?.prediction === 'Fake';
        const delay = `${idx * 80}ms`;
        return (
          <div key={item.id} className="batch-card flip-in" style={{ animationDelay: delay }}>
            {/* Thumbnail */}
            <div style={{ height: 120, overflow: 'hidden', position: 'relative', background: 'rgba(255,255,255,0.03)' }}>
              {item.preview
                ? <img src={item.preview} alt={item.file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><VideoIcon style={{ width: 28, height: 28, color: 'var(--accent-purple)' }} /></div>
              }
              {item.loading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,8,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(6,182,212,0.2)', borderTopColor: 'var(--accent-cyan)' }} className="animate-spin-slow" />
                </div>
              )}
              {item.result && (
                <div style={{ position: 'absolute', top: 6, right: 6, padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: isFake ? 'rgba(244,63,94,0.85)' : 'rgba(16,185,129,0.85)', color: 'white' }}>
                  {isFake ? 'FAKE' : 'REAL'}
                </div>
              )}
            </div>
            {/* Info */}
            <div style={{ padding: '10px 12px' }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>{item.file.name}</p>
              {item.result && (
                <>
                  <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 4 }}>
                    <div style={{ height: '100%', borderRadius: 999, width: `${item.result.fake_probability * 100}%`, background: isFake ? 'linear-gradient(90deg,#f43f5e,#fb7185)' : 'linear-gradient(90deg,#10b981,#34d399)', transition: 'width 1s ease' }} />
                  </div>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{(item.result.fake_probability * 100).toFixed(1)}% fake</p>
                </>
              )}
              {item.error && <p style={{ fontSize: 10, color: '#f43f5e' }}>{item.error}</p>}
              {item.loading && <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Analyzing…</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Compare Panel ────────────────────────────────────────────────────────────
function ComparePanel({ label, addToast }: { label: string; addToast: (msg: string, type: Toast['type']) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f); setResult(null); setError(null);
    if (f.type.startsWith('image/')) { const r = new FileReader(); r.onload = e => setPreview(e.target?.result as string); r.readAsDataURL(f); }
    else setPreview(null);
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true); setError(null);
    const fd = new FormData(); fd.append('file', file);
    const endpoint = file.type.startsWith('video/') ? 'http://localhost:8000/analyze-video' : 'http://localhost:8000/analyze-image';
    try {
      const res = await fetch(endpoint, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed');
      if (data.status === 'error') throw new Error(data.message || 'Failed');
      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      setError(msg); addToast(`${label}: ${msg}`, 'error');
    } finally { setLoading(false); }
  };

  const isFake = result?.prediction === 'Fake';

  return (
    <div className="compare-panel">
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      {!file ? (
        <div
          style={{ padding: '40px 20px', textAlign: 'center', cursor: 'pointer', border: isDragOver ? '2px dashed var(--accent-cyan)' : '2px dashed transparent', transition: 'all 0.2s' }}
          onDrop={e => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); }}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <UploadIcon style={{ width: 32, height: 32, color: 'var(--accent-cyan)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Drop or click to upload</p>
        </div>
      ) : (
        <div>
          {preview && (
            <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
              <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {loading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,8,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(6,182,212,0.2)', borderTopColor: 'var(--accent-cyan)' }} className="animate-spin-slow" /></div>}
            </div>
          )}
          <div style={{ padding: '12px 16px' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
            {result && (
              <div className="flip-in" style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 22, fontWeight: 900, color: isFake ? 'var(--fake-color)' : 'var(--real-color)', marginBottom: 4 }}>{isFake ? '❌ FAKE' : '✅ REAL'}</p>
                <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${result.fake_probability * 100}%`, borderRadius: 999, background: isFake ? 'linear-gradient(90deg,#f43f5e,#fb7185)' : 'linear-gradient(90deg,#10b981,#34d399)', transition: 'width 1.2s ease' }} />
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{(result.fake_probability * 100).toFixed(1)}% fake probability</p>
              </div>
            )}
            {error && <p style={{ fontSize: 11, color: '#f43f5e', marginBottom: 8 }}>{error}</p>}
            {!result && !loading && !error && (
              <button onClick={analyze} style={{ width: '100%', padding: '8px', borderRadius: 8, background: 'linear-gradient(135deg,var(--accent-cyan),var(--accent-purple))', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Analyze</button>
            )}
            <button onClick={() => { setFile(null); setPreview(null); setResult(null); setError(null); }} style={{ width: '100%', marginTop: 6, padding: '6px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>Reset</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Compare Summary Banner ───────────────────────────────────────────────────
// ─── PWA Install Banner ───────────────────────────────────────────────────────
function PwaBanner() {
  const [prompt, setPrompt] = useState<Event | null>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setPrompt(e); setShow(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  if (!show) return null;
  return (
    <div className="pwa-banner">
      <span style={{ fontSize: 22 }}>📱</span>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Install DeepfakeDetector</p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Add to your home screen for quick access</p>
      </div>
      <button
        onClick={async () => {
          if (!prompt) return;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (prompt as any).prompt();
          setShow(false);
        }}
        style={{ padding: '7px 16px', borderRadius: 8, background: 'linear-gradient(135deg,var(--accent-cyan),var(--accent-purple))', border: 'none', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
      >
        Install
      </button>
      <button onClick={() => setShow(false)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>×</button>
    </div>
  );
}

// ─── Drag-to-Crop ─────────────────────────────────────────────────────────────
function CropOverlay({ src, onCrop, onCancel }: { src: string; onCrop: (blob: Blob) => void; onCancel: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cvs = canvasRef.current!;
    const r = cvs.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const draw = useCallback(() => {
    const cvs = canvasRef.current; const img = imgRef.current;
    if (!cvs || !img) return;
    const ctx = cvs.getContext('2d')!;
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
    if (rect && (rect.w !== 0 || rect.h !== 0)) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0, 0, cvs.width, cvs.height);
      ctx.clearRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }
  }, [rect]);

  useEffect(() => { draw(); }, [draw]);

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => { const p = getPos(e); startRef.current = p; setDragging(true); setRect({ x: p.x, y: p.y, w: 0, h: 0 }); };
  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging || !startRef.current) return;
    const p = getPos(e);
    setRect({ x: Math.min(p.x, startRef.current.x), y: Math.min(p.y, startRef.current.y), w: Math.abs(p.x - startRef.current.x), h: Math.abs(p.y - startRef.current.y) });
  };
  const onMouseUp = () => { setDragging(false); };

  const cropAndSend = () => {
    const cvs = canvasRef.current; const img = imgRef.current;
    if (!cvs || !img || !rect || rect.w < 10 || rect.h < 10) return;
    const scaleX = img.naturalWidth / cvs.width;
    const scaleY = img.naturalHeight / cvs.height;
    const offscreen = document.createElement('canvas');
    offscreen.width = rect.w * scaleX; offscreen.height = rect.h * scaleY;
    const ctx = offscreen.getContext('2d')!;
    ctx.drawImage(img, rect.x * scaleX, rect.y * scaleY, rect.w * scaleX, rect.h * scaleY, 0, 0, offscreen.width, offscreen.height);
    offscreen.toBlob(blob => { if (blob) onCrop(blob); }, 'image/jpeg', 0.95);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 450, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>✂️ Draw a rectangle to select the region to analyze</p>
      <div style={{ position: 'relative', maxWidth: '80vw', maxHeight: '65vh' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={imgRef} src={src} alt="crop" style={{ display: 'none' }} onLoad={draw} />
        <canvas
          ref={canvasRef}
          width={Math.min(600, typeof window !== 'undefined' ? Math.round(window.innerWidth * 0.78) : 600)}
          height={Math.min(400, typeof window !== 'undefined' ? Math.round(window.innerHeight * 0.55) : 400)}
          style={{ borderRadius: 12, cursor: 'crosshair', display: 'block', width: '100%', height: 'auto', maxWidth: '80vw' }}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}
        />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{ padding: '10px 24px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
        <button onClick={cropAndSend} disabled={!rect || rect.w < 10} style={{ padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg,var(--accent-cyan),var(--accent-purple))', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: (!rect || rect.w < 10) ? 0.5 : 1 }}>Analyze Selection</button>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const tech = ['PyTorch', 'EfficientNet B0', 'Next.js 16', 'FastAPI', 'OpenCV'];
  return (
    <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.05)', padding: '48px 24px 40px', marginTop: 80 }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}><ShieldIcon style={{ width: 18, height: 18, color: 'var(--accent-cyan)' }} /><span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>DeepfakeDetector</span></div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>AI-powered media authentication using state-of-the-art deep learning models.</p>
          </div>
          <div>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 12 }}>Powered By</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{tech.map(b => <span key={b} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>{b}</span>)}</div>
          </div>
          <div>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 12 }}>Links</p>
            {['GitHub', 'How it Works', 'API Docs'].map(l => <a key={l} href="#" style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 8 }}>{l}</a>)}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Built with ❤️ using PyTorch + EfficientNet B0 · For educational & research purposes only</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
let toastCounter = 0;

export default function Home() {
  const { theme, toggle: toggleTheme } = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('scan_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Restore timestamps as Date objects
        return parsed.map((h: HistoryItem & { timestamp: string }) => ({ ...h, timestamp: new Date(h.timestamp) }));
      }
    } catch { /* ignore */ }
    return [];
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [copied, setCopied] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [cropMode, setCropMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const ripple = useRipple();

  const removeToast = useCallback((id: number) => setToasts(p => p.filter(t => t.id !== id)), []);
  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = ++toastCounter;
    setToasts(p => [{ id, message, type }, ...p].slice(0, 5));
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  const handleFile = useCallback((f: File) => {
    setFile(f); setResult(null); setError(null);
    if (f.type.startsWith('image/')) { const r = new FileReader(); r.onload = e => setPreview(e.target?.result as string); r.readAsDataURL(f); }
    else setPreview(null);
  }, []);

  // Clipboard paste
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      for (const item of Array.from(e.clipboardData?.items ?? [])) {
        if (item.type.startsWith('image/')) { const f = item.getAsFile(); if (f) { handleFile(f); addToast('📋 Image pasted from clipboard!', 'info'); } break; }
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [handleFile, addToast]);

  // Enter key → Analyze
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && file && !loading && !result && !cropMode && !showUrlDialog) {
        handleUpload();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, loading, result, cropMode, showUrlDialog]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    if (files.length === 1) {
      handleFile(files[0]);
    } else {
      // Batch mode
      const items: BatchItem[] = files.map((f, i) => ({
        id: i, file: f, preview: null, result: null, loading: false, error: null,
      }));
      // Generate previews
      items.forEach((item, i) => {
        if (item.file.type.startsWith('image/')) {
          const r = new FileReader();
          r.onload = ev => setBatchItems(prev => prev.map((b, idx) => idx === i ? { ...b, preview: ev.target?.result as string } : b));
          r.readAsDataURL(item.file);
        }
      });
      setBatchItems(items);
      addToast(`📦 ${files.length} files loaded for batch analysis`, 'info');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 1) handleFile(files[0]);
    else if (files.length > 1) {
      const items: BatchItem[] = files.map((f, i) => ({ id: i, file: f, preview: null, result: null, loading: false, error: null }));
      files.forEach((f, i) => {
        if (f.type.startsWith('image/')) {
          const r = new FileReader(); r.onload = ev => setBatchItems(prev => prev.map((b, idx) => idx === i ? { ...b, preview: ev.target?.result as string } : b));
          r.readAsDataURL(f);
        }
      });
      setBatchItems(items);
      addToast(`📦 ${files.length} files dropped for batch analysis`, 'info');
    }
  };

  const clearFile = () => { setFile(null); setPreview(null); setResult(null); setError(null); setBatchItems([]); };

  // Batch analyze all
  const handleBatchAnalyze = async () => {
    const promises = batchItems.map(async (item, i) => {
      setBatchItems(prev => prev.map((b, idx) => idx === i ? { ...b, loading: true } : b));
      const fd = new FormData(); fd.append('file', item.file);
      const endpoint = item.file.type.startsWith('video/') ? 'http://localhost:8000/analyze-video' : 'http://localhost:8000/analyze-image';
      try {
        const res = await fetch(endpoint, { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed');
        if (data.status === 'error') throw new Error(data.message || 'No face');
        setBatchItems(prev => prev.map((b, idx) => idx === i ? { ...b, loading: false, result: data } : b));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error';
        setBatchItems(prev => prev.map((b, idx) => idx === i ? { ...b, loading: false, error: msg } : b));
      }
    });
    await Promise.all(promises);
    addToast('✅ Batch analysis complete!', 'success');
  };

  // Load from URL
  const handleUrlLoad = async (url: string) => {
    setShowUrlDialog(false);
    try {
      addToast('🔗 Fetching image from URL…', 'info');
      const res = await fetch(url);
      const blob = await res.blob();
      if (!blob.type.startsWith('image/')) throw new Error('URL is not an image');
      const f = new File([blob], url.split('/').pop() || 'image.jpg', { type: blob.type });
      handleFile(f);
      addToast('✅ Image loaded from URL!', 'success');
    } catch { addToast('❌ Failed to load image from URL', 'error'); }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true); setError(null); setResult(null);
    const formData = new FormData(); formData.append('file', file);
    const isVideo = file.type.startsWith('video/');
    const endpoint = isVideo ? 'http://localhost:8000/analyze-video' : 'http://localhost:8000/analyze-image';
    try {
      const res = await fetch(endpoint, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Analysis failed');
      if (data.status === 'error') throw new Error(data.message || 'Analysis failed');
      setResult(data);
      setHistory(prev => {
        const next = [{ id: Date.now(), filename: file.name, result: data, timestamp: new Date(), preview: preview ?? undefined }, ...prev].slice(0, 10);
        try { localStorage.setItem('scan_history', JSON.stringify(next)); } catch { /* ignore */ }
        return next;
      });
      addToast(data.prediction === 'Fake' ? '❌ Deepfake detected!' : '✅ Media appears authentic', data.prediction === 'Fake' ? 'error' : 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg); addToast(`Analysis failed: ${msg}`, 'error');
    } finally { setLoading(false); }
  };

  const copyResults = async () => {
    if (!result) return;
    const text = `🔍 Deepfake Detector Result\nVerdict: ${result.prediction}\nFake Probability: ${(result.fake_probability * 100).toFixed(1)}%\n${result.faces_detected != null ? `Faces Detected: ${result.faces_detected}` : `Frames Analyzed: ${result.frames_analyzed}`}`;
    await navigator.clipboard.writeText(text);
    setCopied(true); addToast('📋 Results copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const exportPng = async () => {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const el = document.getElementById('share-card');
      if (!el) return;
      const canvas = await html2canvas(el, { backgroundColor: '#050508', scale: 2 });
      const a = document.createElement('a'); a.download = 'deepfake-result.png'; a.href = canvas.toDataURL(); a.click();
      addToast('🖼 Result exported as PNG!', 'success');
    } catch { addToast('Export requires: npm install html2canvas', 'error'); }
  };

  const handleCropResult = (blob: Blob) => {
    setCropMode(false);
    const f = new File([blob], 'cropped-region.jpg', { type: 'image/jpeg' });
    handleFile(f);
    addToast('✂️ Cropped region loaded — click Analyze!', 'info');
  };

  const isFake = result?.prediction === 'Fake';

  return (
    <>
      <Background />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {lightbox && preview && <Lightbox src={preview} onClose={() => setLightbox(false)} />}
      {showUrlDialog && <UrlDialog onClose={() => setShowUrlDialog(false)} onLoad={handleUrlLoad} />}
      {cropMode && preview && <CropOverlay src={preview} onCrop={handleCropResult} onCancel={() => setCropMode(false)} />}
      <PwaBanner />
      <Navbar theme={theme} toggleTheme={toggleTheme} compareMode={compareMode} setCompareMode={setCompareMode} />

      <main style={{ minHeight: '100vh', padding: '88px 16px 0 16px', maxWidth: compareMode ? 1100 : 700, margin: '0 auto', position: 'relative', zIndex: 1, transition: 'max-width 0.4s ease' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 36 }} className="animate-fade-slide-up">
          <div className="animate-float" style={{ display: 'inline-flex', marginBottom: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="animate-pulse-glow">
              <ShieldIcon style={{ width: 36, height: 36, color: '#06b6d4' }} />
            </div>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12, lineHeight: 1.1 }}>
            <span className="gradient-text">Deepfake</span>{' '}<span style={{ color: 'var(--text-primary)' }}>Detector</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 10px', lineHeight: 1.6 }}>
            Upload or paste an image/video to instantly detect AI manipulation using advanced machine learning.
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            💡 Press <kbd style={{ padding: '1px 5px', borderRadius: 4, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', fontFamily: 'monospace', fontSize: 11 }}>Ctrl+V</kbd> to paste · or <button onClick={() => setShowUrlDialog(true)} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: 12, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>load from URL</button>
          </p>
        </div>

        {/* Stats */}
        {!compareMode && <StatsStrip />}

        {/* ── COMPARE MODE ── */}
        {compareMode && (
          <div className="animate-fade-slide-up">
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Upload one image to each panel and analyze side-by-side</p>
            <p className="compare-mobile-note" style={{ textAlign: 'center', fontSize: 11, color: '#f59e0b', marginBottom: 16, display: 'none' }}>💡 Compare mode works best on a wider screen</p>
            <div className="compare-container">
              <ComparePanel label="Image A" addToast={addToast} />
              <ComparePanel label="Image B" addToast={addToast} />
            </div>
          </div>
        )}

        {/* ── NORMAL MODE ── */}
        {!compareMode && (
          <>
            {/* Drop Zone */}
            {!file && batchItems.length === 0 && (
              <div className={`dropzone animate-fade-slide-up ${isDragOver ? 'drag-over' : ''}`} onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onClick={() => inputRef.current?.click()} role="button" tabIndex={0} id="file-dropzone" aria-label="Upload media file">
                <input ref={inputRef} type="file" accept="image/*,video/*" multiple onChange={handleFileChange} style={{ display: 'none' }} id="file-upload-input" />
                <div style={{ pointerEvents: 'none' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px', background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UploadIcon style={{ width: 28, height: 28, color: 'var(--accent-cyan)' }} />
                  </div>
                  <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>{isDragOver ? '🎯 Drop it here!' : 'Drop your file here'}</p>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>or <span style={{ color: 'var(--accent-cyan)', fontWeight: 500 }}>click to browse</span> · or <span style={{ color: 'var(--accent-purple)', fontWeight: 500 }}>Ctrl+V to paste</span></p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Images (JPG, PNG, WEBP) · Videos (MP4, MOV) · <span style={{ color: 'var(--accent-cyan)' }}>Drop multiple for batch!</span></p>
                </div>
              </div>
            )}

            {/* Batch Mode */}
            {batchItems.length > 0 && (
              <div className="animate-fade-slide-up glass-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>📦 Batch Analysis — {batchItems.length} files</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="glow-button ripple-btn" onClick={handleBatchAnalyze} style={{ width: 'auto', padding: '8px 20px', fontSize: 13 }}>Analyze All</button>
                    <button onClick={clearFile} style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>Clear</button>
                  </div>
                </div>
                <BatchResultsGrid items={batchItems} />
              </div>
            )}

            {/* File Card */}
            {file && (
              <div className="glass-card animate-fade-slide-up" style={{ overflow: 'hidden' }}>
                {preview && (
                  <div style={{ position: 'relative', height: 280, overflow: 'hidden', borderRadius: '15px 15px 0 0', cursor: 'zoom-in' }} onClick={() => !loading && setLightbox(true)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,5,8,0.85) 0%, transparent 55%)' }} />
                    {!loading && <div style={{ position: 'absolute', top: 12, right: 12, padding: '4px 10px', borderRadius: 999, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>🔍 Click to zoom</div>}
                    {/* Crop region button */}
                    {!loading && !result && (
                      <button onClick={e => { e.stopPropagation(); setCropMode(true); }} style={{ position: 'absolute', bottom: 12, right: 12, padding: '5px 12px', borderRadius: 8, background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.4)', color: '#06b6d4', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        ✂️ Select Region
                      </button>
                    )}
                    {loading && <>
                      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(6,182,212,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.12) 1px, transparent 1px)', backgroundSize: '28px 28px', animation: 'scanPulse 1.4s ease-in-out infinite' }} />
                      <div style={{ position: 'absolute', left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.9) 30%, rgba(139,92,246,0.9) 70%, transparent 100%)', boxShadow: '0 0 20px rgba(6,182,212,0.8)', animation: 'scanLine 1.8s ease-in-out infinite' }} />
                      <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', borderRadius: 999, background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.4)', fontSize: 11, fontWeight: 600, color: '#06b6d4', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4', animation: 'scanPulse 0.8s ease-in-out infinite' }} />SCANNING
                      </div>
                    </>}
                  </div>
                )}
                {!preview && (
                  <div style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><VideoIcon style={{ width: 24, height: 24, color: 'var(--accent-purple)' }} /></div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: loading ? 8 : 2 }}>{file.name}</p>
                      {loading ? <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}><div style={{ height: '100%', width: '60%', borderRadius: 999, background: 'linear-gradient(90deg,#06b6d4,#8b5cf6,#06b6d4)', backgroundSize: '200% 100%', animation: 'gradientShift 1.5s ease infinite' }} /></div>
                        : <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(1)} MB · Video</p>}
                    </div>
                  </div>
                )}
                {loading && !preview && (
                  <div style={{ padding: '28px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', position: 'relative', width: 52, height: 52, marginBottom: 14 }}>
                      <div style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid rgba(6,182,212,0.15)', borderTopColor: 'var(--accent-cyan)' }} className="animate-spin-slow" />
                      <div style={{ position: 'absolute', inset: 7, borderRadius: '50%', border: '2px solid rgba(139,92,246,0.15)', borderBottomColor: 'var(--accent-purple)', animation: 'spin 2s linear infinite reverse' }} />
                    </div>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Scanning for deepfakes...</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Analyzing frames and AI artifacts</p>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
                      {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-cyan)', animation: `scanPulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
                    </div>
                  </div>
                )}
                {!loading && !result && (
                  <div style={{ padding: '18px 24px', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{file.type.startsWith('video/') ? 'Video' : 'Image'} · {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button id="clear-file-btn" className="ripple-btn" onClick={(e) => { ripple(e); clearFile(); }} style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>Remove</button>
                    <button id="analyze-btn" className="glow-button ripple-btn" onClick={(e) => { ripple(e); handleUpload(); }} style={{ width: 'auto', padding: '10px 26px', fontSize: 14 }}>Analyze</button>
                  </div>
                )}
                {error && !loading && (
                  <div style={{ margin: '0 20px 20px', padding: '14px 16px', borderRadius: 12, background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)' }}>
                    <p style={{ fontWeight: 600, color: '#f43f5e', marginBottom: 4, fontSize: 14 }}>⚠ Analysis Failed</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{error}</p>
                    <button onClick={clearFile} style={{ marginTop: 8, fontSize: 13, color: 'var(--accent-cyan)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Try again</button>
                  </div>
                )}
              </div>
            )}

            {/* Results — 3D flip-in */}
            {result && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="flip-in flip-in-1" style={{ padding: '32px 28px', borderRadius: 20, textAlign: 'center', background: isFake ? 'rgba(244,63,94,0.06)' : 'rgba(16,185,129,0.06)', border: `1px solid ${isFake ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)'}`, boxShadow: isFake ? '0 0 60px rgba(244,63,94,0.08)' : '0 0 60px rgba(16,185,129,0.08)' }}>
                  <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 12 }}>Verdict</p>
                  <p className={isFake ? 'verdict-fake' : 'verdict-real'} style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>{isFake ? '❌ FAKE' : '✅ REAL'}</p>
                  <p style={{ marginTop: 12, fontSize: 14, color: 'var(--text-secondary)' }}>{isFake ? 'This media shows signs of AI manipulation or deepfake generation.' : 'This media appears to be authentic with no deepfake indicators found.'}</p>
                </div>

                <div className="glass-card flip-in flip-in-2" style={{ padding: '24px' }}>
                  <div className="result-gauge-row" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                    <CircularGauge probability={result.fake_probability} isFake={isFake} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
                      <ConfidenceBar probability={result.fake_probability} isFake={isFake} />
                      <RiskMeter probability={result.fake_probability} />
                    </div>
                  </div>
                </div>

                <div className="flip-in flip-in-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                    <Tip text={result.frames_analyzed ? 'Number of video frames sampled for analysis' : 'Number of faces found in the image'}>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, cursor: 'help', borderBottom: '1px dashed rgba(255,255,255,0.1)', display: 'inline-block' }}>{result.frames_analyzed ? 'Frames Analyzed' : 'Faces Detected'} ⓘ</p>
                    </Tip>
                    <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}><AnimatedNumber value={result.frames_analyzed ?? result.faces_detected ?? 0} /></p>
                  </div>
                  <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                    <Tip text="Raw model output: probability this media is AI-generated (0–100%)">
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, cursor: 'help', borderBottom: '1px dashed rgba(255,255,255,0.1)', display: 'inline-block' }}>Fake Probability ⓘ</p>
                    </Tip>
                    <p style={{ fontSize: 32, fontWeight: 800, color: isFake ? 'var(--fake-color)' : 'var(--real-color)', lineHeight: 1 }}><AnimatedNumber value={parseFloat((result.fake_probability * 100).toFixed(1))} suffix="%" /></p>
                  </div>
                </div>

                {/* Share Card + Export */}
                <div className="flip-in flip-in-4">
                  {file && <ShareCard result={result} filename={file.name} onExport={exportPng} />}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button id="copy-results-btn" className="ripple-btn" onClick={(e) => { ripple(e); copyResults(); }} style={{ flex: 1, padding: '13px', borderRadius: 12, background: copied ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${copied ? 'rgba(6,182,212,0.35)' : 'rgba(255,255,255,0.08)'}`, color: copied ? 'var(--accent-cyan)' : 'var(--text-secondary)', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.3s' }}>
                    {copied ? '✓ Copied!' : '📋 Copy Results'}
                  </button>
                  <button id="analyze-another-btn" className="ripple-btn" onClick={(e) => { ripple(e); clearFile(); }} style={{ flex: 1, padding: '13px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    ← Analyze Another
                  </button>
                </div>
              </div>
            )}

            <HistoryPanel history={history} />
            {!result && !loading && batchItems.length === 0 && <HowItWorks />}
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
