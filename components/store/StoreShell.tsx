"use client";

import { AppShell } from "@astryxdesign/core/AppShell";
import { Center } from "@astryxdesign/core/Center";
import { Section } from "@astryxdesign/core/Section";
import type { ReactNode } from "react";
import { StoreTopNav } from "@/components/store/StoreTopNav";

export function StoreShell({
  storeName,
  children,
}: {
  storeName: string;
  children: ReactNode;
}) {
  return (
    <AppShell
      height="auto"
      variant="surface"
      contentPadding={0}
      topNav={<StoreTopNav storeName={storeName} />}
    >
      <Center axis="horizontal">
        <Section variant="transparent" maxWidth={1180} width="100%" padding={6}>
          {children}
        </Section>
      </Center>
    </AppShell>
  );
}
