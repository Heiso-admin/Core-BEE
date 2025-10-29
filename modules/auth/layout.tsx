"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Logo, ThemeSwitcher } from "@/components/primitives";
import { useSite } from "@/providers/site";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { site } = useSite();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back to home
      </Link>

      <div className="flex flex-col items-center justify-center mb-4">
        <Logo
          hasTitle={false}
          classNames={{
            img: "w-12 text-primary",
          }}
        />
      </div>

      <main className="w-full max-w-md">{children}</main>

      <div className="absolute bottom-4 right-4">
        <ThemeSwitcher />
      </div>

      <footer className="mt-4">
        <div className="container mx-auto px-4 text-center text-sm text-foreground/40 space-y-3">
          <p className="mt-2">
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
          </p>
          <p>
            © 2024 {site?.branding?.organization || "Codists"}. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
