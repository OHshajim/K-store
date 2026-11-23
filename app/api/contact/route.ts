import { NextResponse } from "next/server";
import { z } from "zod";
import { requireStoreSettings } from "@/lib/data/catalog";
import { sendContactInquiryEmail } from "@/lib/email/mailer";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please provide your full name"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().optional(),
  category: z.string().trim().default("General Concierge"),
  subject: z.string().trim().min(3, "Please provide an inquiry subject"),
  message: z.string().trim().min(10, "Please describe your request (at least 10 characters)"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);
    const settings = await requireStoreSettings();

    // Dispatch inquiry via Nodemailer to store support and acknowledge customer
    await sendContactInquiryEmail(data, settings);

    return NextResponse.json({
      success: true,
      message: "Your message has been delivered to our concierge team. We will respond within 24 hours.",
    });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message || "Invalid form submission"
        : error instanceof Error
        ? error.message
        : "Unable to process message at this time.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
