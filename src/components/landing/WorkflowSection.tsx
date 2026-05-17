'use client';

import styles from './WorkflowSection.module.css';
import { ArrowUp } from 'lucide-react';

export default function WorkflowSection() {
  const steps = [
    {
      num: '01',
      title: 'Link Your Cards',
      description: 'Add your active credit cards safely to your dashboard.',
      color: 'var(--accent-amber)',
    },
    {
      num: '02',
      title: 'Check Before You Swipe',
      description: 'See instantly which card offers the highest rebate for your purchase category.',
      color: '#6B9EE8',
    },
    {
      num: '03',
      title: 'Maximize Your CashBack',
      description: 'Track your rewards and hit that 8.88% max rate automatically.',
      color: '#5AB98A',
    },
  ];

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Left Column: 3-Step Guide */}
          <div className={styles.leftCol}>
            <div className={styles.eyebrow}>Simple Setup</div>
            <h2 className={styles.title}>
              Three steps to <span className={styles.titleAccent}>peak efficiency.</span>
            </h2>
            <p className={styles.description}>
              Achieve financial command in minutes. No complex banking credentials required.
            </p>

            <div className={styles.timeline}>
              <div className={styles.timelineLine} />
              {steps.map((step, idx) => (
                <div key={idx} className={styles.timelineStep}>
                  {/* Step Number Dot */}
                  <div 
                    className={styles.timelineBadge}
                    style={{ 
                      borderColor: step.color,
                      boxShadow: `0 0 15px ${step.color}35`
                    }}
                  >
                    <span className={styles.badgeNum} style={{ color: step.color }}>
                      {step.num}
                    </span>
                  </div>
                  {/* Step Text */}
                  <div className={styles.stepContent}>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDesc}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Physical Smartphone Frame Mockup */}
          <div className={styles.rightCol}>
            <div className={styles.phoneWrapper}>
              <div className={styles.phoneGlow} />
              <div className={styles.phoneFrame}>
                {/* Dynamic Island Notch */}
                <div className={styles.phoneNotch} />
                
                {/* Screen Content Mocking GastosMo Dashboard */}
                <div className={styles.phoneScreen}>
                  <div className={styles.mockHeader}>
                    <span className={styles.mockLogo}>G</span>
                    <div className={styles.mockProfile} />
                  </div>
                  
                  {/* Mini-card inside phone screen */}
                  <div className={styles.mockCard}>
                    <div className={styles.mockCardShine} />
                    <div className={styles.mockCardTop}>
                      <span className={styles.mockBank}>EASTWEST</span>
                      <span className={styles.mockCardName}>Visa Platinum</span>
                    </div>
                    <div className={styles.mockCardBottom}>
                      <span className={styles.mockNumber}>•••• 4892</span>
                      <span className={styles.mockBadge}>8.88% ACTIVE</span>
                    </div>
                  </div>

                  {/* Mock Stats Bars */}
                  <div className={styles.mockStats}>
                    <div className={styles.mockStatItem}>
                      <div className={styles.mockStatHeader}>
                        <span>Grocery Spend</span>
                        <span>₱12,500</span>
                      </div>
                      <div className={styles.mockProgressBar}>
                        <div className={styles.mockProgressFill} style={{ width: '70%' }} />
                      </div>
                    </div>

                    <div className={styles.mockStatItem}>
                      <div className={styles.mockStatHeader}>
                        <span>Monthly Rebates</span>
                        <span style={{ color: 'var(--accent-amber)' }}>₱1,120 / ₱1,250</span>
                      </div>
                      <div className={styles.mockProgressBar}>
                        <div className={styles.mockProgressFill} style={{ width: '89%', background: 'var(--accent-amber)' }} />
                      </div>
                    </div>
                  </div>

                  {/* Recommendation engine indicator */}
                  <div className={styles.mockCalculator}>
                    <span className={styles.mockCalcIcon}>✨</span>
                    <div>
                      <div className={styles.mockCalcTitle}>Dining Recommendation</div>
                      <div className={styles.mockCalcDesc}>Use EW Visa for 8.88% cash back</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Centered Back-to-Top CTA Link */}
        <div className={styles.bottomLinkContainer}>
          <a href="#top" onClick={scrollToTop} className={styles.bottomLink}>
            Ready? Connect your cards <ArrowUp size={14} className={styles.arrowIcon} />
          </a>
        </div>
      </div>
    </section>
  );
}
