import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  getUserId,
  getUserName,
  getUserEmail,
} from "@parkerburgess/wandering-parker-server";
import dal from "@/lib/dal";
import { Header, ThemeProvider } from "@parkerburgess/wandering-parker-ui";
import type {
  SiteNavItem,
  ContactConfig,
} from "@parkerburgess/wandering-parker-ui";

const navItems: SiteNavItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Outings", href: "/outings" },
  { label: "New Outing", href: "/outings/new" },
  { label: "Reports", href: "/reports" },
];

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlyFish Tracker",
  description: "Track and report on your fly fishing outings",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getUserId();
  const userName = await getUserName();
  await dal.upsertUserProfile(userId, userName ?? userId);

  const contact: ContactConfig = {
    endpoint: `${process.env.AUTH_SERVICE_URL ?? "http://localhost:3001"}/api/contact`,
    sourceApp: "Fly Fish Tracker",
    turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    userEmail: (await getUserEmail()) ?? undefined,
  };

  // #region Tailwind utility consts
  const bodyCls = `${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`;
  const mainCls = "max-w-6xl mx-auto px-4 py-8";
  // #endregion

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={bodyCls}>
        <ThemeProvider>
          <Header
            userName={userName ?? userId}
            brandText="Fly Fish Tracker"
            navItems={navItems}
            contact={contact}
          />
          <main className={mainCls}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
