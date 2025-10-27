"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AccountProvider } from "@/providers/account";
import { SiteProvider } from "@/providers/site";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
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
      <SiteProvider>
        <SessionProvider>
          <AccountProvider>
            {children}
            <Toaster richColors />
          </AccountProvider>
        </SessionProvider>
      </SiteProvider>
    </ThemeProvider>
  );
}
