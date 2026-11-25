import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminProfile } from "@/lib/data/auth";
import { requireStoreSettings } from "@/lib/data/catalog";
import {
  isSmtpConfigured,
  verifySmtpConnection,
  sendTestEmail,
  getLastDispatchedEmails,
} from "@/lib/email/mailer";

const testSchema = z.object({
  email: z.string().email("Please provide a valid destination email address"),
});

export async function GET() {
  try {
    await requireAdminProfile();
    const connection = await verifySmtpConnection();
    const history = getLastDispatchedEmails();

    return NextResponse.json({
      isConfigured: isSmtpConfigured(),
      host: process.env.SMTP_HOST?.trim() || null,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT || 587) === 465,
      service: process.env.SMTP_SERVICE?.trim() || null,
      user: process.env.SMTP_USER?.trim() || null,
      passConfigured: Boolean(process.env.SMTP_PASS?.trim()),
      from: process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim() || null,
      connection,
      history,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminProfile();
    const body = await request.json();
    const { email } = testSchema.parse(body);
    const settings = await requireStoreSettings();

    const result = await sendTestEmail(email, settings);

    return NextResponse.json({
      success: true,
      message: `Diagnostic test email dispatched successfully via Nodemailer (${result.mode}).`,
      details: result,
    });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message || "Invalid payload"
        : error instanceof Error
        ? error.message
        : "Failed to dispatch test email";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
