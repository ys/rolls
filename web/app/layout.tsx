import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "./BottomNav";
import OfflineIndicator from "../components/OfflineIndicator";
import PageTransition from "../components/PageTransition";
import SwipeNavigation from "../components/SwipeNavigation";

export const metadata: Metadata = {
  title: "Rolls",
  description: "Film roll tracker",
  icons: {
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Rolls",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Rolls" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        {/* Restore theme preference before paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark')}})()` }} />
      </head>
      <body className="bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen font-mono">
        <OfflineIndicator />
        <SwipeNavigation />
        <main
          className="max-w-2xl mx-auto px-4"
          style={{
            paddingTop: "calc(1rem + env(safe-area-inset-top))",
            paddingBottom: "calc(7rem + env(safe-area-inset-bottom))",
          }}
        >
          <PageTransition>{children}</PageTransition>
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
