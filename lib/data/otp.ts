import { randomInt } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/mailer";
import { APP_NAME } from "@/lib/constants";

export type OtpIntent = "forgot_password" | "password_change";

interface StoredOtp {
  id: string;
  email: string;
  otpCode: string;
  intent: OtpIntent;
  expiresAt: number; // Unix timestamp ms
  used: boolean;
  createdAt: number;
}

// In-memory fallback cache so OTPs work 100% reliably even if Supabase DB is offline or mock mode
const memoryOtpStore = new Map<string, StoredOtp>();

// Rate limit tracker: minimum 25 seconds between OTP requests per email
const rateLimitTracker = new Map<string, number>();

/**
 * Generate a secure 6-digit numeric OTP and dispatch it via email
 */
export async function generateAndSendOtp(
  email: string,
  intent: OtpIntent = "forgot_password"
): Promise<{
  success: boolean;
  message: string;
  debugOtp?: string;
  expiresAt: string;
}> {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Rate-limiting check
  const lastRequested = rateLimitTracker.get(normalizedEmail) || 0;
  const now = Date.now();
  if (now - lastRequested < 25000) {
    const waitSeconds = Math.ceil((25000 - (now - lastRequested)) / 1000);
    throw new Error(
      `Please wait ${waitSeconds}s before requesting a new verification code.`
    );
  }
  rateLimitTracker.set(normalizedEmail, now);

  // 2. Generate 6-digit OTP code (100000 - 999999)
  const otpCode = randomInt(100000, 1000000).toString();
  const validityMs = 10 * 60 * 1000; // 10 minutes
  const expiresAt = new Date(now + validityMs);

  // 3. Save to In-Memory Fallback
  const memoryId = `otp_${now}_${Math.random().toString(36).substring(2, 7)}`;
  memoryOtpStore.set(`${normalizedEmail}:${intent}`, {
    id: memoryId,
    email: normalizedEmail,
    otpCode,
    intent,
    expiresAt: expiresAt.getTime(),
    used: false,
    createdAt: now,
  });

  // 4. Try saving to Supabase DB table public.auth_otps if available
  try {
    const supabase = createAdminClient();
    // Mark previous unused codes for this email + intent as used
    await supabase
      .from("auth_otps")
      .update({ used: true })
      .eq("email", normalizedEmail)
      .eq("intent", intent)
      .eq("used", false);

    // Insert new active OTP
    await supabase.from("auth_otps").insert({
      email: normalizedEmail,
      otp_code: otpCode,
      intent,
      expires_at: expiresAt.toISOString(),
      used: false,
    });
  } catch (err) {
    // Non-fatal: in-memory store serves as resilient fallback
    console.warn("[OTP] Database save fallback to in-memory:", err);
  }

  // 5. Send formatted HTML email
  const subject =
    intent === "password_change"
      ? `Your ${APP_NAME} Password Change Code: ${otpCode}`
      : `Your ${APP_NAME} Password Recovery Code: ${otpCode}`;

  const intentHeadline =
    intent === "password_change"
      ? "Verify Password Change"
      : "Password Recovery Request";

  const intentDescription =
    intent === "password_change"
      ? "We received a request to update the password for your Kstore sanctuary account."
      : "We received a request to recover and reset the password for your Kstore sanctuary account.";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 32px 16px; background-color: #F4F0E8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1C18;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #FFFFFF; border-radius: 24px; border: 1px solid rgba(26, 28, 24, 0.12); box-shadow: 0 4px 20px rgba(0,0,0,0.04); overflow: hidden;">
          <tr>
            <td style="padding: 40px 36px 24px 36px; text-align: center; border-bottom: 1px solid rgba(26, 28, 24, 0.08);">
              <span style="font-family: Georgia, serif; font-size: 28px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #1A1C18;">
                ${APP_NAME}
              </span>
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #8A927A; margin-top: 4px; font-weight: 600;">
                Modern Living, Simplified
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px;">
              <h2 style="font-family: Georgia, serif; font-size: 24px; font-weight: bold; color: #1A1C18; margin: 0 0 12px 0;">
                ${intentHeadline}
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #4A483E; margin: 0 0 24px 0;">
                ${intentDescription} Please enter the 6-digit verification code below to proceed:
              </p>
              
              <div style="background-color: #FAF9F6; border: 1px dashed rgba(26, 28, 24, 0.2); border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-family: monospace; font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #1A1C18;">
                  ${otpCode}
                </span>
                <div style="font-size: 11px; color: #8A927A; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px;">
                  Expires in 10 minutes · Single Use
                </div>
              </div>

              <p style="font-size: 12px; line-height: 1.5; color: #737166; margin: 0;">
                If you did not initiate this action, you can safely disregard this email. Your credentials remain completely secure.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 36px; background-color: #FAF9F6; border-top: 1px solid rgba(26, 28, 24, 0.08); text-align: center; font-size: 11px; color: #8A927A;">
              © ${new Date().getFullYear()} ${APP_NAME} Studio · Scandinavian Architectural Living
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `${APP_NAME} Verification Code: ${otpCode}\n\n${intentHeadline}\n${intentDescription}\n\nYour code is: ${otpCode} (Valid for 10 minutes).\n\nIf you did not request this, please ignore this email.`;

  await sendEmail({
    to: normalizedEmail,
    subject,
    html,
    text,
  });

  return {
    success: true,
    message: "A 6-digit verification code has been dispatched to your email address.",
    debugOtp: process.env.NODE_ENV !== "production" ? otpCode : undefined,
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * Verify a 6-digit OTP code and mark it as consumed
 */
export async function verifyAndConsumeOtp(
  email: string,
  otpCode: string,
  intent: OtpIntent = "forgot_password"
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedOtp = otpCode.trim();
  const now = Date.now();

  // 1. First check in-memory store
  const key = `${normalizedEmail}:${intent}`;
  const memoryRecord = memoryOtpStore.get(key);
  let memoryMatched = false;

  if (
    memoryRecord &&
    !memoryRecord.used &&
    memoryRecord.otpCode === normalizedOtp &&
    memoryRecord.expiresAt > now
  ) {
    memoryRecord.used = true;
    memoryMatched = true;
  }

  // 2. Also check Supabase DB
  try {
    const supabase = createAdminClient();
    const { data: dbRecords } = await supabase
      .from("auth_otps")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("intent", intent)
      .eq("otp_code", normalizedOtp)
      .eq("used", false)
      .gt("expires_at", new Date(now).toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (dbRecords && dbRecords.length > 0) {
      await supabase
        .from("auth_otps")
        .update({ used: true })
        .eq("id", dbRecords[0].id);
      return true;
    }
  } catch (err) {
    console.warn("[OTP] Database verify fallback:", err);
  }

  return memoryMatched;
}
