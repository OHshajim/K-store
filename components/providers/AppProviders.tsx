"use client";

import type { ReactNode } from "react";
import { AstryxProvider } from "@/components/providers/AstryxProvider";
import { GoogleOneTap } from "@/components/auth/GoogleOneTap";
import { PwaRegister } from "@/components/pwa/PwaRegister";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AstryxProvider>
      {children}
      <GoogleOneTap />
      <PwaRegister />
    </AstryxProvider>
  );
}
