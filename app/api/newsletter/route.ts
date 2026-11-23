import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStoreSettings } from "@/lib/data/catalog";
import { sendNewsletterWelcomeEmail } from "@/lib/email/mailer";

const newsletterSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address"),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json().catch(() => ({}));
    const { email } = newsletterSchema.parse(raw);

    const settings = await requireStoreSettings();

    try {
      const admin = createAdminClient();
      const { error } = await admin
        .from("newsletter_subscribers")
        .insert({ email: email.toLowerCase() });

      if (error) {
        // Unique violation (already subscribed)
        if (error.code === "23505") {
          return NextResponse.json({
            success: true,
            message: "You are already subscribed to the Kstore dispatch.",
            alreadySubscribed: true,
          });
        }
        console.warn("newsletter insert warning:", error.message);
      }
    } catch (dbErr) {
      console.warn("newsletter db fallback:", dbErr);
    }

    // Dispatch luxury welcome email with WELCOME20 coupon code via Nodemailer
    try {
      await sendNewsletterWelcomeEmail(email, settings);
    } catch (mailErr) {
      console.warn("newsletter email dispatch non-fatal warning:", mailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for joining our private collector circle. Welcome voucher sent to your inbox.",
    });
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues[0]?.message || "Invalid email"
        : "Subscription failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
