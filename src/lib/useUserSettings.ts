'use client';
import { useState, useEffect } from 'react';
import { subscribeToUserSettings, updateUserSettings, type UserSettings } from './firestore';
import { CARDS, CARD_ORDER } from './cards';

const DEFAULT_LIMITS = {
  'eastwest': CARDS['eastwest'].creditLimit,
  'bdo-amex': CARDS['bdo-amex'].creditLimit,
  'bdo-diamond': CARDS['bdo-diamond'].creditLimit,
};

export function useUserSettings(userId: string) {
  const [settings, setSettings] = useState<UserSettings>({
    creditLimits: DEFAULT_LIMITS
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsub = subscribeToUserSettings(userId, (data) => {
      if (data && data.creditLimits) {
        setSettings(data);
      } else {
        setSettings({ creditLimits: DEFAULT_LIMITS });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [userId]);

  const saveLimits = async (limits: Record<string, number>) => {
    if (!userId) return;
    await updateUserSettings(userId, { creditLimits: limits });
  };

  return { settings, loading, saveLimits };
}
