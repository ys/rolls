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
      { url: "/api/icon?size=16", sizes: "16x16", type: "image/png" },
      { url: "/api/icon?size=32", sizes: "32x32", type: "image/png" },
      { url: "/api/icon?size=48", sizes: "48x48", type: "image/png" },
      { url: "/api/icon?size=96", sizes: "96x96", type: "image/png" },
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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        {/* Theme color - darkroom aesthetic */}
        <meta name="theme-color" content="#0f0f0f" />
        {/* Microsoft */}
        <meta name="msapplication-TileColor" content="#0f0f0f" />
        <meta
          name="msapplication-square150x150logo"
          content="/api/icon?size=150"
        />
        <meta
          name="msapplication-square310x310logo"
          content="/api/icon?size=310"
        />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className="min-h-screen" style={{ backgroundColor: "var(--darkroom-bg)", color: "var(--darkroom-text-primary)" }}>
        <OfflineIndicator />
        <SwipeNavigation />
        <main
          className="max-w-2xl mx-auto h-lvh px-4"
          style={{
            paddingTop: "calc(1rem + env(safe-area-inset-top))",
            paddingBottom: "calc(7rem + env(safe-area-inset-bottom))",
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
