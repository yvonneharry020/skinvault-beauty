'use client';

import { useState } from 'react';
import { Phone, Mail, CheckCircle2 } from 'lucide-react';
import styles from './contact.module.css';

function IconX() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
    </svg>
  );
}

function IconTikTok() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06Z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069Zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
    </svg>
  );
}

function IconLinkedin() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
    </svg>
  );
}

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260602_150901_c45b90ec-18d7-42ff-90e2-b95d7109e330.mp4';

const SERVICES = [
  'Order Issue',
  'Product Recommendation',
  'Delivery Query',
  'Returns & Refunds',
  'Product Authenticity',
  'Wholesale Inquiry',
  'Press & Media',
  'Partnership',
  'Other',
];

/* ── Social button helper ── */
function SocialBtn({
  href,
  icon: Icon,
  colorClass,
}: {
  href: string;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={[styles.socialBtn, styles[colorClass]].join(' ')}
      aria-label={colorClass}
    >
      <Icon size={13} />
    </a>
  );
}

/* ════════════════════════════════════════════════
   CONTACT PAGE
════════════════════════════════════════════════ */
export default function ContactPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function toggleService(s: string) {
    setSelected(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending || sent) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
  }

  return (
    <div className={styles.root}>
      {/* ── Outer card with video bg ── */}
      <div className={styles.card}>
        {/* Video background */}
        <video
          className={styles.videoBg}
          src={VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
        />
        {/* Dark overlay */}
        <div className={styles.overlay} />

        {/* Content layer */}
        <div className={styles.content}>

          {/* ── Top info strip ── */}
          <div className={styles.topStrip}>
            <div className={styles.contactChip}>
              <Phone size={13} />
              <a href="tel:+2347031696165" className={styles.chipText}>07031696165</a>
            </div>
            <div className={styles.contactChip}>
              <Mail size={13} />
              <a href="mailto:admin@skinvaultbeauty.com" className={styles.chipText}>
                admin@skinvaultbeauty.com
              </a>
            </div>
          </div>

          {/* ── Spacer ── */}
          <div className={styles.spacer} />

          {/* ── Bottom row: headline + form ── */}
          <div className={styles.bottomRow}>

            {/* Headline left */}
            <div className={styles.headlineWrap}>
              <p className={styles.eyebrow}>Get in touch</p>
              <h1 className={styles.headline}>
                We&apos;re here for<br />
                every step of your{' '}
                <em className={styles.accentWord}>skin journey.</em>
              </h1>
              <p className={styles.subline}>
                Questions about an order, a product, or just want to say hello —
                we&apos;re always happy to hear from you.
              </p>
            </div>

            {/* Form card right */}
            <div className={styles.formCardWrap}>
              <div className={styles.formCard}>

                {/* Heading */}
                <h2 className={styles.formTitle}>Say hello! 👋</h2>

                {/* Email + social row */}
                <div className={styles.emailRow}>
                  <div className={styles.emailLeft}>
                    <span className={styles.dropLabel}>Drop us a line</span>
                    <a href="mailto:admin@skinvaultbeauty.com" className={styles.emailLink}>
                      admin@skinvaultbeauty.com
                    </a>
                  </div>
                  <div className={styles.socials}>
                    <SocialBtn href="https://twitter.com" icon={IconX} colorClass="socialTwitter" />
                    <SocialBtn href="https://tiktok.com" icon={IconTikTok} colorClass="socialTiktok" />
                    <SocialBtn href="https://instagram.com" icon={IconInstagram} colorClass="socialInsta" />
                    <SocialBtn href="https://linkedin.com" icon={IconLinkedin} colorClass="socialLinkedin" />
                  </div>
                </div>

                {/* OR divider */}
                <div className={styles.orDivider}>
                  <div className={styles.orLine} />
                  <span className={styles.orText}>OR</span>
                  <div className={styles.orLine} />
                </div>

                {/* Form or success */}
                {sent ? (
                  <div className={styles.successState}>
                    <div className={styles.successIcon}>
                      <CheckCircle2 size={28} />
                    </div>
                    <h3 className={styles.successTitle}>You&apos;re all set!</h3>
                    <p className={styles.successSub}>Expect a reply within 24 hours.</p>
                  </div>
                ) : (
                  <form className={styles.form} onSubmit={handleSubmit}>
                    <label className={styles.fieldLabel}>Tell us about your inquiry</label>

                    {/* Name + email row */}
                    <div className={styles.nameEmailRow}>
                      <input
                        className={styles.input}
                        type="text"
                        placeholder="Full name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                      />
                      <input
                        className={styles.input}
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    {/* Message */}
                    <textarea
                      className={[styles.input, styles.textarea].join(' ')}
                      rows={4}
                      placeholder="What can we help you with..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      required
                    />

                    {/* Service tags */}
                    <div>
                      <label className={styles.fieldLabel}>I need help with...</label>
                      <div className={styles.tags}>
                        {SERVICES.map(s => (
                          <button
                            key={s}
                            type="button"
                            className={[
                              styles.tag,
                              selected.includes(s) ? styles.tagActive : '',
                            ].filter(Boolean).join(' ')}
                            onClick={() => toggleService(s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={sending}
                    >
                      {sending ? 'Sending…' : 'Send my message'}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
