import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { Nunito, PT_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import ClientBody from "./ClientBody";
import { getSiteSettings } from "@/server/site.service";
import "./globals.css";

const nunito = Nunito({
  variable: '--font-nunito',
  weight: '500',
  subsets: ['latin'],
});

const ptSans = PT_Sans({
  variable: '--font-pt-sans',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Core-Bee',
  description: 'Core-Bee dashboard.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const initialSite = await getSiteSettings().catch(() => null);

  return (
    <html
      lang={locale}
      className={`${nunito.variable} ${ptSans.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased relative">
        <NextIntlClientProvider locale={locale}>
          <NuqsAdapter>
            <ClientBody initialSite={initialSite}>{children}</ClientBody>
          </NuqsAdapter>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
