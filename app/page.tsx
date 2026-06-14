import { Suspense } from 'react';
import HeroSection from '@/components/HeroSection/HeroSection';
import ProductGrid from '@/components/ProductGrid/ProductGrid';
import PhilosophySection from '@/components/PhilosophySection/PhilosophySection';
import StepsSection from '@/components/StepsSection/StepsSection';
import styles from './page.module.css';

function ProductGridSkeleton() {
  return (
    <section className={styles.skeletonSection}>
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonViewAll} />
      </div>
      <div className={styles.skeletonGrid}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeletonImg} />
            <div className={styles.skeletonBody}>
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLineShort} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid limit={8} title="The Collection" />
      </Suspense>
      <PhilosophySection />
      <StepsSection />
    </>
  );
}
