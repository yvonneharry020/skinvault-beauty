'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './addresses.module.css';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
];

interface Address {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  country: string;
  is_default: boolean;
}

const BLANK = { label: 'Home', line1: '', line2: '', city: '', state: 'Lagos', country: 'NG' };

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
  const [toast, setToast] = useState('');

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

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function openAdd() { setForm({ ...BLANK }); setEditId(null); setShowForm(true); setError(''); }
  function openEdit(a: Address) {
    setForm({ label: a.label, line1: a.line1, line2: a.line2 ?? '', city: a.city, state: a.state ?? 'Lagos', country: a.country });
    setEditId(a.id); setShowForm(true); setError('');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.line1.trim() || !form.city.trim()) { setError('Street address and city are required.'); return; }
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
    showToast(editId ? 'Address updated.' : 'Address added.');
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from('addresses').delete().eq('id', id);
    setAddresses(prev => prev.filter(a => a.id !== id));
    showToast('Address removed.');
  }

  async function setDefault(id: string) {
    const supabase = createClient();
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    await loadAddresses(userId);
    showToast('Default address updated.');
  }

  if (loading) return (
    <div className={styles.loadingPage}>
      <div className={styles.dots}><span /><span /><span /></div>
    </div>
  );

  return (
    <div className={styles.page}>

      {/* ── Toast ── */}
      {toast && (
        <div className={styles.toast}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {toast}
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
            <div>
              <p className={styles.eyebrow}>Vault Member</p>
              <h1 className={styles.title}><em>Delivery</em> Addresses</h1>
              <p className={styles.subtitle}>
                {addresses.length === 0 ? 'No addresses saved yet' : `${addresses.length} address${addresses.length !== 1 ? 'es' : ''} on file`}
              </p>
            </div>
            {!showForm && (
              <button className={styles.addBtnBanner} onClick={openAdd}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add address
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>
        <div className={styles.bodyInner}>

          {/* Add / Edit Form */}
          {showForm && (
            <form className={styles.formCard} onSubmit={handleSave}>
              <div className={styles.formHeader}>
                <div>
                  <p className={styles.formEyebrow}>{editId ? 'Edit address' : 'New address'}</p>
                  <h2 className={styles.formTitle}>Delivery details</h2>
                </div>
                <button type="button" className={styles.closeBtn} onClick={() => setShowForm(false)} aria-label="Close form">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {error && <div className={styles.errorBanner}>{error}</div>}

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.label}>Label</label>
                  <select className={styles.select} value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}>
                    <option>Home</option><option>Work</option><option>Other</option>
                  </select>
                </div>
              </div>

              <div className={`${styles.formRow} ${styles.formRowFull}`}>
                <div className={styles.formField}>
                  <label className={styles.label}>Street address <span className={styles.required}>*</span></label>
                  <input className={styles.input} value={form.line1} onChange={e => setForm(f => ({ ...f, line1: e.target.value }))} placeholder="House number, street name" required />
                </div>
              </div>

              <div className={`${styles.formRow} ${styles.formRowFull}`}>
                <div className={styles.formField}>
                  <label className={styles.label}>Apartment / Estate / Landmark <span className={styles.optional}>(optional)</span></label>
                  <input className={styles.input} value={form.line2 ?? ''} onChange={e => setForm(f => ({ ...f, line2: e.target.value }))} placeholder="e.g. Lekki Phase 1, behind..." />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.label}>City / Area <span className={styles.required}>*</span></label>
                  <input className={styles.input} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="e.g. Ikeja" required />
                </div>
                <div className={styles.formField}>
                  <label className={styles.label}>State</label>
                  <select className={styles.select} value={form.state ?? ''} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}>
                    {NIGERIAN_STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? 'Saving…' : (editId ? 'Update address' : 'Save address')}
                </button>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          )}

          {/* Empty State */}
          {addresses.length === 0 && !showForm && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h2 className={styles.emptyTitle}>No addresses saved</h2>
              <p className={styles.emptySub}>Add a delivery address to make checkout faster and easier.</p>
              <button className={styles.emptyBtn} onClick={openAdd}>Add your first address</button>
            </div>
          )}

          {/* Address Cards */}
          {addresses.length > 0 && (
            <div className={styles.list}>
              {addresses.map(a => (
                <div key={a.id} className={`${styles.card} ${a.is_default ? styles.cardDefault : ''}`}>
                  <div className={styles.cardLeft}>
                    <div className={styles.cardLabelRow}>
                      <span className={styles.labelTag}>{a.label.toUpperCase()}</span>
                      {a.is_default && (
                        <span className={styles.defaultBadge}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          Default
                        </span>
                      )}
                    </div>
                    <p className={styles.addressLine1}>{a.line1}</p>
                    {a.line2 && <p className={styles.addressLine2}>{a.line2}</p>}
                    <p className={styles.addressLine2}>{a.city}{a.state ? `, ${a.state}` : ''}</p>
                  </div>
                  <div className={styles.cardActions}>
                    <button className={styles.actionBtn} onClick={() => openEdit(a)}>Edit</button>
                    {!a.is_default && (
                      <button className={styles.actionBtn} onClick={() => setDefault(a.id)}>Set default</button>
                    )}
                    <button className={styles.deleteBtn} onClick={() => handleDelete(a.id)}>Remove</button>
                  </div>
                </div>
              ))}
              {!showForm && (
                <button className={styles.addMoreBtn} onClick={openAdd}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add another address
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
