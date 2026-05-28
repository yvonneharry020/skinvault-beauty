'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import styles from './account.module.css';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ full_name?: string; email?: string; skin_type?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/account/login'); return; }
      setUser(user);
      const { data } = await supabase.from('profiles').select('full_name, email, skin_type').eq('id', user.id).single();
      setProfile(data);
      setLoading(false);
    });
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.loading}>Loading your account...</div>
    </div>
  );

  const name = profile?.full_name || user?.email?.split('@')[0] || 'There';

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>MY ACCOUNT</span>
            <h1 className={styles.title}>Welcome, {name}</h1>
            <p className={styles.email}>{user?.email}</p>
          </div>
          <button className={styles.signOutBtn} onClick={handleSignOut}>Sign Out</button>
        </div>

        {/* Dashboard grid */}
        <div className={styles.grid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Orders</h2>
            <p className={styles.cardSub}>Track and manage your skincare orders</p>
            <div className={styles.emptyState}>
              <p>No orders yet.</p>
              <Link href="/shop" className={styles.cardAction}>Start Shopping →</Link>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Wishlist</h2>
            <p className={styles.cardSub}>Products you&apos;ve saved for later</p>
            <div className={styles.emptyState}>
              <p>Your wishlist is empty.</p>
              <Link href="/shop" className={styles.cardAction}>Browse Products →</Link>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Profile</h2>
            <p className={styles.cardSub}>Your personal information</p>
            <div className={styles.profileDetails}>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>Name</span>
                <span>{profile?.full_name || 'Not set'}</span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>Email</span>
                <span>{user?.email}</span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>Skin Type</span>
                <span>{profile?.skin_type || 'Not set'}</span>
              </div>
            </div>
            <button className={styles.cardAction} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
              Edit Profile →
            </button>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Addresses</h2>
            <p className={styles.cardSub}>Manage your delivery addresses</p>
            <div className={styles.emptyState}>
              <p>No addresses saved.</p>
              <button className={styles.cardAction} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                Add Address →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
