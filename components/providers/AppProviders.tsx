"use client";

import type { ReactNode } from "react";
import { AstryxProvider } from "@/components/providers/AstryxProvider";
import { CartHydration } from "@/components/providers/CartHydration";
import { GoogleOneTap } from "@/components/auth/GoogleOneTap";
import { PwaRegister } from "@/components/pwa/PwaRegister";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AstryxProvider>
      {children}
      <CartHydration />
      <GoogleOneTap />
      <PwaRegister />
    </AstryxProvider>
  );
}
