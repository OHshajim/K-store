import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { requireStoreSettings } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await requireStoreSettings();
    const faviconUrl = settings.favicon_url || settings.logo_url;

    if (faviconUrl) {
      // If external URL (e.g., Supabase Storage, CDN, S3)
      if (faviconUrl.startsWith("http://") || faviconUrl.startsWith("https://")) {
        try {
          const remoteRes = await fetch(faviconUrl, { next: { revalidate: 60 } });
          if (remoteRes.ok) {
            const buffer = await remoteRes.arrayBuffer();
            const contentType =
              remoteRes.headers.get("content-type") ||
              (faviconUrl.endsWith(".ico") ? "image/x-icon" : "image/png");

            return new NextResponse(buffer, {
              status: 200,
              headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600, s-maxage=3600",
              },
            });
          }
        } catch (fetchErr) {
          console.warn("Failed to stream remote favicon:", fetchErr);
        }

        // Fallback: Redirect to remote URL
        return NextResponse.redirect(faviconUrl, 307);
      }

      // If static icon file (e.g. /icons/icon-192.png)
      if (faviconUrl.startsWith("/icons/")) {
        try {
          const filePath = join(process.cwd(), "public", faviconUrl.replace(/^\//, ""));
          const buffer = await readFile(filePath);
          const ext = faviconUrl.split(".").pop()?.toLowerCase();
          const contentType =
            ext === "ico"
              ? "image/x-icon"
              : ext === "svg"
              ? "image/svg+xml"
              : `image/${ext || "png"}`;

          return new NextResponse(buffer, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
          });
        } catch (fileErr) {
          console.warn("Failed to read local favicon file:", fileErr);
        }
      }
    }

    // Default Fallback: return public/icons/icon-192.png
    const defaultPath = join(process.cwd(), "public", "icons", "icon-192.png");
    const defaultBuffer = await readFile(defaultPath);
    return new NextResponse(defaultBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Error serving favicon:", error);
    return new NextResponse(null, { status: 404 });
  }
}
