'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import styles from './Footer.module.css';

/* ── TextHoverEffect — adapted for SkinVault ──────────────────── */
const TextHoverEffect = ({ text, duration = 0 }: { text: string; duration?: number }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: '50%', cy: '50%' });

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const rect = svgRef.current.getBoundingClientRect();
      const cx = ((cursor.x - rect.left) / rect.width) * 100;
      const cy = ((cursor.y - rect.top) / rect.height) * 100;
      setMaskPosition({ cx: `${cx}%`, cy: `${cy}%` });
    }
  }, [cursor]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={e => setCursor({ x: e.clientX, y: e.clientY })}
      className={styles.svgText}
    >
      <defs>
        <linearGradient id="svFooterGradient" gradientUnits="userSpaceOnUse" cx="50%" cy="50%" r="25%">
          {hovered && (
            <>
              <stop offset="0%"   stopColor="#c8a882" />
              <stop offset="25%"  stopColor="#f0d9b5" />
              <stop offset="50%"  stopColor="#e8c4a0" />
              <stop offset="75%"  stopColor="#d4967a" />
              <stop offset="100%" stopColor="#a07040" />
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id="svRevealMask"
          gradientUnits="userSpaceOnUse"
          r="22%"
          initial={{ cx: '50%', cy: '50%' }}
          animate={maskPosition}
          transition={{ duration, ease: 'easeOut' }}
        >
          <stop offset="0%"   stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>

        <mask id="svTextMask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#svRevealMask)" />
        </mask>
      </defs>

      {/* Ghost outline — visible only on hover */}
      <text
        x="50%" y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        style={{
          fill: 'transparent',
          stroke: 'rgba(200,168,130,0.18)',
          fontFamily: 'Georgia, serif',
          fontSize: '52px',
          fontWeight: '400',
          letterSpacing: '14px',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          userSelect: 'none',
        }}
      >
        {text}
      </text>

      {/* Animated stroke draw-in */}
      <motion.text
        x="50%" y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        style={{
          fill: 'transparent',
          stroke: 'rgba(200,168,130,0.55)',
          fontFamily: 'Georgia, serif',
          fontSize: '52px',
          fontWeight: '400',
          letterSpacing: '14px',
          userSelect: 'none',
        }}
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{ strokeDashoffset: 0, strokeDasharray: 1000 }}
        transition={{ duration: 4, ease: 'easeInOut' }}
      >
        {text}
      </motion.text>

      {/* Hover-reveal color gradient layer */}
      <text
        x="50%" y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#svFooterGradient)"
        strokeWidth="0.3"
        mask="url(#svTextMask)"
        style={{
          fill: 'transparent',
          fontFamily: 'Georgia, serif',
          fontSize: '52px',
          fontWeight: '400',
          letterSpacing: '14px',
          userSelect: 'none',
          cursor: 'pointer',
        }}
      >
        {text}
      </text>
    </svg>
  );
};

/* ── Footer Background Gradient ───────────────────────────────── */
const FooterBackgroundGradient = () => (
  <div
    className={styles.bgGradient}
    style={{
      background:
        'radial-gradient(125% 125% at 50% 10%, #0d1015 50%, rgba(200,168,130,0.12) 100%)',
    }}
  />
);

/* ── Newsletter state ─────────────────────────────────────────── */
function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setSent(true);
  };

  if (sent) {
    return (
      <p className={styles.newsletterThanks}>
        Thank you — you&apos;re on the list.
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Enter your email address"
        className={styles.input}
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <button type="submit" className={styles.submitBtn}>SUBMIT</button>
    </form>
  );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════════ */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <FooterBackgroundGradient />

      <div className={styles.inner}>

        {/* ── Big animated brand text ── */}
        <div className={styles.heroTextWrap}>
          <TextHoverEffect text="SKINVAULT" />
        </div>

        {/* ── Divider line ── */}
        <div className={styles.heroDivider} />

        {/* ── Main grid: logo | nav | newsletter ── */}
        <div className={styles.grid}>

          {/* Col 1 — Logo + tagline + social */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logoLink} aria-label="SkinVault Beauty home">
              <Image
                src="/logo.svg"
                alt="SkinVault Beauty"
                width={130}
                height={34}
                className={styles.logoImg}
                priority={false}
              />
            </Link>
            <p className={styles.tagline}>
              100% authentic K-beauty &amp; global skincare,<br />curated for your skin vault.
            </p>
            <div className={styles.social}>
              <span className={styles.socialLabel}>Follow us</span>
              <div className={styles.socialLinks}>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  {/* Instagram icon */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                  Instagram
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  {/* TikTok icon */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.79 1.52V6.76a4.85 4.85 0 0 1-1.02-.07z"/>
                  </svg>
                  TikTok
                </a>
              </div>
            </div>
          </div>

          {/* Col 2 — Navigation */}
          <div className={styles.navCol}>
            <p className={styles.colLabel}>Explore</p>
            <nav className={styles.navLinks}>
              <Link href="/science" className={styles.navLink}>Science</Link>
              <Link href="/shop" className={styles.navLink}>Shop</Link>
              <Link href="/about" className={styles.navLink}>About Us</Link>
              <Link href="/faq" className={styles.navLink}>FAQ</Link>
            </nav>
            <p className={styles.colLabel} style={{ marginTop: '2rem' }}>Account</p>
            <nav className={styles.navLinks}>
              <Link href="/account" className={styles.navLink}>My Account</Link>
              <Link href="/account/orders" className={styles.navLink}>Orders</Link>
              <Link href="/account/wishlist" className={styles.navLink}>Wishlist</Link>
              <Link href="/account/addresses" className={styles.navLink}>Addresses</Link>
            </nav>
          </div>

          {/* Col 3 — Newsletter */}
          <div className={styles.newsletterCol}>
            <p className={styles.colLabel}>Stay in the loop</p>
            <h2 className={styles.newsletterTitle}>
              Vault drops, restocks &amp; skin secrets — straight to your inbox.
            </h2>
            <NewsletterForm />
            <p className={styles.newsletterNote}>
              No spam. Unsubscribe anytime.
            </p>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>© 2026 SkinVault Beauty. All rights reserved.</p>
          <ul className={styles.legal}>
            <li><Link href="/return-policy" className={styles.legalLink}>Return Policy</Link></li>
            <li><Link href="/terms" className={styles.legalLink}>Terms &amp; Conditions</Link></li>
            <li><Link href="/privacy" className={styles.legalLink}>Privacy Policy</Link></li>
          </ul>
        </div>

      </div>
    </footer>
  );
}
