'use client';

import { useState, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import styles from '../auth.module.css';

const LiquidChrome = dynamic(
  () => import('@/components/LiquidChrome/LiquidChrome'),
  { ssr: false }
);

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

type FieldProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  rightSlot?: React.ReactNode;
};

function FloatField({ label, type = 'text', value, onChange, autoComplete, required, rightSlot }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const id = useId();
  const floated = focused || value.length > 0;

  return (
    <div className={[styles.field, focused ? styles.focused : ''].filter(Boolean).join(' ')}>
      <label htmlFor={id} className={[styles.fieldLabel, floated ? styles.floated : ''].filter(Boolean).join(' ')}>
        {label}
      </label>
      <div className={styles.inputWrap}>
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={styles.input}
          autoComplete={autoComplete}
          required={required}
        />
        {rightSlot}
      </div>
      <span className={styles.fieldLine} aria-hidden="true" />
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_KEY = 'sv_login_attempts';
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function getRateState(): { count: number; since: number } {
  try {
    const raw = sessionStorage.getItem(RATE_KEY);
    if (raw) return JSON.parse(raw) as { count: number; since: number };
  } catch { /* ignore */ }
  return { count: 0, since: Date.now() };
}

function bumpRate(): { blocked: boolean; remaining: number } {
  const state = getRateState();
  const now = Date.now();
  const fresh = now - state.since > WINDOW_MS ? { count: 0, since: now } : state;
  const next = { count: fresh.count + 1, since: fresh.since };
  try { sessionStorage.setItem(RATE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  const blocked = next.count > MAX_ATTEMPTS;
  return { blocked, remaining: Math.max(0, MAX_ATTEMPTS - next.count) };
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimEmail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimEmail)) { setError('Please enter a valid email address.'); return; }
    if (password.length < 1) { setError('Password is required.'); return; }

    const { blocked } = bumpRate();
    if (blocked) {
      setError('Too many sign-in attempts. Please wait 15 minutes and try again.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email: trimEmail, password });
    setLoading(false);
    if (err) { setError('Invalid email or password.'); return; }
    router.push('/account');
    router.refresh();
  };

  return (
    <div className={styles.page}>
      {/* ── Left panel ── */}
      <div className={styles.visual}>
        <div className={styles.visualBg}>
          <LiquidChrome
            baseColor={[0.12, 0.15, 0.18]}
            speed={0.35}
            amplitude={0.5}
            interactive={false}
          />
        </div>
        <div className={styles.visualOverlay} />
        <div className={styles.visualContent}>
          <div className={styles.visualLogo}>
            <div className={styles.visualLogoRing}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="7" strokeDasharray="2 2" opacity="0.6"/>
                <path d="M12 8v4l3 1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className={styles.visualLogoName}>SkinVault</span>
          </div>

          <div className={styles.visualCenter}>
            <div className={styles.visualAccent} />
            <h2 className={styles.visualHeading}>
              Your skin.<br />
              <em>Your vault.</em>
            </h2>
            <p className={styles.visualDesc}>
              Authentic Korean and global skincare,<br />
              delivered to your door in Nigeria.
            </p>
          </div>

          <div className={styles.visualStats}>
            <div className={styles.visualStat}>
              <span className={styles.visualStatNum}>63</span>
              <span className={styles.visualStatLabel}>Products</span>
            </div>
            <div className={styles.visualStatDiv} />
            <div className={styles.visualStat}>
              <span className={styles.visualStatNum}>34</span>
              <span className={styles.visualStatLabel}>Global brands</span>
            </div>
            <div className={styles.visualStatDiv} />
            <div className={styles.visualStat}>
              <span className={styles.visualStatNum}>100%</span>
              <span className={styles.visualStatLabel}>Authentic</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className={styles.formPanel}>
        <div className={styles.card}>
          <p className={styles.eyebrow}>Welcome back</p>
          <h1 className={styles.title}>Sign in</h1>
          <p className={styles.sub}>Access your orders, wishlist &amp; skincare routine.</p>

          <form onSubmit={handleLogin} className={styles.form} noValidate>
            <FloatField
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              required
            />

            <FloatField
              label="Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              required
              rightSlot={
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />

            <div className={styles.forgotRow}>
              <Link href="/account/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
            </div>

            {error && <p className={styles.error} role="alert">{error}</p>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading && <span className={styles.spinner} />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className={styles.switchText}>
            New to SkinVault?{' '}
            <Link href="/account/register" className={styles.switchLink}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
