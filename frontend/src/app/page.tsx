'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

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
      {[
        { top: '4%', delay: '0s', dur: '1.8s', angle: -35 }, { top: '15%', delay: '3.2s', dur: '2.2s', angle: -25 },
        { top: '7%', delay: '6.4s', dur: '1.6s', angle: -42 }, { top: '30%', delay: '1.6s', dur: '2.0s', angle: -28 },
        { top: '52%', delay: '8.5s', dur: '1.9s', angle: -18 }, { top: '22%', delay: '4.8s', dur: '1.7s', angle: -50 },
        { top: '63%', delay: '2.2s', dur: '2.3s', angle: -14 }, { top: '10%', delay: '11s', dur: '1.5s', angle: -38 },
      ].map((s, i) => (
        <div key={i} style={{ position: 'absolute', top: s.top, left: 0, right: 0, height: 2, transform: `rotate(${s.angle}deg)`, transformOrigin: '0% 50%', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 350, height: 2, background: 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.4) 25%, rgba(139,92,246,0.7) 60%, rgba(255,255,255,1) 88%, transparent 100%)', borderRadius: 999, boxShadow: '0 0 4px 1px rgba(255,255,255,0.95), 0 0 10px 3px rgba(6,182,212,1), 0 0 22px 5px rgba(139,92,246,0.6)', animation: `shootingStar ${s.dur} ${s.delay} ease-in infinite`, opacity: 0 }} />
        </div>
      ))}
      <ParticleField />
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface AnalysisResult { prediction: 'Real' | 'Fake'; fake_probability: number; faces_detected?: number; frames_analyzed?: number; }
interface HistoryItem { id: number; filename: string; result: AnalysisResult; timestamp: Date; preview?: string; }
interface Toast { id: number; message: string; type: 'success' | 'error' | 'info'; }

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
function Navbar() {
  return (
    <nav id="main-navbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 60, background: 'rgba(3,3,10,0.08)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(139,92,246,0.3))', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldIcon style={{ width: 18, height: 18, color: '#06b6d4' }} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Deepfake<span className="gradient-text">Detector</span></span>
      </div>
      <HealthDot />
      <div className="nav-badge" style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', fontSize: 11, fontWeight: 600, color: '#a78bfa' }}>⚡ EfficientNet B0</div>
      <a href="https://github.com" target="_blank" rel="noopener noreferrer" id="github-link" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
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
  const displayPct = isFake ? probability : 1 - probability;
  const color = isFake ? '#f43f5e' : '#10b981';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      <Tip text={isFake ? 'Probability this media is AI-generated' : 'Probability this media is authentic'}>
        <div style={{ position: 'relative', width: 130, height: 130 }}>
          <svg width="130" height="130" viewBox="0 0 130 130">
            <defs><filter id="gauge-glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
            <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <circle cx="65" cy="65" r={radius} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - displayPct)} transform="rotate(-90 65 65)" filter="url(#gauge-glow)" style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
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
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [copied, setCopied] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); };
  const clearFile = () => { setFile(null); setPreview(null); setResult(null); setError(null); };

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
      setResult(data);
      setHistory(prev => [{ id: Date.now(), filename: file.name, result: data, timestamp: new Date(), preview: preview ?? undefined }, ...prev].slice(0, 5));
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

  const isFake = result?.prediction === 'Fake';

  return (
    <>
      <Background />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {lightbox && preview && <Lightbox src={preview} onClose={() => setLightbox(false)} />}
      {showUrlDialog && <UrlDialog onClose={() => setShowUrlDialog(false)} onLoad={handleUrlLoad} />}
      <Navbar />

      <main style={{ minHeight: '100vh', padding: '88px 16px 0 16px', maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}>

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
        <StatsStrip />

        {/* Drop Zone */}
        {!file && (
          <div className={`dropzone animate-fade-slide-up ${isDragOver ? 'drag-over' : ''}`} onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onClick={() => inputRef.current?.click()} role="button" tabIndex={0} id="file-dropzone" aria-label="Upload media file">
            <input ref={inputRef} type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} id="file-upload-input" />
            <div style={{ pointerEvents: 'none' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px', background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UploadIcon style={{ width: 28, height: 28, color: 'var(--accent-cyan)' }} />
              </div>
              <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>{isDragOver ? '🎯 Drop it here!' : 'Drop your file here'}</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>or <span style={{ color: 'var(--accent-cyan)', fontWeight: 500 }}>click to browse</span> · or <span style={{ color: 'var(--accent-purple)', fontWeight: 500 }}>Ctrl+V to paste</span></p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Images (JPG, PNG, WEBP) · Videos (MP4, MOV)</p>
            </div>
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

        {/* Results */}
        {result && !loading && (
          <div className="animate-fade-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: '32px 28px', borderRadius: 20, textAlign: 'center', background: isFake ? 'rgba(244,63,94,0.06)' : 'rgba(16,185,129,0.06)', border: `1px solid ${isFake ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)'}`, boxShadow: isFake ? '0 0 60px rgba(244,63,94,0.08)' : '0 0 60px rgba(16,185,129,0.08)' }}>
              <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 12 }}>Verdict</p>
              <p className={isFake ? 'verdict-fake' : 'verdict-real'} style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>{isFake ? '❌ FAKE' : '✅ REAL'}</p>
              <p style={{ marginTop: 12, fontSize: 14, color: 'var(--text-secondary)' }}>{isFake ? 'This media shows signs of AI manipulation or deepfake generation.' : 'This media appears to be authentic with no deepfake indicators found.'}</p>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <div className="result-gauge-row" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <CircularGauge probability={result.fake_probability} isFake={isFake} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
                  <ConfidenceBar probability={result.fake_probability} isFake={isFake} />
                  <RiskMeter probability={result.fake_probability} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
            {file && <ShareCard result={result} filename={file.name} onExport={exportPng} />}

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
        {!result && !loading && <HowItWorks />}
      </main>

      <Footer />
    </>
  );
}
