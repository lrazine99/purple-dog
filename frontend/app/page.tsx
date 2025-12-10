import { MainLayout } from "@/components/layout/MainLayout";
import HeroBanner from "@/components/homepage/hero-banner";
import CategoryGrid from "@/components/homepage/category-grid";
import AboutSection from "@/components/homepage/about-section";
import Newsletter from "@/components/homepage/newsletter";
import Footer from "@/components/homepage/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <MainLayout>
        <HeroBanner />
        <CategoryGrid />
        <AboutSection />
        <Newsletter />
        <Footer />
      </MainLayout>
    </main>
  );
}
