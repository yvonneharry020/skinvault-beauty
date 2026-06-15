'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './profile.module.css';

const SKIN_TYPES = ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'];

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [skinType, setSkinType] = useState('');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/account/login'); return; }
      setUserId(user.id);
      setEmail(user.email ?? '');
      const { data } = await supabase.from('profiles').select('full_name, phone, skin_type').eq('id', user.id).single();
      if (data) {
        setFullName(data.full_name ?? '');
        setPhone(data.phone ?? '');
        setSkinType(data.skin_type ?? '');
      }
      setLoading(false);
    });
  }, [router]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    const supabase = createClient();
    const { error: err } = await supabase.from('profiles').update({
      full_name: fullName.trim(),
      phone: phone.trim(),
      skin_type: skinType,
    }).eq('id', userId);
    setSaving(false);
    if (err) {
      showToast('error', 'Failed to save. Please try again.');
    } else {
      showToast('success', 'Profile updated successfully.');
    }
  };

  const initial = (fullName || email).charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.dots}><span /><span /><span /></div>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* ── Toast ── */}
      {toast && (
        <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>
          {toast.type === 'success' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── Dark Banner ── */}
      <div className={styles.banner}>
        <div className={styles.bannerInner}>
          <Link href="/account" className={styles.backLink}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Account
          </Link>
          <div className={styles.bannerContent}>
            <div className={styles.monogram}>{initial}</div>
            <div>
              <p className={styles.eyebrow}>Vault Member</p>
              <h1 className={styles.title}>{fullName ? fullName : <em>Your Profile</em>}</h1>
              <p className={styles.subtitle}>{email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form Area ── */}
      <div className={styles.body}>
        <div className={styles.bodyInner}>
          <form onSubmit={handleSave} className={styles.formGrid}>

            {/* Personal details */}
            <div className={styles.section}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionNum}>01</span>
                <div>
                  <p className={styles.sectionTitle}>Personal details</p>
                  <p className={styles.sectionSub}>Your name and contact information</p>
                </div>
              </div>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>Full name</label>
                  <input
                    className={styles.input}
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Email address</label>
                  <input className={`${styles.input} ${styles.inputDisabled}`} value={email} disabled readOnly />
                  <p className={styles.hint}>Email cannot be changed. Contact support if needed.</p>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Phone number</label>
                  <input
                    className={styles.input}
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className={styles.divider} />

            {/* Skin preferences */}
            <div className={styles.section}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionNum}>02</span>
                <div>
                  <p className={styles.sectionTitle}>Skin preferences</p>
                  <p className={styles.sectionSub}>We use this to personalise your vault</p>
                </div>
              </div>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>Skin type</label>
                  <div className={styles.skinGrid}>
                    {SKIN_TYPES.map(t => (
                      <button
                        key={t}
                        type="button"
                        className={`${styles.chip} ${skinType === t ? styles.chipActive : ''}`}
                        onClick={() => setSkinType(prev => prev === t ? '' : t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Save */}
            <div className={styles.saveRow}>
              <button type="submit" className={styles.saveBtn} disabled={saving}>
                {saving ? (
                  <>
                    <span className={styles.spinner} />
                    Saving…
                  </>
                ) : 'Save changes'}
              </button>
              <p className={styles.saveHint}>Changes are saved to your vault account</p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
