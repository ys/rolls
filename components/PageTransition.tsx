"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const NO_TRANSITION = ["/login", "/register"];

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Skip transition on auth pages — the transform creates a containing block
  // that clips position:fixed children to the max-w-2xl main container.
  const skip = NO_TRANSITION.includes(pathname);
  return (
    <div key={pathname} className={skip ? "h-full" : "page-enter h-full"}>
      {children}
    </div>
  );
}
