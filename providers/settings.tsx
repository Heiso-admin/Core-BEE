'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Settings } from '@/types/system';
import { settings as getSettings } from '@/config/settings';

interface SettingsContextType {
  settings: Settings | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

const SiteContext = createContext<SettingsContextType>({
  settings: null,
  isLoading: false,
  error: null,
  refresh: () => {},
});

export function SettingProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function fetchSetting() {
    try {
      setIsLoading(true);
      const data = await getSettings(true);
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSetting();
  }, []);

  const refresh = () => {
    fetchSetting();
  };

  return (
    <SiteContext.Provider value={{ settings, isLoading, error, refresh }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
