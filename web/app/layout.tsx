import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "./ThemeToggle";
import NewRollFab from "./NewRollFab";

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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        {/* Restore theme preference before paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark')}})()` }} />
      </head>
      <body className="bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen font-mono">
        <header
          className="sticky top-0 z-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 flex items-center justify-between"
          style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))", paddingBottom: "0.75rem" }}
        >
          <a href="/" className="text-lg font-bold tracking-tight">Rolls</a>
          <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <a href="/stats" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Stats</a>
            <a href="/cameras" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Cameras</a>
            <a href="/films" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Films</a>
            <ThemeToggle />
          </div>
        </header>
        <main
          className="max-w-2xl mx-auto px-4 py-6"
          style={{ paddingBottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}
        >
          {children}
        </main>
        <NewRollFab />
      </body>
    </html>
  );
}
