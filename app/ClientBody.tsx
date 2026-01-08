"use client";

import { Toaster } from "@heiso/core/components/ui/sonner";
import type { SiteSetting } from "@heiso/core/modules/dev-center/system/settings/site/page";
import { AccountProvider } from "@heiso/core/providers/account";
import { SettingProvider } from "@heiso/core/providers/settings";
import { SiteProvider } from "@heiso/core/providers/site";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";

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
    document.body.className = "antialiased";
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
