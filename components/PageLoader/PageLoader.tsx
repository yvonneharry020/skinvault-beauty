'use client';

import { useEffect, useState } from 'react';
import Iridescence from '@/components/Iridescence/Iridescence';
import styles from './PageLoader.module.css';

// #E8DFCA (--color-cream, slightly darker eggshell) normalised to 0–1 RGB
const CREAM_COLOR: [number, number, number] = [0.910, 0.875, 0.792];

export default function PageLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.loader}>
      <div className={styles.background}>
        <Iridescence
          color={CREAM_COLOR}
          speed={1.4}
          amplitude={0.15}
          mouseReact={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className={styles.brand}>SKINVAULT</div>
    </div>
  );
}
