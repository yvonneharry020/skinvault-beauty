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
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const supabase = createClient();
    const { error: err } = await supabase.from('profiles').update({
      full_name: fullName.trim(),
      phone: phone.trim(),
      skin_type: skinType,
    }).eq('id', userId);
    setSaving(false);
    if (err) { setError('Failed to save. Please try again.'); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className={styles.loading}>Loading…</div>;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <Link href="/account" className={styles.backLink}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            My Account
          </Link>
          <h1 className={styles.title}>Edit Profile</h1>
        </div>

        <div className={styles.formCard}>
          <form onSubmit={handleSave}>
            {error && <div className={styles.errorBanner}>{error}</div>}
            {saved && <div className={styles.successBanner}>Profile saved successfully.</div>}

            <div className={styles.field}>
              <label className={styles.label}>Full name</label>
              <input className={styles.input} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email address</label>
              <input className={styles.input} value={email} disabled readOnly />
              <p className={styles.hint}>Email cannot be changed here. Contact support if needed.</p>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Phone number</label>
              <input className={styles.input} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 800 000 0000" />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Skin type</label>
              <div className={styles.skinGrid}>
                {SKIN_TYPES.map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`${styles.skinChip} ${skinType === t ? styles.skinChipActive : ''}`}
                    onClick={() => setSkinType(prev => prev === t ? '' : t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
