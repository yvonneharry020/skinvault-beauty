'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/lib/supabase/types';
import styles from './orders.module.css';

type OrderWithItems = Order & {
  order_items: {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
};

const STATUS_LABEL: Record<Order['status'], string> = {
  pending:    'Pending',
  paid:       'Paid',
  processing: 'Processing',
  shipped:    'Shipped',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
  refunded:   'Refunded',
};

const STATUS_TYPE: Record<Order['status'], string> = {
  pending:    'neutral',
  paid:       'info',
  processing: 'info',
  shipped:    'active',
  delivered:  'success',
  cancelled:  'error',
  refunded:   'error',
};

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatCurrency(amount: number, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/account/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      setUserName(profile?.full_name || user.email?.split('@')[0] || '');

      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          id, user_id, status, payment_reference, payment_status,
          subtotal, shipping, discount, total, currency, created_at,
          order_items (id, product_name, quantity, price, subtotal)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setOrders((ordersData as OrderWithItems[]) ?? []);
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <span className={styles.loadingDot} />
          <span className={styles.loadingDot} />
          <span className={styles.loadingDot} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <Link href="/account" className={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Account
          </Link>
          <div className={styles.headingGroup}>
            <p className={styles.eyebrow}>Order history</p>
            <h1 className={styles.title}>
              {userName ? `${userName.split(' ')[0]}'s orders` : 'Your orders'}
            </h1>
            <p className={styles.sub}>
              {orders.length === 0
                ? 'No orders yet'
                : `${orders.length} order${orders.length !== 1 ? 's' : ''} placed`}
            </p>
          </div>
        </div>

        {/* ── Empty state ── */}
        {orders.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <PackageIcon />
            </div>
            <h2 className={styles.emptyTitle}>No orders yet</h2>
            <p className={styles.emptyText}>
              When you place your first order, it will appear here.
            </p>
            <Link href="/shop" className={styles.shopBtn}>Browse the vault</Link>
          </div>
        )}

        {/* ── Orders list ── */}
        {orders.length > 0 && (
          <div className={styles.list}>
            {orders.map(order => (
              <div key={order.id} className={styles.card}>
                {/* Card header */}
                <div className={styles.cardHead}>
                  <div className={styles.cardMeta}>
                    <span className={styles.orderId}>
                      #{order.payment_reference ?? order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className={styles.orderDate}>{formatDate(order.created_at)}</span>
                  </div>
                  <span className={`${styles.badge} ${styles[`badge_${STATUS_TYPE[order.status]}`]}`}>
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>

                {/* Items preview */}
                <div className={styles.items}>
                  {order.order_items.slice(0, 3).map(item => (
                    <div key={item.id} className={styles.item}>
                      <span className={styles.itemName}>{item.product_name}</span>
                      <span className={styles.itemQty}>× {item.quantity}</span>
                    </div>
                  ))}
                  {order.order_items.length > 3 && (
                    <p className={styles.itemMore}>
                      +{order.order_items.length - 3} more item{order.order_items.length - 3 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Card footer */}
                <div className={styles.cardFoot}>
                  <div className={styles.totals}>
                    {order.shipping > 0 && (
                      <span className={styles.shippingNote}>
                        Incl. {formatCurrency(order.shipping, order.currency)} shipping
                      </span>
                    )}
                    <span className={styles.total}>
                      {formatCurrency(order.total, order.currency)}
                    </span>
                  </div>
                  <button className={styles.detailBtn} disabled aria-label="Order details coming soon">
                    Details <ChevronRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
