"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Logo, ThemeSwitcher } from "@/components/primitives";
import { useSite } from "@/providers/site";

import { useTranslations } from "next-intl";

export default function Layout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("auth.login");
  const { site } = useSite();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-sub-background relative font-lato">
      {/* <Link
        href="/"
        className="absolute top-4 left-4 flex items-center text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" /> {t("back")}
      </Link> */}

      <main className="w-full max-w-lg bg-background py-16 px-12 rounded-[12px] shadow-[1px_1px_4px_0_rgba(0,0,0,0.1)] shadow-primary/70 relative">
        <div className="flex flex-col items-center justify-center mb-4">
          <Logo
            hasTitle={false}
            classNames={{
              img: "w-12 text-primary",
            }}
          />
        </div>
        {children}
      </main>

      <div className="absolute bottom-4 right-4">
        <ThemeSwitcher />
      </div>

      <footer className="mt-4 absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="container mx-auto px-4 text-center text-sm text-foreground/40 space-y-3">
          {/* <p className="mt-2">
            <Link href="/legal/privacy" className="hover:text-primary">
              Privacy Policy
            </Link>
            {" • "}
            <Link href="/legal/terms" className="hover:text-primary">
              Terms of Service
            </Link>
            {" • "}
            <Link href="/security" className="hover:text-primary">
              Security
            </Link>
          </p> */}
          <p>
            © 2024 {site?.branding?.organization || "Codists"}. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
