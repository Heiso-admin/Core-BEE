"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AccountProvider } from "@/providers/account";
import { SiteProvider } from "@/providers/site";
import { SettingProvider } from '@/providers/settings';
import type { SiteSetting } from '@/modules/dev-center/system/settings/site/page';

export default function ClientBody({
  children,
  initialSite,
}: {
  children: React.ReactNode;
  initialSite?: SiteSetting | null;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = 'antialiased';
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SettingProvider>
        <SiteProvider initialSite={initialSite}>
          <SessionProvider>
            <AccountProvider>
              {children}
              <Toaster richColors />
            </AccountProvider>
          </SessionProvider>
        </SiteProvider>
      </SettingProvider>
    </ThemeProvider>
  );
}
