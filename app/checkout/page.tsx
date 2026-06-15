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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\s\-()]{7,15}$/;

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
  disabled?: boolean;
};

function FloatField({ label, type = 'text', value, onChange, autoComplete, required, className, disabled }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const id = useId();
  const floated = focused || value.length > 0;

  return (
    <div className={[styles.field, focused ? styles.focused : '', disabled ? styles.fieldDisabled : '', className ?? ''].filter(Boolean).join(' ')}>
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
        disabled={disabled}
      />
      <span className={styles.fieldLine} aria-hidden="true" />
    </div>
  );
}

type SelectProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
  className?: string;
  disabled?: boolean;
};

function SelectField({ label, value, onChange, options, required, className, disabled }: SelectProps) {
  const [focused, setFocused] = useState(false);
  const id = useId();
  const floated = focused || value.length > 0;

  return (
    <div className={[styles.field, focused ? styles.focused : '', disabled ? styles.fieldDisabled : '', className ?? ''].filter(Boolean).join(' ')}>
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
        disabled={disabled}
      >
        <option value="" />
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span className={styles.fieldLine} aria-hidden="true" />
    </div>
  );
}

const formatNaira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

function generateRef() {
  return `SV-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

// ── Saved address display ─────────────────────────
interface SavedAddr { label: string; line1: string; line2: string | null; city: string; state: string | null; }

function AddressCard({ addr, onEdit }: { addr: SavedAddr; onEdit: () => void }) {
  return (
    <div className={styles.savedAddrCard}>
      <div className={styles.savedAddrLeft}>
        <span className={styles.savedAddrLabel}>{addr.label}</span>
        <p className={styles.savedAddrText}>
          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
          {addr.city}{addr.state ? `, ${addr.state}` : ''}
        </p>
      </div>
      <button type="button" className={styles.savedAddrChange} onClick={onEdit}>
        Deliver elsewhere
      </button>
    </div>
  );
}

// ═════════════════════════════════════════════════
// CHECKOUT PAGE
// ═════════════════════════════════════════════════
export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  // ── Auth + profile state ──
  type AuthStatus = 'loading' | 'guest' | 'member';
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [savedAddr, setSavedAddr] = useState<SavedAddr | null>(null);
  const [useCustomAddr, setUseCustomAddr] = useState(false);

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

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0 && !success) router.replace('/cart');
  }, [hydrated, items, success, router]);

  // Load Paystack inline script
  useEffect(() => {
    if (document.getElementById('paystack-inline')) return;
    const script = document.createElement('script');
    script.id = 'paystack-inline';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Fetch auth + profile + default address
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAuthStatus('guest');
        return;
      }

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', user.id)
        .single();

      setEmail(user.email ?? profile?.email ?? '');
      if (profile?.full_name) setFullName(profile.full_name);
      if (profile?.phone) setPhone(profile.phone);

      // Fetch default address
      const { data: addrs } = await supabase
        .from('addresses')
        .select('label, line1, line2, city, state')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

      if (addrs) {
        setSavedAddr(addrs);
        // Pre-fill in case user switches to custom
        setLine1(addrs.line1);
        setLine2(addrs.line2 ?? '');
        setCity(addrs.city);
        if (addrs.state) {
          setState(addrs.state);
          setZone(addrs.state === 'Lagos' ? 'lagos' : 'outside');
        }
      } else {
        // No saved address — show form immediately
        setUseCustomAddr(true);
      }

      setAuthStatus('member');
    })();
  }, []);

  const selectedZone = ZONES.find(z => z.id === zone)!;
  const shipping = total >= 50000 ? 0 : selectedZone.fee;
  const grandTotal = total + shipping;

  // Resolve which address values are being used for payment
  const resolvedAddr = useCustomAddr || !savedAddr
    ? { line1, line2, city, state: state }
    : { line1: savedAddr.line1, line2: savedAddr.line2 ?? '', city: savedAddr.city, state: savedAddr.state ?? '' };

  function validate(): string | null {
    if (!EMAIL_RE.test(email.trim())) return 'Please enter a valid email address.';
    if (fullName.trim().length < 2) return 'Please enter your full name.';
    if (!PHONE_RE.test(phone.trim())) return 'Please enter a valid phone number.';
    if (resolvedAddr.line1.trim().length < 5) return 'Please enter your street address.';
    if (resolvedAddr.city.trim().length < 2) return 'Please enter your city or area.';
    if (!resolvedAddr.state) return 'Please select your state.';
    return null;
  }

  async function handlePay() {
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    if (!window.PaystackPop) {
      setError('Payment system is still loading — please wait a moment and try again.');
      return;
    }

    setPaying(true);
    const ref = generateRef();
    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '';

    if (!paystackKey) {
      setError('Payment configuration error. Please contact support.');
      setPaying(false);
      return;
    }

    try {
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: email.trim(),
        amount: grandTotal * 100,
        currency: 'NGN',
        ref,
        metadata: {
          custom_fields: [
            { display_name: 'Delivery Name', variable_name: 'delivery_name', value: fullName },
            { display_name: 'Delivery Address', variable_name: 'delivery_address', value: `${resolvedAddr.line1}, ${resolvedAddr.city}, ${resolvedAddr.state}` },
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
                  line1: resolvedAddr.line1.trim(),
                  line2: resolvedAddr.line2.trim() || undefined,
                  city: resolvedAddr.city.trim(),
                  state: resolvedAddr.state,
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
    } catch {
      setError('Could not open payment window. Please try again or refresh the page.');
      setPaying(false);
    }
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
            Your authentic skincare will be delivered to <strong>{resolvedAddr.city}, {resolvedAddr.state}</strong>{' '}
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

  const showAddrForm = useCustomAddr || !savedAddr || authStatus === 'guest';

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

        {/* Guest sign-in nudge */}
        {authStatus === 'guest' && (
          <div className={styles.guestBanner}>
            <div className={styles.guestBannerLeft}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Have an account? Sign in to autofill your details and track your order.</span>
            </div>
            <Link href={`/account/login?redirect=/checkout`} className={styles.guestSignIn}>
              Sign in
            </Link>
          </div>
        )}

        <div className={styles.layout}>
          {/* ── Left: form ── */}
          <div className={styles.formCol}>
            {error && <div className={styles.errorBanner} role="alert">{error}</div>}

            {/* 1 — Contact */}
            <div className={styles.section}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionNum}>1</span>
                <span className={styles.sectionTitle}>Contact</span>
                {authStatus === 'member' && (
                  <span className={styles.autofillBadge}>Autofilled</span>
                )}
              </div>
              <div className={styles.grid2}>
                <FloatField
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                  required
                  className={styles.colSpan2}
                  disabled={authStatus === 'member'}
                />
                <FloatField
                  label="Full name"
                  value={fullName}
                  onChange={setFullName}
                  autoComplete="name"
                  required
                  className={styles.colSpan2}
                />
                <FloatField
                  label="Phone number"
                  type="tel"
                  value={phone}
                  onChange={setPhone}
                  autoComplete="tel"
                  required
                  className={styles.colSpan2}
                />
              </div>
            </div>

            {/* 2 — Delivery address */}
            <div className={styles.section}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionNum}>2</span>
                <span className={styles.sectionTitle}>Delivery address</span>
                {authStatus === 'member' && savedAddr && !useCustomAddr && (
                  <span className={styles.autofillBadge}>Saved address</span>
                )}
              </div>

              {/* Saved address card (member with address, not overriding) */}
              {authStatus === 'member' && savedAddr && !useCustomAddr && (
                <AddressCard addr={savedAddr} onEdit={() => setUseCustomAddr(true)} />
              )}

              {/* Address form (guest, or no saved address, or delivering elsewhere) */}
              {showAddrForm && (
                <>
                  {useCustomAddr && savedAddr && (
                    <button
                      type="button"
                      className={styles.backToSaved}
                      onClick={() => {
                        setUseCustomAddr(false);
                        setState(savedAddr.state ?? '');
                        setZone(savedAddr.state === 'Lagos' ? 'lagos' : 'outside');
                      }}
                    >
                      ← Use my saved address instead
                    </button>
                  )}
                  <div className={styles.grid2}>
                    <FloatField label="Street address" value={line1} onChange={setLine1} autoComplete="address-line1" required className={styles.colSpan2} />
                    <FloatField label="Apartment / Estate (optional)" value={line2} onChange={setLine2} autoComplete="address-line2" />
                    <FloatField label="City / Area" value={city} onChange={setCity} autoComplete="address-level2" required />
                    <SelectField
                      label="State"
                      value={state}
                      onChange={v => { setState(v); setZone(v === 'Lagos' ? 'lagos' : 'outside'); }}
                      options={NG_STATES}
                      required
                      className={styles.colSpan2}
                    />
                  </div>
                </>
              )}
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

            <button className={styles.payBtn} onClick={handlePay} disabled={paying || authStatus === 'loading'}>
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
