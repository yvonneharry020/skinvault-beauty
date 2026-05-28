'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import styles from './Navigation.module.css';

const NAV_LINKS = [
  { label: 'Science', href: '/science' },
  { label: 'Us', href: '/about' },
  { label: 'Shop', href: '/shop' },
];

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count, setOpen } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        {/* Left nav */}
        <nav className={styles.mainNav}>
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={href} href={href} className={styles.navLink}>
              {label.split('').map((ch, i) => (
                <span key={i} className={styles.letter}>{ch === ' ' ? ' ' : ch}</span>
              ))}
            </Link>
          ))}
        </nav>

        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Image src="/logo.svg" alt="SkinVault Beauty" width={200} height={50} priority />
        </Link>

        {/* Right nav */}
        <nav className={styles.userNav}>
          <Link href="/account" className={styles.navLink}>
            {'ACCOUNT'.split('').map((ch, i) => (
              <span key={i} className={styles.letter}>{ch}</span>
            ))}
          </Link>
          <button className={styles.cartBtn} onClick={() => setOpen(true)} aria-label="Open cart">
            {'CART'.split('').map((ch, i) => (
              <span key={i} className={styles.letter}>{ch}</span>
            ))}
            {count > 0 && <span className={styles.cartCount}>{count}</span>}
          </button>
        </nav>

        {/* Mobile hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <button className={styles.mobileClose} onClick={() => setMenuOpen(false)}>✕</button>
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={href} href={href} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              {label}
            </Link>
          ))}
          <Link href="/account" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Account</Link>
          <button className={styles.mobileLinkBtn} onClick={() => { setMenuOpen(false); setOpen(true); }}>
            Cart {count > 0 && `(${count})`}
          </button>
        </div>
      )}
    </header>
  );
}
