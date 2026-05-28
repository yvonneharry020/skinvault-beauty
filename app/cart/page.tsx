'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import styles from './cart.module.css';

const formatNaira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export default function CartPage() {
  const { items, total, removeItem, updateQty, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <h1 className={styles.emptyTitle}>Your Cart is Empty</h1>
        <p className={styles.emptySub}>Discover 63 authentic skincare products from top brands.</p>
        <Link href="/shop" className={styles.shopBtn}>BROWSE THE VAULT</Link>
      </div>
    );
  }

  const shipping = total >= 50000 ? 0 : 3500;
  const grandTotal = total + shipping;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Your Cart</h1>

        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.itemsCol}>
            <div className={styles.itemsHeader}>
              <span>Product</span>
              <span>Price</span>
              <span>Qty</span>
              <span>Total</span>
            </div>

            {items.map(item => (
              <div key={item.id} className={styles.row}>
                <div className={styles.product}>
                  <div className={styles.imgWrap}>
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="90px" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className={styles.imgPlaceholder} />
                    )}
                  </div>
                  <div className={styles.productInfo}>
                    <Link href={`/products/${item.slug}`} className={styles.productName}>{item.name}</Link>
                    <button className={styles.removeLink} onClick={() => removeItem(item.id)}>Remove</button>
                  </div>
                </div>

                <span className={styles.priceCell}>{formatNaira(item.price)}</span>

                <div className={styles.qty}>
                  <button onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                </div>

                <span className={styles.lineTotal}>{formatNaira(item.price * item.quantity)}</span>
              </div>
            ))}

            <div className={styles.cartActions}>
              <Link href="/shop" className={styles.continueShopping}>← Continue Shopping</Link>
              <button className={styles.clearBtn} onClick={clearCart}>Clear Cart</button>
            </div>
          </div>

          {/* Order summary */}
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{formatNaira(total)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : formatNaira(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className={styles.freeShipNote}>Free shipping on orders over ₦50,000</p>
            )}
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Total</span>
              <span>{formatNaira(grandTotal)}</span>
            </div>

            <button className={styles.checkoutBtn}>
              PROCEED TO CHECKOUT
            </button>
            <p className={styles.payNote}>Secure checkout powered by Paystack</p>

            <div className={styles.divider} />
            <p className={styles.guarantee}>
              ✓ 100% Authentic Products &nbsp;·&nbsp; ✓ Secure Payment &nbsp;·&nbsp; ✓ Easy Returns
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
