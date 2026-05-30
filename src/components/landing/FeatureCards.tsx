'use client';

import styles from './FeatureCards.module.css';
import { CreditCard, Target, ShieldCheck } from 'lucide-react';

const features = [
  {
    id: 'rebate-tracker',
    icon: Target,
    iconColor: '#C9923A',
    title: 'Rebate Tracker',
    subtitle: 'Never miss your highest cashback window',
    description:
      'Automatically track rebate tiers across all cards. Get notified the moment you hit a threshold and know exactly how much you\'ve earned this month.',
    stat: '8.88%',
    statLabel: 'max cashback rate',
  },
  {
    id: 'card-selector',
    icon: CreditCard,
    iconColor: '#6B9EE8',
    title: 'Card Selector',
    subtitle: 'Know the best card for every purchase',
    description:
      'Before you swipe, GastosMo tells you which of your 3 cards offers the highest rebate for the merchant category — grocery, dining, travel, and more.',
    stat: '3x',
    statLabel: 'smarter spending decisions',
  },
  {
    id: 'fee-shield',
    icon: ShieldCheck,
    iconColor: '#5AB98A',
    title: 'Fee Shield',
    subtitle: 'Proactive alerts before annual fees hit',
    description:
      'Never get surprised by annual fees again. GastosMo monitors your card renewal dates and alerts you 30 days in advance — so you can decide to keep or cancel before you\'re charged.',
    stat: '30d',
    statLabel: 'advance fee warning',
  },
];

export default function FeatureCards() {
  return (
    <section id="features" className={styles.section}>
      <div className={styles.inner}>
        {/* Section Header */}
        <div className={styles.header}>
          <p className={styles.eyebrow}>Why GastosMo</p>
          <h2 className={styles.title}>
            Your credit cards,{' '}
            <span className={styles.titleAccent}>finally unified.</span>
          </h2>
          <p className={styles.description}>
            Stop switching between three bank apps. Everything that matters lives in one command center.
          </p>
        </div>

        {/* Cards Grid */}
        <div className={styles.grid}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                id={feature.id}
                className={`glass-card ${styles.card} animate-fade-up`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Icon */}
                <div
                  className={styles.iconWrap}
                  style={{
                    background: `${feature.iconColor}15`,
                    border: `1px solid ${feature.iconColor}30`,
                  }}
                >
                  <Icon size={22} color={feature.iconColor} />
                </div>

                {/* Stat */}
                <div className={styles.stat} style={{ color: feature.iconColor }}>
                  {feature.stat}
                </div>
                <div className={styles.statLabel}>{feature.statLabel}</div>

                {/* Text */}
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p className={styles.cardSubtitle}>{feature.subtitle}</p>
                <p className={styles.cardDescription}>{feature.description}</p>

                {/* Hover shimmer line */}
                <div
                  className={styles.shimmerLine}
                  style={{ background: `linear-gradient(90deg, transparent, ${feature.iconColor}40, transparent)` }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
