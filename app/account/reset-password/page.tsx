'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from '../auth.module.css';

function getStrength(pw: string): 0 | 1 | 2 | 3 {
  if (pw.length < 8) return pw.length > 0 ? 1 : 0;
  let score = 0;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score >= 2 ? 3 : 2;
}

const SEG_CLASS: Record<number, string> = { 1: styles.weak, 2: styles.fair, 3: styles.strong };

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [focusPw, setFocusPw] = useState(false);
  const [focusConfirm, setFocusConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase sends the user back with a hash that contains the access token
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setSessionReady(true);
    });
  }, []);

  const strength = getStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (strength < 2) { setError('Please choose a stronger password.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setDone(true);
    setTimeout(() => router.push('/account'), 2500);
  };

  if (done) {
    return (
      <div className={styles.page}>
        <div className={styles.visual}>
          <div className={styles.visualOverlay} />
          <div className={styles.visualContent}>
            <p className={styles.visualLogo}>SKINVAULT</p>
          </div>
        </div>
        <div className={styles.formPanel}>
          <div className={styles.card}>
            <div className={styles.successRing}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className={styles.eyebrow}>Success</p>
            <h1 className={styles.heading}>Password updated</h1>
            <p className={styles.subText}>Your password has been reset. Redirecting you to your account…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.visual}>
        <div className={styles.visualOverlay} />
        <div className={styles.visualContent}>
          <p className={styles.visualLogo}>SKINVAULT</p>
          <div className={styles.visualCenter}>
            <p className={styles.eyebrow}>New Password</p>
            <h2 className={styles.visualHeading}>
              Almost<br /><em>there.</em>
            </h2>
          </div>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.card}>
          <form onSubmit={handleSubmit} noValidate>
            <p className={styles.eyebrow}>Reset password</p>
            <h1 className={styles.heading}>Create new password</h1>
            <p className={styles.subText}>Choose a strong password for your SkinVault account.</p>

            {error && <div className={styles.errorBanner} role="alert">{error}</div>}

            <div className={`${styles.field} ${focusPw ? styles.focused : ''}`}>
              <label className={`${styles.fieldLabel} ${focusPw || password.length > 0 ? styles.floated : ''}`}>
                New password
              </label>
              <div className={styles.inputWrap}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusPw(true)}
                  onBlur={() => setFocusPw(false)}
                  className={styles.input}
                  autoComplete="new-password"
                  required
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)} tabIndex={-1} aria-label="Toggle password">
                  {showPw
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              <span className={styles.fieldLine} aria-hidden="true" />
              {password.length > 0 && (
                <div className={styles.strengthBar}>
                  {[1, 2, 3].map(n => (
                    <div key={n} className={`${styles.strengthSeg} ${n <= strength ? SEG_CLASS[strength] : ''}`} />
                  ))}
                </div>
              )}
            </div>

            <div className={`${styles.field} ${focusConfirm ? styles.focused : ''}`}>
              <label className={`${styles.fieldLabel} ${focusConfirm || confirm.length > 0 ? styles.floated : ''}`}>
                Confirm password
              </label>
              <input
                type={showPw ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onFocus={() => setFocusConfirm(true)}
                onBlur={() => setFocusConfirm(false)}
                className={styles.input}
                autoComplete="new-password"
                required
              />
              <span className={styles.fieldLine} aria-hidden="true" />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Updating…' : 'Set new password'}
            </button>

            <p className={styles.switchText}>
              <Link href="/account/login" className={styles.switchLink}>Back to sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
