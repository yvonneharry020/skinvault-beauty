'use client';

import { useWishlist } from '@/contexts/WishlistContext';
import styles from './ProductGrid.module.css';

interface WishlistBtnProps {
  productId: string;
  productSlug: string;
  productName: string;
  productPrice: number;
  productImage: string;
}

export default function WishlistBtn({ productId, productSlug, productName, productPrice, productImage }: WishlistBtnProps) {
  const { isInWishlist, toggleItem } = useWishlist();
  const liked = isInWishlist(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({ id: productId, slug: productSlug, name: productName, price: productPrice, image: productImage });
  };

  return (
    <button
      className={`${styles.wishlistBtn} ${liked ? styles.wishlistBtnLiked : ''}`}
      onClick={handleClick}
      aria-label={liked ? `Remove ${productName} from wishlist` : `Add ${productName} to wishlist`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
