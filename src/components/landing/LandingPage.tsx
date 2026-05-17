'use client';

import styles from './LandingPage.module.css';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import FeatureCards from './FeatureCards';
import WorkflowSection from './WorkflowSection';
import LandingFooter from './LandingFooter';

interface LandingPageProps {
  onGoToDashboard?: () => void;
}

export default function LandingPage({ onGoToDashboard }: LandingPageProps) {
  return (
    <div className={styles.page}>
      <Navbar onGoToDashboard={onGoToDashboard} />
      <main>
        <HeroSection onGoToDashboard={onGoToDashboard} />
        <FeatureCards />
        <WorkflowSection />
      </main>
      <LandingFooter />
    </div>
  );
}
