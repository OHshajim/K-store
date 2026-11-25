"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          prompt: (
            callback?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              isDismissedMoment: () => boolean;
              getNotDisplayedReason: () => string;
              getSkippedReason: () => string;
              getDismissedReason: () => string;
            }) => void,
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export function GoogleOneTap() {
  const pathname = usePathname();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // Skip if no client ID or on admin routes
    if (
      !clientId ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      pathname?.startsWith("/admin")
    ) {
      return;
    }

    // Google One Tap logs "[GSI_LOGGER]: The given origin is not allowed for the given client ID."
    // on localhost/127.0.0.1 unless those origins are added in Google Cloud Console.
    // Keep One Tap disabled on local hosts unless explicitly opted in.
    const isLocalHost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isLocalHost && process.env.NEXT_PUBLIC_GOOGLE_ONE_TAP_LOCALHOST !== "true") {
      return;
    }

    let cancelled = false;

    async function boot() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user || cancelled) return;

        // Ensure single script instance
        let script = document.querySelector<HTMLScriptElement>(
          'script[src="https://accounts.google.com/gsi/client"]'
        );

        const handleLoad = () => {
          if (cancelled || !window.google?.accounts?.id) return;

          try {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: async (response: { credential?: string }) => {
                if (!response.credential) return;
                try {
                  await supabase.auth.signInWithIdToken({
                    provider: "google",
                    token: response.credential,
                  });
                  window.location.reload();
                } catch (authErr) {
                  console.warn("Google One Tap sign-in notice:", authErr);
                }
              },
              // Disable auto_select: true which causes FedCM silent credential fetch NetworkError
              auto_select: false,
              cancel_on_tap_outside: true,
              // Opt out of native FedCM browser prompt to prevent NetworkError in Chrome
              use_fedcm_for_prompt: false,
              itp_support: true,
            });

            window.google.accounts.id.prompt((notification) => {
              if (notification.isNotDisplayed()) {
                // Silently handled: user has no active Google session or suppressed prompt
              }
            });
          } catch {
            // Silently catch if third-party privacy shield or missing origin prevents initialization
          }
        };

        if (window.google?.accounts?.id) {
          handleLoad();
        } else if (!script) {
          script = document.createElement("script");
          script.src = "https://accounts.google.com/gsi/client";
          script.async = true;
          script.defer = true;
          script.onload = handleLoad;
          document.head.appendChild(script);
        } else {
          script.addEventListener("load", handleLoad);
        }
      } catch {
        // One Tap is progressive enhancement.
      }
    }

    void boot();
    return () => {
      cancelled = true;
      try {
        window.google?.accounts?.id?.cancel();
      } catch {}
    };
  }, [clientId, pathname]);

  return null;
}
