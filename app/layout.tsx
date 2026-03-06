import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "./BottomNav";
import OfflineIndicator from "../components/OfflineIndicator";
import PageTransition from "../components/PageTransition";
import SwipeNavigation from "../components/SwipeNavigation";

export const metadata: Metadata = {
  title: "Rolls",
  description: "Film roll tracker",
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
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Restore theme preference before paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark')}})()` }} />
      </head>
      <body className="bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen font-mono">
        {/* Splash screen — fades out after page load, only renders on hard load */}
        <div
          id="splash"
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "#1b3f2c",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: "20px",
            transition: "opacity 0.5s ease",
          }}
        >
          <img
            src="/apple-touch-icon.png"
            alt=""
            style={{
              width: 120, height: 120,
              borderRadius: 26,
              boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
              animation: "splashIcon 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}
          />
          <span style={{
            color: "#d4b896",
            fontSize: 22, fontWeight: 700, letterSpacing: "0.08em",
            fontFamily: "system-ui, -apple-system, sans-serif",
            animation: "splashLabel 0.4s 0.2s ease forwards",
            opacity: 0,
          }}>
            Rolls
          </span>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var s=document.getElementById('splash');
            if(!s)return;
            var t0=Date.now(), MIN=900;
            function hide(){
              var wait=Math.max(0, MIN-(Date.now()-t0));
              setTimeout(function(){ s.style.opacity='0'; setTimeout(function(){ s.style.display='none'; },500); }, wait);
            }
            if(document.readyState==='complete'){ hide(); }
            else { window.addEventListener('load',hide); setTimeout(hide,3500); }
          })();
        `}} />
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
