"use client";

import { settings as getSettings } from "@heiso/core/config/settings";
import type { Settings } from "@heiso/core/types/system";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

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
  refresh: () => { },
});

export function SettingProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSetting = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getSettings(true);
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSetting();
  }, [fetchSetting]);

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
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
