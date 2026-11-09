"use client";

import type { ReactNode } from "react";

/**
 * AstryxProvider provides a transparent wrapper for client-side components.
 * Design tokens and theme variables are declared statically in globals.css
 * to eliminate runtime style injection, FOUC (flash of unstyled content),
 * and hydration color blinking.
 */
export function AstryxProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
