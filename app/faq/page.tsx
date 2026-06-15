'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './faq.module.css';

const GlassSphere = dynamic(() => import('@/components/GlassSphere/GlassSphere'), { ssr: false });

const FAQS = [
  {
    q: 'Are all products on SkinVault 100% authentic?',
    a: 'Absolutely. Authenticity is the foundation of everything we do. Every product sold on SkinVault Beauty is sourced directly from authorised brand distributors and verified suppliers. We do not work with grey-market vendors. Each item ships with original batch codes and packaging so you can verify authenticity directly with the brand.'
  },
  {
    q: 'What brands do you carry?',
    a: 'We stock a curated selection of K-beauty and globally loved skincare brands including CeraVe, The Ordinary, Anua, SOME BY MI, Isntree, Purito, Torriden, TIAM, Beauty of Joseon, Timeless, Acwell, and more. Our catalogue is continuously updated as we add new brands vetted for quality and efficacy.'
  },
  {
    q: 'How much does delivery cost and how long will it take?',
    a: 'Delivery within Lagos State costs ₦3,500 and takes 1–3 business days. Delivery to all other Nigerian states (Abuja, Port Harcourt, and nationwide) costs ₦6,500 and takes 3–7 business days. Orders over ₦50,000 qualify for free shipping anywhere in Nigeria.'
  },
  {
    q: 'Do you offer free shipping?',
    a: 'Yes! Any order totalling ₦50,000 or more qualifies for free shipping, regardless of your location in Nigeria. Simply add products to your cart and the discount is applied automatically at checkout.'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major debit and credit cards (Visa, Mastercard, Verve) as well as bank transfers through Paystack, our secure payment partner. All transactions are SSL-encrypted and your card details are never stored on our servers.'
  },
  {
    q: 'How do I track my order after payment?',
    a: 'Once your order is placed and payment is confirmed, you will receive an order confirmation. You can track your order status at any time by logging into your SkinVault account and visiting the Orders section. Order statuses update from Processing → Shipped → Delivered in real time.'
  },
  {
    q: 'Can I return a product if I change my mind or it doesn\'t work for me?',
    a: 'We accept returns within 7 days of delivery for items that arrive damaged, defective, or significantly different from what was described. For hygiene reasons, opened skincare products cannot be returned unless faulty. If your order arrives with an issue, please contact us immediately with photos and we will resolve it promptly.'
  },
  {
    q: 'How do I know which products are right for my skin type?',
    a: 'Each product page includes detailed skin type suitability information, key ingredients, and how-to-use guidance. You can also save your skin type in your SkinVault profile (under Account → Profile) and we will use that to personalise your browsing experience. When in doubt, start with gentle, barrier-friendly formulas like those from CeraVe or Isntree.'
  },
  {
    q: 'Can I save products to buy later?',
    a: 'Yes — tap the heart icon on any product to add it to your Wishlist. Your wishlist is saved to your account and accessible anytime from Account → Wishlist. It\'s a great way to keep track of products you\'re researching before committing to a purchase.'
  },
  {
    q: 'How do I get in touch if I have an issue with my order?',
    a: 'You can reach us via email or through our social media channels on Instagram and TikTok (@skinvaultbeauty). We aim to respond to all enquiries within 24 hours on business days. For urgent order issues, please include your order reference number (found in your Account → Orders page) so we can resolve things quickly.'
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* FAQ list */}
        <div className={styles.faqSide}>
          <p className={styles.eyebrow}>Got questions?</p>
          <h1 className={styles.title}>Frequently Asked<br />Questions</h1>
          <div className={styles.list}>
            {FAQS.map((item, i) => (
              <div key={i} className={[styles.item, open === i ? styles.active : ''].filter(Boolean).join(' ')}>
                <button
                  className={styles.question}
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                >
                  <span>{item.q}</span>
                  <span className={styles.icon} aria-hidden="true">
                    {open === i ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    )}
                  </span>
                </button>
                <div className={styles.answer} aria-hidden={open !== i}>
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>

          <p className={styles.stillNeedHelp}>
            Still have questions?{' '}
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.helpLink}>
              Reach us on Instagram
            </a>
          </p>
        </div>

        {/* Decorative sphere */}
        <GlassSphere
          id="faq-bubble-right"
          className={styles.sphere}
        />
      </div>
    </div>
  );
}
