import styles from './about.module.css';

export const metadata = { title: 'About Us — SkinVault Beauty' };

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.title}>We built SkinVault<br />because skin deserves<br /><em>better tools</em></h1>
      </section>

      <section className={styles.story}>
        <div className={styles.storyBlock}>
          <span className={styles.num}>01</span>
          <div>
            <h2 className={styles.storyTitle}>The Problem</h2>
            <p className={styles.storyText}>
              The beauty industry sells hope. We sell function. Most skincare products are under-dosed,
              over-fragranced, and designed to look good on a shelf — not to change your skin.
              We got tired of it.
            </p>
          </div>
        </div>
        <div className={styles.storyBlock}>
          <span className={styles.num}>02</span>
          <div>
            <h2 className={styles.storyTitle}>Our Approach</h2>
            <p className={styles.storyText}>
              We start with the biochemistry. Every formula begins with a clinical question:
              what does the skin actually need to repair, strengthen, and perform?
              Then we engineer around the answer — no fillers, no fluff.
            </p>
          </div>
        </div>
        <div className={styles.storyBlock}>
          <span className={styles.num}>03</span>
          <div>
            <h2 className={styles.storyTitle}>The Vault Standard</h2>
            <p className={styles.storyText}>
              Every formula passes our 5-point efficacy test before launch:
              barrier integrity, cellular turnover rate, hydration retention,
              collagen density, and clinical irritation score. If it doesn&apos;t clear all five, it doesn&apos;t ship.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
