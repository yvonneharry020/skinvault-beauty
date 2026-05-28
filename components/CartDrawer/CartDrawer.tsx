'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { items, count, total, open, setOpen, removeItem, updateQty } = useCart();

  const formatNaira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

  if (!open) return null;

  return (
    <>
      <div className={styles.overlay} onClick={() => setOpen(false)} />
      <aside className={styles.drawer}>
        <div className={styles.header}>
          <h2 className={styles.title}>YOUR CART {count > 0 && <span className={styles.badge}>{count}</span>}</h2>
          <button className={styles.close} onClick={() => setOpen(false)} aria-label="Close cart">✕</button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <p>Your cart is empty.</p>
            <Link href="/shop" className={styles.shopBtn} onClick={() => setOpen(false)}>
              SHOP NOW
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map(item => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemImg}>
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="80px" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className={styles.imgPlaceholder} />
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemPrice}>{formatNaira(item.price)}</p>
                    <div className={styles.qtyRow}>
                      <button onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeItem(item.id)} aria-label="Remove">✕</button>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <div className={styles.subtotal}>
                <span>SUBTOTAL</span>
                <span>{formatNaira(total)}</span>
              </div>
              <p className={styles.shippingNote}>Shipping calculated at checkout</p>
              <Link href="/cart" className={styles.checkoutBtn} onClick={() => setOpen(false)}>
                <span>CHECKOUT</span>
              </Link>
              <button className={styles.viewCart} onClick={() => setOpen(false)}>
                <Link href="/cart" onClick={() => setOpen(false)}>View Cart</Link>
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
