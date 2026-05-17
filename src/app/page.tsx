'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import LandingPage from '@/components/landing/LandingPage';
import Dashboard from '@/components/dashboard/Dashboard';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function ConditionalRoot() {
  const { user, loading } = useAuth();
  const [overrideToLanding, setOverrideToLanding] = useState(false);

  if (loading) return <LoadingScreen />;
  
  if (user) {
    if (overrideToLanding) {
      return <LandingPage onGoToDashboard={() => setOverrideToLanding(false)} />;
    }
    return <Dashboard onGoToLanding={() => setOverrideToLanding(true)} />;
  }
  
  return <LandingPage />;
}
