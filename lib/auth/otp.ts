import { createHash, randomInt } from "crypto";
import { OTP_MAX_ATTEMPTS, OTP_TTL_MINUTES } from "@/lib/constants";
import { isDemoMode } from "@/lib/env";
import { sendOtpEmail } from "@/lib/email/mailer";
import { createAdminClient } from "@/lib/supabase/admin";

const demoOtps = new Map<string, { hash: string; expiresAt: number; attempts: number }>();

function hashCode(email: string, code: string) {
  return createHash("sha256")
    .update(`${email.toLowerCase()}:${code}:${process.env.OTP_PEPPER || "kstore"}`)
    .digest("hex");
}

function generateCode() {
  return String(randomInt(100000, 999999));
}

export async function issueOtp(emailRaw: string) {
  const email = emailRaw.trim().toLowerCase();
  if (!email.includes("@")) {
    throw new Error("Enter a valid email address");
  }

  const code = generateCode();
  const codeHash = hashCode(email, code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);

  if (isDemoMode()) {
    demoOtps.set(email, {
      hash: codeHash,
      expiresAt: expiresAt.getTime(),
      attempts: 0,
    });
    await sendOtpEmail(email, code);
    return { email, demoCode: code };
  }

  const admin = createAdminClient();
  await admin.from("otp_codes").delete().eq("email", email).is("consumed_at", null);
  const { error } = await admin.from("otp_codes").insert({
    email,
    code_hash: codeHash,
    expires_at: expiresAt.toISOString(),
  });
  if (error) throw new Error(error.message);

  await sendOtpEmail(email, code);
  return { email };
}

export async function verifyOtp(emailRaw: string, code: string) {
  const email = emailRaw.trim().toLowerCase();
  const codeHash = hashCode(email, code);

  if (isDemoMode()) {
    const entry = demoOtps.get(email);
    if (!entry || entry.expiresAt < Date.now()) {
      throw new Error("Code expired. Request a new one.");
    }
    if (entry.attempts >= OTP_MAX_ATTEMPTS) {
      throw new Error("Too many attempts. Request a new code.");
    }
    if (entry.hash !== codeHash) {
      entry.attempts += 1;
      throw new Error("Incorrect code");
    }
    demoOtps.delete(email);
    return {
      email,
      session: {
        access_token: "demo-access",
        refresh_token: "demo-refresh",
      },
      demo: true as const,
    };
  }

  const admin = createAdminClient();
  const { data: rows, error } = await admin
    .from("otp_codes")
    .select("*")
    .eq("email", email)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw new Error(error.message);
  const row = rows?.[0];
  if (!row || new Date(row.expires_at).getTime() < Date.now()) {
    throw new Error("Code expired. Request a new one.");
  }
  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    throw new Error("Too many attempts. Request a new code.");
  }
  if (row.code_hash !== codeHash) {
    await admin
      .from("otp_codes")
      .update({ attempts: row.attempts + 1 })
      .eq("id", row.id);
    throw new Error("Incorrect code");
  }

  await admin
    .from("otp_codes")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", row.id);

  const { data: listed } = await admin.auth.admin.listUsers({ perPage: 1000 });
  let user = listed?.users.find(
    (item) => item.email?.toLowerCase() === email,
  );

  if (!user) {
    const created = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: email.split("@")[0] },
    });
    if (created.error || !created.data.user) {
      throw new Error(created.error?.message ?? "Could not create user");
    }
    user = created.data.user;
  }

  const link = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (link.error || !link.data.properties?.hashed_token) {
    throw new Error(link.error?.message ?? "Could not create session");
  }

  return {
    email,
    userId: user.id,
    hashedToken: link.data.properties.hashed_token,
    demo: false as const,
  };
}
