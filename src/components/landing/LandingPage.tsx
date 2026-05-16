'use client';

import styles from './LandingPage.module.css';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import FeatureCards from './FeatureCards';
import LandingFooter from './LandingFooter';

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main>
        <HeroSection />
        <FeatureCards />
      </main>
      <LandingFooter />
    </div>
  );
}
