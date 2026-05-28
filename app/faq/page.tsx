'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './faq.module.css';

const GlassSphere = dynamic(() => import('@/components/GlassSphere/GlassSphere'), { ssr: false });

const FAQS = [
  { q: 'What skin types are SkinVault formulas suitable for?', a: 'All our formulas are developed to be skin-type inclusive — tested on dry, oily, combination, and sensitive skin. Each product page includes specific suitability guidance.' },
  { q: 'How long until I see results?', a: 'Our actives are clinically dosed for measurable results. Most users report visible improvement in skin texture within 14 days. Full structural changes (density, firmness) are typically observed at the 6-week mark.' },
  { q: 'Are your products fragrance-free?', a: 'Yes. Every SkinVault formula is 100% fragrance-free and free of essential oils that can sensitise the skin barrier.' },
  { q: 'What is your return policy?', a: 'We offer a 30-day satisfaction guarantee on all products. If your skin does not show measurable improvement, contact us for a full refund — no questions asked.' },
  { q: 'How do I use the 5-step system?', a: 'Cleanse → Serum → Moisturise → Mask (2-3x/week) → Eye treatment (AM/PM). Full usage guides are available on each product page and in your order confirmation email.' },
  { q: 'Are your formulas vegan and cruelty-free?', a: 'Yes — with one exception. Our PDRN complex is derived from salmon DNA. All other ingredients are vegan. No SkinVault product is tested on animals at any stage.' },
  { q: 'Can I use multiple serums?', a: 'Yes. We recommend applying water-based serums before oil-based ones. Our Vault Renewal Serum and Glow Essence Mist can be layered for enhanced results.' },
  { q: 'Do you ship internationally?', a: 'We ship to 40+ countries. Shipping times and costs vary by destination. All orders include tracking.' },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* FAQ list */}
        <div className={styles.faqSide}>
          <h1 className={styles.title}>Frequently Asked<br />Questions</h1>
          <div className={styles.list}>
            {FAQS.map((item, i) => (
              <div key={i} className={`${styles.item} ${open === i ? styles.active : ''}`}>
                <button className={styles.question} onClick={() => setOpen(open === i ? null : i)}>
                  <span>{item.q}</span>
                  <span className={styles.icon}>{open === i ? '−' : '+'}</span>
                </button>
                <div className={styles.answer}>
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative sphere — right side like beautyinstem */}
        <GlassSphere
          id="faq-bubble-right"
          className={styles.sphere}
          color1="#d4c0a8"
          color2="#ecddd0"
        />
      </div>
    </div>
  );
}
