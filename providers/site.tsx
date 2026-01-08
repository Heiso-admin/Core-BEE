"use client";

import type { SiteSetting } from "@heiso/core/modules/dev-center/system/settings/site/page";
import { getSiteSettings } from "@heiso/core/server/site.service";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

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

export function SiteProvider({
  children,
  initialSite,
}: {
  children: React.ReactNode;
  initialSite?: SiteSetting | null;
}) {
  const [site, setSite] = useState<SiteSetting | null>(initialSite ?? null);
  const [isLoading, setIsLoading] = useState(!initialSite);
  const [error, setError] = useState<Error | null>(null);

  const fetchSite = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getSiteSettings();
      if (data) {
        setSite(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialSite) {
      void fetchSite();
    }
  }, [initialSite, fetchSite]);

  const refresh = useCallback(() => {
    void fetchSite();
  }, [fetchSite]);

  return (
    <SiteContext.Provider value={{ site, isLoading, error, refresh }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error("useSite must be used within a SiteProvider");
  }
  return context;
}
