'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import LandingPage from '@/components/landing/LandingPage';
import Dashboard from '@/components/dashboard/Dashboard';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function ConditionalRoot() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Dashboard />;
  return <LandingPage />;
}
