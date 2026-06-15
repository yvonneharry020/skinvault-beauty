'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useWishlist } from '@/contexts/WishlistContext';
import type { User } from '@supabase/supabase-js';
import styles from './account.module.css';

type Order = { id: string; status: string; total: number; created_at: string };

export default function AccountPage() {
  const router = useRouter();
  const { count: wishlistCount, items: wishlistItems } = useWishlist();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ full_name?: string; skin_type?: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/account/login'); return; }
      setUser(user);
      const [{ data: profileData }, { data: orderData }] = await Promise.all([
        supabase.from('profiles').select('full_name, skin_type').eq('id', user.id).single(),
        supabase.from('orders').select('id, status, total, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      ]);
      setProfile(profileData);
      setOrders((orderData as Order[]) ?? []);
      setLoading(false);
    });
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loadingDots}>
          <span /><span /><span />
        </div>
      </div>
    );
  }

  const name = profile?.full_name || user?.email?.split('@')[0] || 'There';
  const initial = name.charAt(0).toUpperCase();

  const STATUS_COLOUR: Record<string, string> = {
    paid: '#62976e', processing: '#c8a882', shipped: '#6a8ecb', delivered: '#62976e',
    pending: '#9ba8b4', cancelled: '#a03535', refunded: '#9ba8b4',
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatNaira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

  return (
    <div className={styles.page}>
      {/* ── HERO BANNER ── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <div className={styles.monogram}>{initial}</div>
            <div>
              <p className={styles.heroEyebrow}>VAULT MEMBER</p>
              <h1 className={styles.heroName}>
                {profile?.full_name ? profile.full_name : <em>Welcome back</em>}
              </h1>
              <p className={styles.heroEmail}>{user?.email}</p>
            </div>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>{orders.length > 0 ? orders.length : '0'}</span>
              <span className={styles.heroStatLabel}>Orders</span>
            </div>
            <div className={styles.heroStatDiv} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>{wishlistCount}</span>
              <span className={styles.heroStatLabel}>Wishlist</span>
            </div>
            {profile?.skin_type && (
              <>
                <div className={styles.heroStatDiv} />
                <div className={styles.heroStat}>
                  <span className={styles.heroStatNum}>{profile.skin_type}</span>
                  <span className={styles.heroStatLabel}>Skin type</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className={styles.content}>
        <div className={styles.contentInner}>

          {/* ── Nav row ── */}
          <div className={styles.navRow}>
            <Link href="/shop" className={styles.navPill}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              Shop
            </Link>
            <Link href="/account/orders" className={styles.navPill}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              Orders
            </Link>
            <Link href="/account/wishlist" className={styles.navPill}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              Wishlist
            </Link>
            <Link href="/account/profile" className={styles.navPill}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Profile
            </Link>
            <Link href="/account/addresses" className={styles.navPill}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Addresses
            </Link>
            <button className={styles.signOutPill} onClick={handleSignOut}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign out
            </button>
          </div>

          {/* ── Card grid ── */}
          <div className={styles.grid}>

            {/* Orders card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                </div>
                <div>
                  <p className={styles.cardLabel}>Orders</p>
                  <p className={styles.cardSub}>Your purchase history</p>
                </div>
                <Link href="/account/orders" className={styles.cardArrow}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className={styles.cardEmpty}>
                  <p>No orders yet.</p>
                  <Link href="/shop" className={styles.cardEmptyLink}>Start shopping →</Link>
                </div>
              ) : (
                <div className={styles.orderList}>
                  {orders.map(o => (
                    <div key={o.id} className={styles.orderRow}>
                      <div>
                        <p className={styles.orderRef}>#{o.id.slice(0, 8).toUpperCase()}</p>
                        <p className={styles.orderDate}>{formatDate(o.created_at)}</p>
                      </div>
                      <div className={styles.orderRight}>
                        <p className={styles.orderTotal}>{formatNaira(o.total)}</p>
                        <span className={styles.orderStatus} style={{ color: STATUS_COLOUR[o.status] ?? '#9ba8b4' }}>
                          {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <Link href="/account/orders" className={styles.viewAllLink}>View all orders →</Link>
                </div>
              )}
            </div>

            {/* Wishlist card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </div>
                <div>
                  <p className={styles.cardLabel}>Wishlist</p>
                  <p className={styles.cardSub}>{wishlistCount} saved item{wishlistCount !== 1 ? 's' : ''}</p>
                </div>
                <Link href="/account/wishlist" className={styles.cardArrow}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>
              </div>

              {wishlistCount === 0 ? (
                <div className={styles.cardEmpty}>
                  <p>Nothing saved yet.</p>
                  <Link href="/shop" className={styles.cardEmptyLink}>Browse products →</Link>
                </div>
              ) : (
                <div className={styles.wishlistPreviews}>
                  {wishlistItems.slice(0, 3).map(item => (
                    <Link key={item.id} href={`/products/${item.slug}`} className={styles.wishlistThumb}>
                      <span className={styles.wishlistThumbInner} />
                    </Link>
                  ))}
                  {wishlistCount > 3 && <span className={styles.wishlistMore}>+{wishlistCount - 3}</span>}
                  <Link href="/account/wishlist" className={styles.viewAllLink} style={{ marginTop: '1rem' }}>View wishlist →</Link>
                </div>
              )}
            </div>

            {/* Profile card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                  <p className={styles.cardLabel}>Profile</p>
                  <p className={styles.cardSub}>Your personal details</p>
                </div>
                <Link href="/account/profile" className={styles.cardArrow}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>
              </div>
              <div className={styles.profileRows}>
                <div className={styles.profileRow}>
                  <span className={styles.profileKey}>Name</span>
                  <span className={styles.profileVal}>{profile?.full_name || <em className={styles.notSet}>Not set</em>}</span>
                </div>
                <div className={styles.profileRow}>
                  <span className={styles.profileKey}>Email</span>
                  <span className={styles.profileVal}>{user?.email}</span>
                </div>
                <div className={styles.profileRow}>
                  <span className={styles.profileKey}>Skin type</span>
                  <span className={styles.profileVal}>{profile?.skin_type || <em className={styles.notSet}>Not set</em>}</span>
                </div>
              </div>
              <Link href="/account/profile" className={styles.cardCta}>Edit profile →</Link>
            </div>

            {/* Addresses card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <p className={styles.cardLabel}>Addresses</p>
                  <p className={styles.cardSub}>Delivery locations</p>
                </div>
                <Link href="/account/addresses" className={styles.cardArrow}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>
              </div>
              <div className={styles.cardEmpty}>
                <p>Manage your saved delivery addresses.</p>
                <Link href="/account/addresses" className={styles.cardEmptyLink}>Manage addresses →</Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
