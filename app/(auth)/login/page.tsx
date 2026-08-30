import { Suspense } from "react";
import { Center } from "@astryxdesign/core/Center";
import { VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { LoginForm } from "@/components/auth/LoginForm";
import { APP_NAME } from "@/lib/constants";

export default function LoginPage() {
  return (
    <Center axis="both" minHeight="100dvh">
      <VStack gap={4} hAlign="center" maxWidth={420} width="100%" padding={4}>
        <Text type="body" weight="bold" size="lg">
          {APP_NAME}
        </Text>
        <Suspense fallback={<Text type="body">Loading…</Text>}>
          <LoginForm />
        </Suspense>
      </VStack>
    </Center>
  );
}
