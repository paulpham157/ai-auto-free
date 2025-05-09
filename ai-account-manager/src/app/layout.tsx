import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { LocaleProvider } from "./context/LocaleContext";
import dynamic from "next/dynamic";

// Tawk.to bileşenini client-side olarak dinamik import ediyoruz
const TawkTo = dynamic(() => import("./components/TawkTo"), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Accounts - Online",
  description: "AI Accounts",
  other: {
    "extension-version": "1.0.0", // Eklenti versiyonu
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <head />
      <body className={inter.className} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <LocaleProvider>
              <AuthProvider>{children}</AuthProvider>
            </LocaleProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        {/* Tawk.to chat devre dışı bırakıldı - Servis kullanım dışı bildirimi nedeniyle
        <TawkTo propertyId="680c194129a5a6191417a8f8" widgetId="1ipnk5a07" />
        */}
      </body>
    </html>
  );
}
