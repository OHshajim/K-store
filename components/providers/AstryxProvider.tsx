"use client";

import { Theme } from "@astryxdesign/core/theme";
import { stoneTheme } from "@astryxdesign/theme-stone/built";
import type { ReactNode } from "react";

export function AstryxProvider({ children }: { children: ReactNode }) {
  return (
    <Theme theme={stoneTheme} mode="light">
      {children}
    </Theme>
  );
}
