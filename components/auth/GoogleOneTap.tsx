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
          prompt: () => void;
        };
      };
    };
  }
}

export function GoogleOneTap() {
  const pathname = usePathname();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (
      !clientId ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      pathname?.startsWith("/admin")
    ) {
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

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.onload = () => {
          if (cancelled || !window.google) return;
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: { credential?: string }) => {
              if (!response.credential) return;
              await supabase.auth.signInWithIdToken({
                provider: "google",
                token: response.credential,
              });
              window.location.reload();
            },
            auto_select: true,
            cancel_on_tap_outside: true,
          });
          window.google.accounts.id.prompt();
        };
        document.head.appendChild(script);
      } catch {
        // One Tap is progressive enhancement.
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [clientId, pathname]);

  return null;
}
