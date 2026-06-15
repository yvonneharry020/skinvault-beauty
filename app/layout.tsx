import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import Navigation from '@/components/Navigation/Navigation';
import Footer from '@/components/Footer/Footer';
import PageLoader from '@/components/PageLoader/PageLoader';
import CartDrawer from '@/components/CartDrawer/CartDrawer';

export const metadata: Metadata = {
  title: 'SkinVault Beauty — 100% Authentic Skincare',
  description: '100% authentic skincare products from top brands. Delivered to your door in Nigeria.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WishlistProvider>
        <CartProvider>
          <PageLoader />
          <Navigation />
          <CartDrawer />
          <main>{children}</main>
          <Footer />
        </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
