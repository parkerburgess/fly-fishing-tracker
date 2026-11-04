import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getUserId, getUserName } from "@parkerburgess/wandering-parker-server";
import dal from "@/lib/dal";
import { Header, ThemeProvider } from "@parkerburgess/wandering-parker-ui";
import type { SiteNavItem } from "@parkerburgess/wandering-parker-ui";

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

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <ThemeProvider>
          <Header userName={userName ?? userId} brandText="Fly Fish Tracker" navItems={navItems} />
          <main className="max-w-6xl mx-auto px-4 py-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
