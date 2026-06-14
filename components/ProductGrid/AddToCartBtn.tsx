'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import styles from './ProductGrid.module.css';

interface AddToCartBtnProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
}

export default function AddToCartBtn({ id, slug, name, price, image }: AddToCartBtnProps) {
  const { addItem } = useCart();
  const [flash, setFlash] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, slug, name, price, image });
    setFlash(true);
    setTimeout(() => setFlash(false), 1500);
  };

  return (
    <button
      className={`${styles.addBtn} ${flash ? styles.addedFlash : ''}`}
      onClick={handleAdd}
      aria-label={`Add ${name} to cart`}
    >
      {flash ? '✓ Added' : '+ Add to Cart'}
    </button>
  );
}
