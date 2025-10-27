'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { SiteSetting } from '@/modules/dev-center/system/settings/site/page';
import { getSiteSettings } from '@/server/site.service';

interface SiteContextType {
  site: SiteSetting | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

const SiteContext = createContext<SiteContextType>({
  site: null,
  isLoading: false,
  error: null,
  refresh: () => {},
});

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [site, setSite] = useState<SiteSetting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function fetchSite() {
    try {
      setIsLoading(true);
      const data = await getSiteSettings();
      if (data) {
        setSite(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSite();
  }, []);

  const refresh = () => {
    fetchSite();
  };

  return (
    <SiteContext.Provider value={{ site, isLoading, error, refresh }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
}
