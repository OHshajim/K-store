"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Center } from "@astryxdesign/core/Center";
import { Divider } from "@astryxdesign/core/Divider";
import { Icon } from "@astryxdesign/core/Icon";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Heading, Text } from "@astryxdesign/core/Text";
import { HStack } from "@astryxdesign/core/HStack";
import { VStack } from "@astryxdesign/core/VStack";
import { CubeIcon } from "@heroicons/react/24/outline";
import { APP_NAME } from "@/lib/constants";

type Mode = "signin" | "register" | "forgot";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={16}
    height={16}
    aria-hidden="true"
    {...props}
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setError(null);
    setNotice(null);
    setIsBusy(true);
    try {
      await action();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Something went wrong.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  function signInWithGoogle() {
    void run(async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (oauthError) throw oauthError;
    });
  }

  function signInWithPassword() {
    void run(async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      router.push(next);
      router.refresh();
    });
  }

  function register() {
    void run(async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (signUpError) throw signUpError;
      if (data.session) {
        router.push(next);
        router.refresh();
        return;
      }
      setNotice("Check your inbox to confirm your email, then sign in.");
      setMode("signin");
    });
  }

  function sendResetLink() {
    void run(async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: `${window.location.origin}/auth/reset` },
      );
      if (resetError) throw resetError;
      setNotice("If that email exists, a reset link is on its way.");
    });
  }

  const modeCopy: Record<Mode, { title: string; hint: string }> = {
    signin: { title: "Sign in", hint: "Welcome back." },
    register: { title: "Create account", hint: "Track orders and save reviews." },
    forgot: { title: "Reset password", hint: "We'll email you a reset link." },
  };

  return (
    <Card padding={5}>
      <VStack gap={4}>
        <VStack gap={2} hAlign="center">
          <Center axis="horizontal">
            <Icon icon={CubeIcon} size="lg" />
          </Center>
          <Heading level={2}>Welcome to {APP_NAME}</Heading>
          <Text type="body" color="secondary">
            {modeCopy[mode].hint}
          </Text>
        </VStack>

        {error && (
          <Banner status="error" title="Something went wrong" description={error} />
        )}
        {notice && <Banner status="info" title="Check your email" description={notice} />}

        <Button
          label="Continue with Google"
          variant="secondary"
          size="lg"
          icon={<GoogleIcon />}
          onClick={signInWithGoogle}
        />
        <Divider label="or use email" />

        {mode === "forgot" ? (
          <VStack gap={3}>
            <TextInput
              label="Email"
              type="email"
              size="lg"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
            />
            <Button
              label="Send reset link"
              variant="primary"
              size="lg"
              isLoading={isBusy}
              onClick={sendResetLink}
            />
            <Button
              label="Back to sign in"
              variant="ghost"
              onClick={() => setMode("signin")}
            />
          </VStack>
        ) : (
          <VStack gap={3}>
            {mode === "register" && (
              <TextInput
                label="Full name"
                size="lg"
                value={fullName}
                onChange={setFullName}
                placeholder="Jane Doe"
              />
            )}
            <TextInput
              label="Email"
              type="email"
              size="lg"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
            />
            <TextInput
              label="Password"
              type="password"
              size="lg"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
            />
            <Button
              label={mode === "signin" ? "Sign in" : "Create account"}
              variant="primary"
              size="lg"
              isLoading={isBusy}
              onClick={mode === "signin" ? signInWithPassword : register}
            />
            <HStack gap={2} hAlign="between">
              <Button
                label={
                  mode === "signin" ? "Create an account" : "Have an account?"
                }
                variant="ghost"
                onClick={() =>
                  setMode(mode === "signin" ? "register" : "signin")
                }
              />
              {mode === "signin" && (
                <Button
                  label="Forgot password?"
                  variant="ghost"
                  onClick={() => setMode("forgot")}
                />
              )}
            </HStack>
          </VStack>
        )}
      </VStack>
    </Card>
  );
}
