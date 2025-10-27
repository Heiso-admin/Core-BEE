import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { Nunito, PT_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import ClientBody from "./ClientBody";
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
  title: 'Mini CMS',
  description: 'Mini CMS is a minimalistic CMS.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${nunito.variable} ${ptSans.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased relative">
        <NextIntlClientProvider locale={locale}>
          <NuqsAdapter>
            <ClientBody>{children}</ClientBody>
          </NuqsAdapter>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
