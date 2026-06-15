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

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
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

type StrengthResult = { score: 0 | 1 | 2 | 3; hint: string };

function getStrength(pw: string): StrengthResult {
  if (pw.length === 0) return { score: 0, hint: '' };
  if (pw.length < 8) return { score: 1, hint: 'Too short' };
  const checks = [/[A-Z]/, /[a-z]/, /\d/, /[^a-zA-Z0-9]/].filter(r => r.test(pw)).length;
  if (checks <= 2) return { score: 2, hint: 'Fair' };
  return { score: 3, hint: 'Strong' };
}

const SEG_CLASS: Record<number, string> = { 1: styles.weak, 2: styles.fair, 3: styles.strong };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const strength = getStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimName = fullName.trim();
    const trimEmail = email.trim().toLowerCase();

    if (trimName.length < 2) { setError('Please enter your full name.'); return; }
    if (!EMAIL_RE.test(trimEmail)) { setError('Please enter a valid email address.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (strength.score < 2) { setError('Password is too weak — try mixing letters, numbers, and symbols.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email: trimEmail,
      password,
      options: { data: { full_name: trimName } },
    });
    setLoading(false);
    if (err) {
      if (err.message.toLowerCase().includes('already registered')) {
        setError('An account with this email already exists. Try signing in instead.');
      } else {
        setError(err.message);
      }
      return;
    }
    setSuccess(true);
  };

  const leftPanel = (
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
            Great skin<br />
            <em>starts here.</em>
          </h2>
          <p className={styles.visualDesc}>
            Join thousands of Nigerians who trust<br />
            SkinVault for authentic skincare.
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
  );

  if (success) {
    return (
      <div className={styles.page}>
        {leftPanel}
        <div className={styles.formPanel}>
          <div className={styles.card}>
            <div className={styles.successRing}>
              <CheckIcon />
            </div>
            <p className={styles.eyebrow}>You&apos;re in</p>
            <h1 className={styles.title}>Check your email</h1>
            <p className={styles.sub}>
              A confirmation link is on its way to <strong>{email}</strong>. Click it to activate
              your account, then sign in.
            </p>
            <Link href="/account/login" className={styles.submitBtn}>
              Go to sign in
            </Link>
            <p className={styles.switchText}>
              Already confirmed?{' '}
              <Link href="/account/login" className={styles.switchLink}>Sign in now</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {leftPanel}

      <div className={styles.formPanel}>
        <div className={styles.card}>
          <p className={styles.eyebrow}>Join SkinVault</p>
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.sub}>Authentic skincare. Delivered to your door.</p>

          <form onSubmit={handleRegister} className={styles.form} noValidate>
            <FloatField
              label="Full name"
              type="text"
              value={fullName}
              onChange={setFullName}
              autoComplete="name"
              required
            />

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
              autoComplete="new-password"
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

            {password.length > 0 && (
              <div className={styles.strengthWrap}>
                <div className={styles.strengthBar}>
                  {[1, 2, 3].map(seg => (
                    <span
                      key={seg}
                      className={[
                        styles.strengthSeg,
                        strength.score >= seg ? SEG_CLASS[strength.score] : '',
                      ].filter(Boolean).join(' ')}
                    />
                  ))}
                </div>
                {strength.hint && (
                  <span className={styles.strengthHint}>{strength.hint}</span>
                )}
              </div>
            )}

            <FloatField
              label="Confirm password"
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
              required
              rightSlot={
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />

            {error && <p className={styles.error} role="alert">{error}</p>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading && <span className={styles.spinner} />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className={styles.switchText}>
            Already have an account?{' '}
            <Link href="/account/login" className={styles.switchLink}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
