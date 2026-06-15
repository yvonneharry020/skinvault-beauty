'use client';

import { useState, useId, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { createClient } from '@/lib/supabase/client';
import { cloudinaryUrl } from '@/lib/cloudinary';
import styles from './checkout.module.css';

// ── Delivery zones ────────────────────────────────
const ZONES = [
  {
    id: 'lagos',
    name: 'Lagos State',
    desc: 'Delivery within Lagos',
    fee: 3500,
    days: '1–3 business days',
  },
  {
    id: 'outside',
    name: 'Other States',
    desc: 'Abuja, Port Harcourt & all other states',
    fee: 6500,
    days: '3–7 business days',
  },
] as const;

type ZoneId = (typeof ZONES)[number]['id'];

// ── Nigerian states ───────────────────────────────
const NG_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT – Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara',
];

// ── Email regex ───────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\s\-()]{7,15}$/;

// ── Paystack inline type declaration ─────────────
declare global {
  interface Window {
    PaystackPop: {
      setup: (opts: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        metadata?: Record<string, unknown>;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

// ── Floating label input ──────────────────────────
type FieldProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  className?: string;
};

function FloatField({ label, type = 'text', value, onChange, autoComplete, required, className }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const id = useId();
  const floated = focused || value.length > 0;

  return (
    <div className={[styles.field, focused ? styles.focused : '', className ?? ''].filter(Boolean).join(' ')}>
      <label htmlFor={id} className={[styles.fieldLabel, floated ? styles.floated : ''].filter(Boolean).join(' ')}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={styles.input}
        autoComplete={autoComplete}
        required={required}
      />
      <span className={styles.fieldLine} aria-hidden="true" />
    </div>
  );
}

// ── Select field ──────────────────────────────────
type SelectProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
  className?: string;
};

function SelectField({ label, value, onChange, options, required, className }: SelectProps) {
  const [focused, setFocused] = useState(false);
  const id = useId();
  const floated = focused || value.length > 0;

  return (
    <div className={[styles.field, focused ? styles.focused : '', className ?? ''].filter(Boolean).join(' ')}>
      <label htmlFor={id} className={[styles.fieldLabel, floated ? styles.floated : ''].filter(Boolean).join(' ')}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={styles.select}
        required={required}
      >
        <option value="" />
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span className={styles.fieldLine} aria-hidden="true" />
    </div>
  );
}

// ── Helpers ───────────────────────────────────────
const formatNaira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

function generateRef() {
  return `SV-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

// ═════════════════════════════════════════════════
// CHECKOUT PAGE
// ═════════════════════════════════════════════════
export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  // ── Form state ──
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zone, setZone] = useState<ZoneId>('lagos');

  // ── UI state ──
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [hydrated, setHydrated] = useState(false);

  // Wait one tick for CartContext to load from localStorage before checking emptiness
  useEffect(() => { setHydrated(true); }, []);

  // Redirect if cart is empty (only after hydration)
  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0 && !success) router.replace('/cart');
  }, [hydrated, items, success, router]);

  // Pre-fill email from Supabase session
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
  }, []);

  // Load Paystack inline script once
  useEffect(() => {
    if (document.getElementById('paystack-inline')) return;
    const script = document.createElement('script');
    script.id = 'paystack-inline';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Derived values
  const selectedZone = ZONES.find(z => z.id === zone)!;
  const shipping = total >= 50000 ? 0 : selectedZone.fee;
  const grandTotal = total + shipping;

  // ── Validate form ──
  function validate(): string | null {
    if (!EMAIL_RE.test(email.trim())) return 'Please enter a valid email address.';
    if (fullName.trim().length < 2) return 'Please enter your full name.';
    if (!PHONE_RE.test(phone.trim())) return 'Please enter a valid phone number.';
    if (line1.trim().length < 5) return 'Please enter your street address.';
    if (city.trim().length < 2) return 'Please enter your city or area.';
    if (!state) return 'Please select your state.';
    return null;
  }

  // ── Pay handler ──
  async function handlePay() {
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    if (!window.PaystackPop) {
      setError('Payment system is loading — please try again in a moment.');
      return;
    }

    setPaying(true);
    const ref = generateRef();
    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '';

    const handler = window.PaystackPop.setup({
      key: paystackKey,
      email: email.trim(),
      amount: grandTotal * 100,
      currency: 'NGN',
      ref,
      metadata: {
        custom_fields: [
          { display_name: 'Delivery Name', variable_name: 'delivery_name', value: fullName },
          { display_name: 'Delivery Address', variable_name: 'delivery_address', value: `${line1}, ${city}, ${state}` },
        ],
      },
      callback: async (response) => {
        const orderItems = items.map(i => ({
          product_id: i.id,
          product_name: i.name,
          price: i.price,
          quantity: i.quantity,
          subtotal: i.price * i.quantity,
        }));

        try {
          const res = await fetch('/api/orders/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentReference: response.reference,
              items: orderItems,
              subtotal: total,
              shipping,
              total: grandTotal,
              deliveryAddress: {
                fullName: fullName.trim(),
                phone: phone.trim(),
                line1: line1.trim(),
                line2: line2.trim() || undefined,
                city: city.trim(),
                state,
                country: 'NG',
              },
            }),
          });

          const data = await res.json() as { orderId?: string; error?: string };

          if (!res.ok || !data.orderId) {
            setError(data.error ?? 'Payment received but order could not be saved. Contact support with ref: ' + response.reference);
            setPaying(false);
            return;
          }

          clearCart();
          setOrderId(data.orderId);
          setSuccess(true);
        } catch {
          setError('Payment received but order save failed. Contact support with ref: ' + response.reference);
          setPaying(false);
        }
      },
      onClose: () => {
        setPaying(false);
      },
    });

    handler.openIframe();
  }

  // ── Success screen ──
  if (success) {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successRing}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className={styles.successEyebrow}>Order confirmed</p>
          <h1 className={styles.successTitle}>Your vault is on its way.</h1>
          <p className={styles.successText}>
            Thank you for your order! A confirmation has been sent to <strong>{email}</strong>.
            Your authentic skincare will be delivered to <strong>{city}, {state}</strong>{' '}
            within {selectedZone.days}.
          </p>
          <div className={styles.successActions}>
            <Link href="/account/orders" className={styles.btnDark}>Track my order</Link>
            <Link href="/shop" className={styles.btnOutline}>Continue shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Header */}
        <div className={styles.header}>
          <Link href="/cart" className={styles.backLink}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to cart
          </Link>
          <h1 className={styles.title}>Checkout</h1>
        </div>

        <div className={styles.layout}>
          {/* ── Left: form ── */}
          <div className={styles.formCol}>
            {error && <div className={styles.errorBanner} role="alert">{error}</div>}

            {/* 1 — Contact */}
            <div className={styles.section}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionNum}>1</span>
                <span className={styles.sectionTitle}>Contact</span>
              </div>
              <FloatField label="Email address" type="email" value={email} onChange={setEmail} autoComplete="email" required />
            </div>

            {/* 2 — Delivery address */}
            <div className={styles.section}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionNum}>2</span>
                <span className={styles.sectionTitle}>Delivery address</span>
              </div>

              <div className={styles.grid2}>
                <FloatField label="Full name" value={fullName} onChange={setFullName} autoComplete="name" required className={styles.colSpan2} />
                <FloatField label="Phone number" type="tel" value={phone} onChange={setPhone} autoComplete="tel" required className={styles.colSpan2} />
                <FloatField label="Street address" value={line1} onChange={setLine1} autoComplete="address-line1" required className={styles.colSpan2} />
                <FloatField label="Apartment / Estate (optional)" value={line2} onChange={setLine2} autoComplete="address-line2" />
                <FloatField label="City / Area" value={city} onChange={setCity} autoComplete="address-level2" required />
                <SelectField label="State" value={state} onChange={v => { setState(v); if (v !== 'Lagos') setZone('outside'); else setZone('lagos'); }} options={NG_STATES} required />
              </div>
            </div>

            {/* 3 — Delivery zone */}
            <div className={styles.section}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionNum}>3</span>
                <span className={styles.sectionTitle}>Delivery location</span>
              </div>

              {total >= 50000 && (
                <p className={styles.zoneFreeNote}>
                  🎉 Your order qualifies for FREE shipping!
                </p>
              )}

              <div className={styles.zoneGrid}>
                {ZONES.map(z => (
                  <button
                    key={z.id}
                    type="button"
                    className={[styles.zoneCard, zone === z.id ? styles.selected : ''].filter(Boolean).join(' ')}
                    onClick={() => setZone(z.id)}
                  >
                    <div className={styles.zoneRadio}>
                      <div className={styles.zoneRadioDot} />
                    </div>
                    <div className={styles.zoneName}>{z.name}</div>
                    <div className={styles.zoneDesc}>{z.desc}</div>
                    <div className={styles.zoneFee}>
                      {total >= 50000 ? 'FREE' : formatNaira(z.fee)}
                    </div>
                    <div className={styles.zoneDesc}>{z.days}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: order summary ── */}
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order summary</h2>

            <div className={styles.summaryItems}>
              {items.map(item => (
                <div key={item.id} className={styles.summaryItem}>
                  <div className={styles.summaryItemImg}>
                    {item.image && (
                      <Image src={cloudinaryUrl(item.image, 100)} alt={item.name} fill sizes="48px" style={{ objectFit: 'cover' }} unoptimized />
                    )}
                  </div>
                  <div className={styles.summaryItemInfo}>
                    <div className={styles.summaryItemName}>{item.name}</div>
                    <div className={styles.summaryItemQty}>Qty {item.quantity}</div>
                  </div>
                  <div className={styles.summaryItemPrice}>{formatNaira(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>

            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Subtotal</span>
              <span className={styles.totalValue}>{formatNaira(total)}</span>
            </div>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Shipping ({selectedZone.name})</span>
              <span className={styles.totalValue}>{shipping === 0 ? 'FREE' : formatNaira(shipping)}</span>
            </div>
            {total < 50000 && (
              <p className={styles.freeNote}>Free shipping on orders over ₦50,000</p>
            )}

            <div className={styles.grandRow}>
              <span className={styles.grandLabel}>Total</span>
              <span className={styles.grandValue}>{formatNaira(grandTotal)}</span>
            </div>

            <button className={styles.payBtn} onClick={handlePay} disabled={paying}>
              {paying && <span className={styles.spinner} />}
              {paying ? 'Processing…' : `Pay ${formatNaira(grandTotal)}`}
            </button>

            <p className={styles.payNote}>Secure payment powered by Paystack</p>

            <div className={styles.trust}>
              ✓ 100% Authentic Products<br />
              ✓ Secure Payment · SSL Encrypted<br />
              ✓ Easy Returns Policy
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
