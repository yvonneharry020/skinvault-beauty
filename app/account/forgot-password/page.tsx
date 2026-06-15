'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from '../auth.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!EMAIL_RE.test(email.trim())) { setError('Please enter a valid email address.'); return; }
    setLoading(true);
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.skinvaultbeauty.com';
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${siteUrl}/account/reset-password`,
    });
    setLoading(false);
    if (err) { setError('Something went wrong. Please try again.'); return; }
    setSent(true);
  };

  const floated = focused || email.length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.visual}>
        <div className={styles.visualOverlay} />
        <div className={styles.visualContent}>
          <p className={styles.visualLogo}>SKINVAULT</p>
          <div className={styles.visualCenter}>
            <p className={styles.eyebrow}>Account Recovery</p>
            <h2 className={styles.visualHeading}>
              Reset your<br /><em>password.</em>
            </h2>
            <p className={styles.visualSub}>
              Enter your email and we&apos;ll send a secure link to set a new password.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.card}>
          {sent ? (
            <>
              <div className={styles.successRing}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <p className={styles.eyebrow}>Email sent</p>
              <h1 className={styles.heading}>Check your inbox</h1>
              <p className={styles.subText}>
                A password reset link has been sent to <strong>{email}</strong>. Check your spam folder if it doesn&apos;t arrive within a few minutes.
              </p>
              <Link href="/account/login" className={styles.submitBtn} style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '1.5rem' }}>
                Back to Sign In
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <p className={styles.eyebrow}>Forgot password</p>
              <h1 className={styles.heading}>Reset your password</h1>
              <p className={styles.subText}>
                Enter the email address associated with your SkinVault account.
              </p>

              {error && <div className={styles.errorBanner} role="alert">{error}</div>}

              <div className={`${styles.field} ${focused ? styles.focused : ''}`}>
                <label className={`${styles.fieldLabel} ${floated ? styles.floated : ''}`}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  className={styles.input}
                  autoComplete="email"
                  required
                />
                <span className={styles.fieldLine} aria-hidden="true" />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>

              <p className={styles.switchText}>
                Remembered it?{' '}
                <Link href="/account/login" className={styles.switchLink}>Sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
