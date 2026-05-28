'use client';

import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>SKINVAULT</Link>
          <nav className={styles.footerNav}>
            <Link href="/science">Science</Link>
            <Link href="/shop">Shop</Link>
            <Link href="/about">About Us</Link>
            <Link href="/faq">FAQ</Link>
          </nav>
          <div className={styles.social}>
            <span>FOLLOW US:</span>
            <a href="https://instagram.com" target="_blank" rel="noopener">INSTAGRAM</a>
            <a href="https://tiktok.com" target="_blank" rel="noopener">TIKTOK</a>
          </div>
        </div>

        <div className={styles.newsletter}>
          <h2 className={styles.newsletterTitle}>SUBSCRIBE TO OUR NEWSLETTERS</h2>
          <form className={styles.form} onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Enter your email address" className={styles.input} />
            <button type="submit" className={styles.submitBtn}>
              <span>SUBMIT</span>
            </button>
          </form>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© 2026. All rights reserved. SKINVAULT BEAUTY</p>
        <ul className={styles.legal}>
          <li><Link href="/return-policy">Return Policy</Link></li>
          <li><Link href="/terms">Terms &amp; Conditions</Link></li>
          <li><Link href="/privacy">Privacy Policy</Link></li>
        </ul>
      </div>
    </footer>
  );
}
