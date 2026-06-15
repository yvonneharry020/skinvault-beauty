'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './addresses.module.css';

interface Address {
  id: string;
  label: string;
  full_name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  country: string;
  phone: string | null;
  is_default: boolean;
}

const BLANK: Omit<Address, 'id' | 'is_default'> = { label: 'Home', full_name: '', line1: '', line2: '', city: '', state: '', country: 'NG', phone: '' };

export default function AddressesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/account/login'); return; }
      setUserId(user.id);
      await loadAddresses(user.id);
      setLoading(false);
    });
  }, [router]);

  async function loadAddresses(uid: string) {
    const supabase = createClient();
    const { data } = await supabase.from('addresses').select('*').eq('user_id', uid).order('is_default', { ascending: false });
    setAddresses((data as Address[]) ?? []);
  }

  function openAdd() { setForm({ ...BLANK }); setEditId(null); setShowForm(true); setError(''); }
  function openEdit(a: Address) { setForm({ label: a.label, full_name: a.full_name, line1: a.line1, line2: a.line2 ?? '', city: a.city, state: a.state ?? '', country: a.country, phone: a.phone ?? '' }); setEditId(a.id); setShowForm(true); setError(''); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name.trim() || !form.line1.trim() || !form.city.trim()) { setError('Name, address, and city are required.'); return; }
    setSaving(true); setError('');
    const supabase = createClient();
    const payload = { ...form, user_id: userId };
    const { error: err } = editId
      ? await supabase.from('addresses').update(payload).eq('id', editId)
      : await supabase.from('addresses').insert(payload);
    setSaving(false);
    if (err) { setError('Failed to save. Please try again.'); return; }
    await loadAddresses(userId);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from('addresses').delete().eq('id', id);
    setAddresses(prev => prev.filter(a => a.id !== id));
  }

  async function setDefault(id: string) {
    const supabase = createClient();
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    await loadAddresses(userId);
  }

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
          <div className={styles.headerRow}>
            <h1 className={styles.title}>Addresses</h1>
            {!showForm && (
              <button className={styles.addBtn} onClick={openAdd}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add address
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <form className={styles.formCard} onSubmit={handleSave}>
            <h2 className={styles.formTitle}>{editId ? 'Edit address' : 'New address'}</h2>
            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>Label</label>
                <select className={styles.select} value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}>
                  <option>Home</option><option>Work</option><option>Other</option>
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Full name</label>
                <input className={styles.input} value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label className={styles.label}>Street address</label>
                <input className={styles.input} value={form.line1} onChange={e => setForm(f => ({ ...f, line1: e.target.value }))} required />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label className={styles.label}>Apartment / Estate (optional)</label>
                <input className={styles.input} value={form.line2 ?? ''} onChange={e => setForm(f => ({ ...f, line2: e.target.value }))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>City / Area</label>
                <input className={styles.input} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>State</label>
                <input className={styles.input} value={form.state ?? ''} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Phone number</label>
                <input className={styles.input} type="tel" value={form.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? 'Saving…' : 'Save address'}</button>
              <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        {addresses.length === 0 && !showForm ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <p className={styles.emptyTitle}>No addresses saved</p>
            <p className={styles.emptySub}>Add a delivery address to speed up checkout.</p>
            <button className={styles.addBtnLg} onClick={openAdd}>Add your first address</button>
          </div>
        ) : (
          <div className={styles.list}>
            {addresses.map(a => (
              <div key={a.id} className={`${styles.addressCard} ${a.is_default ? styles.defaultCard : ''}`}>
                <div className={styles.addressTop}>
                  <div className={styles.addressLabel}>
                    <span className={styles.labelTag}>{a.label}</span>
                    {a.is_default && <span className={styles.defaultTag}>Default</span>}
                  </div>
                  <div className={styles.addressActions}>
                    <button className={styles.actionBtn} onClick={() => openEdit(a)}>Edit</button>
                    {!a.is_default && <button className={styles.actionBtn} onClick={() => setDefault(a.id)}>Set default</button>}
                    <button className={styles.deleteBtn} onClick={() => handleDelete(a.id)}>Remove</button>
                  </div>
                </div>
                <p className={styles.addressName}>{a.full_name}</p>
                <p className={styles.addressLine}>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                <p className={styles.addressLine}>{a.city}{a.state ? `, ${a.state}` : ''}</p>
                {a.phone && <p className={styles.addressPhone}>{a.phone}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
