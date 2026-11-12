import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/AppProviders";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import { requireStoreSettings } from "@/lib/data/catalog";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kstore.com";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await requireStoreSettings();
  const storeName = settings.store_name || APP_NAME;
  const tagline = settings.tagline || "Modern Living, Simplified";
  const title = `${storeName} — ${tagline}`;
  const description =
    settings.tagline
      ? `${storeName} — ${tagline}. Architectural home organization, functional solid timber furniture, and decorative lighting.`
      : APP_DESCRIPTION;

  const ogImage =
    settings.logo_url ||
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&h=630&q=85";
  const iconUrl =
    settings.favicon_url || settings.logo_url || "/icons/icon-192.png";

  return {
    metadataBase: new URL(siteUrl),
    applicationName: storeName,
    title: {
      default: title,
      template: `%s · ${storeName}`,
    },
    description,
    keywords: [
      "Scandinavian furniture",
      "modern home organization",
      "solid oak furniture",
      "minimalist interior design",
      "architectural lighting",
      `${storeName} living essentials`,
    ],
    authors: [{ name: `${storeName} Design Studio` }],
    creator: storeName,
    publisher: `${storeName} International Ltd.`,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName: storeName,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${storeName} Architectural Living Essentials`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: storeName,
    },
    formatDetection: {
      telephone: false,
    },
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: iconUrl },
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: iconUrl }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#F4F0E8",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light" className="light" style={{ colorScheme: "light" }}>
      <body className="bg-[#F4F0E8] text-[#1A1C18]">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
