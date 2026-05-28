import HeroSection from '@/components/HeroSection/HeroSection';
import ProductGrid from '@/components/ProductGrid/ProductGrid';
import PhilosophySection from '@/components/PhilosophySection/PhilosophySection';
import StepsSection from '@/components/StepsSection/StepsSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProductGrid limit={8} title="The Collection" />
      <PhilosophySection />
      <StepsSection />
    </>
  );
}
