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
import { VStack } from "@astryxdesign/core/VStack";
import { CubeIcon } from "@heroicons/react/24/outline";
import { APP_NAME } from "@/lib/constants";

type OtpResponse = {
  error?: string;
  demoCode?: string;
  demo?: boolean;
  hashedToken?: string;
  role?: string;
};

const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

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
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState<"email" | "code">("email");

  async function signInWithGoogle() {
    setError(null);
    if (!hasSupabase) {
      setError(
        "Google sign-in needs Supabase. In demo mode use email OTP (try admin@kstore.local).",
      );
      return;
    }
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (oauthError) throw oauthError;
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to start Google sign in.",
      );
    }
  }

  async function sendCode() {
    setError(null);
    setDemoCode(null);
    setIsSending(true);
    try {
      const response = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data: OtpResponse = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send code.");
      setDemoCode(data.demoCode ?? null);
      setStep("code");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to send code.",
      );
    } finally {
      setIsSending(false);
    }
  }

  async function verifyCode() {
    setError(null);
    setIsVerifying(true);
    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data: OtpResponse = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to verify code.");

      if (!data.demo && data.hashedToken && hasSupabase) {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { error: otpError } = await supabase.auth.verifyOtp({
          token_hash: data.hashedToken,
          type: "email",
        });
        if (otpError) throw otpError;
      }

      router.push(data.role === "admin" ? "/admin" : next);
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to verify code.",
      );
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <Card padding={5}>
      <VStack gap={4}>
        <VStack gap={2} hAlign="center">
          <Center axis="horizontal">
            <Icon icon={CubeIcon} size="lg" />
          </Center>
          <Heading level={2}>Welcome to {APP_NAME}</Heading>
          <Text type="body" color="secondary">
            Google One Tap, Google OAuth, or email + one-time code.
          </Text>
        </VStack>

        {error && (
          <Banner status="error" title="Sign in failed" description={error} />
        )}
        {demoCode && (
          <Banner
            status="info"
            title="Demo verification code"
            description={`Use ${demoCode} to complete sign in. Admin: admin@kstore.local`}
          />
        )}
        {!hasSupabase && (
          <Banner
            status="info"
            title="Demo mode"
            description="Supabase is not configured. Email OTP works locally; codes print in the server log and appear above."
          />
        )}

        <Button
          label="Continue with Google"
          variant="secondary"
          size="lg"
          icon={<GoogleIcon />}
          onClick={signInWithGoogle}
        />
        <Divider label="or" />

        {step === "email" ? (
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
              label="Send one-time code"
              variant="primary"
              size="lg"
              isLoading={isSending}
              onClick={sendCode}
            />
          </VStack>
        ) : (
          <VStack gap={3}>
            <Text type="supporting" color="secondary">
              We sent a 6-digit code to {email}
            </Text>
            <TextInput
              label="One-time code"
              size="lg"
              value={code}
              onChange={setCode}
              placeholder="123456"
            />
            <Button
              label="Verify and continue"
              variant="primary"
              size="lg"
              isLoading={isVerifying}
              onClick={verifyCode}
            />
            <Button
              label="Use a different email"
              variant="ghost"
              onClick={() => setStep("email")}
            />
          </VStack>
        )}
      </VStack>
    </Card>
  );
}
