import type { Metadata } from "next";
import "./globals.css";

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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="bg-zinc-950 text-zinc-100 min-h-screen font-mono">
        <nav className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-lg font-bold tracking-tight">Rolls</a>
          <div className="flex gap-4 text-sm text-zinc-400">
            <a href="/new" className="hover:text-white">+ New</a>
            <a href="/stats" className="hover:text-white">Stats</a>
            <a href="/cameras" className="hover:text-white">Cameras</a>
            <a href="/films" className="hover:text-white">Films</a>
          </div>
        </nav>
        <main className="max-w-2xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
