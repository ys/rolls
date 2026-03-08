import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "./BottomNav";
import OfflineIndicator from "../components/OfflineIndicator";
import PageTransition from "../components/PageTransition";
import SwipeNavigation from "../components/SwipeNavigation";

export const metadata: Metadata = {
  title: "Rolls",
  description: "Film roll tracker",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Rolls",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/api/icon?size=16",  sizes: "16x16",   type: "image/png" },
      { url: "/api/icon?size=32",  sizes: "32x32",   type: "image/png" },
      { url: "/api/icon?size=48",  sizes: "48x48",   type: "image/png" },
      { url: "/api/icon?size=96",  sizes: "96x96",   type: "image/png" },
      { url: "/api/icon?size=192", sizes: "192x192", type: "image/png" },
      { url: "/api/icon?size=512", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/api/apple-touch-icon", sizes: "1024x1024", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Rolls" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        {/* Theme color */}
        <meta name="theme-color" content="#FF9500" />
        {/* Microsoft */}
        <meta name="msapplication-TileColor" content="#FF9500" />
        <meta name="msapplication-square150x150logo" content="/api/icon?size=150" />
        <meta name="msapplication-square310x310logo" content="/api/icon?size=310" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        {/* Restore theme + font preference before paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark')}var f=localStorage.getItem('app-font');if(f){document.documentElement.style.setProperty('--app-font',f)}})()` }} />
      </head>
      <body className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen">
        <OfflineIndicator />
        <SwipeNavigation />
        <main
          className="max-w-2xl mx-auto px-4"
          style={{
            paddingTop: "calc(1rem + env(safe-area-inset-top))",
            paddingBottom: "calc(5rem + env(safe-area-inset-bottom))",
          }}
        >
          <PageTransition>{children}</PageTransition>
        </main>
        {modal}
        <BottomNav />
      </body>
    </html>
  );
}
