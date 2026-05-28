import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation/Navigation';
import Footer from '@/components/Footer/Footer';
import PageLoader from '@/components/PageLoader/PageLoader';

export const metadata: Metadata = {
  title: 'SkinVault Beauty — Vault-Strength Skincare',
  description: 'Science-backed beauty. Engineered to perform. Premium skincare formulas that build, protect, and maintain skin performance.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PageLoader />
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
