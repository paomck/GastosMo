'use client';
import { useState, useEffect } from 'react';
import { subscribeToUserSettings, updateUserSettings, type UserSettings, type UserCardConfig } from './firestore';
import { CARDS } from './cards';

const DEFAULT_CONFIGS: Record<string, UserCardConfig> = {
  'eastwest': { limit: CARDS['eastwest'].creditLimit },
};

export function useUserSettings(userId: string) {
  const [settings, setSettings] = useState<UserSettings>({
    cardConfigs: DEFAULT_CONFIGS
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsub = subscribeToUserSettings(userId, (data) => {
      if (data) {
        if (data.cardConfigs) {
          setSettings(data);
        } else if (data.creditLimits) {
          // Migrate old creditLimits to cardConfigs
          const migrated: Record<string, UserCardConfig> = {};
          for (const [id, limit] of Object.entries(data.creditLimits)) {
            migrated[id] = { limit };
          }
          setSettings({ ...data, cardConfigs: migrated });
          
          // Optionally save the migration to firestore right away
          updateUserSettings(userId, { cardConfigs: migrated });
        } else {
          setSettings({ cardConfigs: DEFAULT_CONFIGS });
        }
      } else {
        setSettings({ cardConfigs: DEFAULT_CONFIGS });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [userId]);

  const saveCardConfigs = async (configs: Record<string, UserCardConfig>) => {
    if (!userId) return;
    await updateUserSettings(userId, { cardConfigs: configs });
  };

  return { settings, loading, saveCardConfigs };
}
