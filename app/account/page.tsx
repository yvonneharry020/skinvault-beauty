'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useWishlist } from '@/contexts/WishlistContext';
import { cloudinaryThumb } from '@/lib/cloudinary';
import type { User } from '@supabase/supabase-js';
import styles from './account.module.css';

type Order = { id: string; status: string; total: number; created_at: string; payment_reference: string | null };

const STATUS_COLOR: Record<string, string> = {
  paid: '#62976e', processing: '#c8a882', shipped: '#6a8ecb',
  delivered: '#62976e', pending: '#9ba8b4', cancelled: '#c06060', refunded: '#9ba8b4',
};

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const formatNaira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

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
        supabase.from('orders').select('id, status, total, created_at, payment_reference').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
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
              <span className={styles.heroStatNum}>{orders.length}</span>
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
                  <span className={styles.heroStatSkin}>{profile.skin_type}</span>
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

          {/* Quick nav */}
          <div className={styles.navRow}>
            <Link href="/shop" className={styles.navPill}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              Shop
            </Link>
            <Link href="/account/orders" className={styles.navPill}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              Orders
            </Link>
            <Link href="/account/wishlist" className={styles.navPill}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              Wishlist
            </Link>
            <Link href="/account/profile" className={styles.navPill}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Profile
            </Link>
            <Link href="/account/addresses" className={styles.navPill}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Addresses
            </Link>
            <button className={styles.signOutPill} onClick={handleSignOut}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign out
            </button>
          </div>

          {/* ══ 4-CARD GRID ══ */}
          <div className={styles.grid}>

            {/* ── ORDERS CARD (dark) ── */}
            <Link href="/account/orders" className={[styles.card, styles.cardOrders].join(' ')}>
              <div className={styles.cardDecorNum}>
                {orders.length}
              </div>
              <div className={styles.cardTop}>
                <span className={styles.cardEyebrow}>Order history</span>
                <svg className={styles.cardChevron} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <h2 className={styles.cardTitle}>Your<br /><em>Orders</em></h2>
              <div className={styles.cardDivider} />
              {orders.length === 0 ? (
                <p className={styles.cardNote}>No orders placed yet. Browse the vault to start your skincare journey.</p>
              ) : (
                <div className={styles.orderMini}>
                  {orders.slice(0, 2).map(o => (
                    <div key={o.id} className={styles.orderMiniRow}>
                      <span className={styles.orderMiniRef}>#{o.payment_reference ?? o.id.slice(0, 8).toUpperCase()}</span>
                      <span className={styles.orderMiniStatus} style={{ color: STATUS_COLOR[o.status] ?? '#9ba8b4' }}>
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                      <span className={styles.orderMiniTotal}>{formatNaira(o.total)}</span>
                    </div>
                  ))}
                </div>
              )}
              <span className={styles.cardCta}>
                {orders.length > 0 ? 'View all orders' : 'Start shopping'} →
              </span>
            </Link>

            {/* ── WISHLIST CARD (gold tint) ── */}
            <Link href="/account/wishlist" className={[styles.card, styles.cardWishlist].join(' ')}>
              <div className={styles.cardDecorHeart}>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <div className={styles.cardTop}>
                <span className={styles.cardEyebrowGold}>Saved items</span>
                <svg className={styles.cardChevronDark} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <h2 className={styles.cardTitleDark}>
                <em>{wishlistCount}</em> item{wishlistCount !== 1 ? 's' : ''}<br />
                <span className={styles.cardTitleSub}>saved for later</span>
              </h2>
              <div className={styles.cardDividerDark} />
              {wishlistCount > 0 ? (
                <div className={styles.wishlistRow}>
                  {wishlistItems.slice(0, 4).map(item => (
                    <div key={item.id} className={styles.wishlistThumb}>
                      {item.image ? (
                        <Image
                          src={cloudinaryThumb(item.image)}
                          alt={item.name}
                          fill
                          sizes="52px"
                          style={{ objectFit: 'cover' }}
                          unoptimized
                        />
                      ) : (
                        <div className={styles.wishlistThumbPh} />
                      )}
                    </div>
                  ))}
                  {wishlistCount > 4 && (
                    <div className={styles.wishlistMore}>+{wishlistCount - 4}</div>
                  )}
                </div>
              ) : (
                <p className={styles.cardNoteGold}>Tap the heart on any product to save it here.</p>
              )}
              <span className={styles.cardCtaDark}>Browse wishlist →</span>
            </Link>

            {/* ── PROFILE CARD (cream / editorial) ── */}
            <Link href="/account/profile" className={[styles.card, styles.cardProfile].join(' ')}>
              <div className={styles.cardTop}>
                <span className={styles.cardEyebrowCream}>Your profile</span>
                <svg className={styles.cardChevronCream} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <h2 className={styles.cardTitleCream}>
                Personal<br /><em>Details</em>
              </h2>
              <div className={styles.profileBadgeRow}>
                <div className={styles.profileBadgeMonogram}>{initial}</div>
                <div>
                  <p className={styles.profileBadgeName}>{profile?.full_name || <em>Name not set</em>}</p>
                  <p className={styles.profileBadgeEmail}>{user?.email}</p>
                </div>
              </div>
              {profile?.skin_type && (
                <div className={styles.skinTag}>
                  <span className={styles.skinTagLabel}>Skin type</span>
                  <span className={styles.skinTagValue}>{profile.skin_type}</span>
                </div>
              )}
              <span className={styles.cardCtaCream}>Edit profile →</span>
            </Link>

            {/* ── ADDRESSES CARD (white with map accent) ── */}
            <Link href="/account/addresses" className={[styles.card, styles.cardAddresses].join(' ')}>
              <div className={styles.cardTop}>
                <span className={styles.cardEyebrowDark}>Delivery</span>
                <svg className={styles.cardChevronDark} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <h2 className={styles.cardTitleDark}>
                Saved<br /><em>Addresses</em>
              </h2>
              <div className={styles.addrDecor}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.12">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div className={styles.cardDividerDark} />
              <p className={styles.cardNoteGold}>Manage your saved delivery locations for faster checkout.</p>
              <span className={styles.cardCtaDark}>Manage addresses →</span>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}
