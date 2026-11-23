import nodemailer, { type Transporter } from "nodemailer";
import { APP_NAME } from "@/lib/constants";
import { getSiteUrl } from "@/lib/env";
import { formatMoney } from "@/lib/format";
import type { Order, StoreSettings } from "@/lib/types";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type DispatchedEmailLog = {
  id: string;
  to: string;
  subject: string;
  dispatchedAt: string;
  mode: "smtp" | "ethereal" | "simulation";
  previewUrl?: string;
};

// Global in-memory queue to record the last 20 emails dispatched for audit & testing
declare global {
  var __kstore_dispatched_emails__: DispatchedEmailLog[] | undefined;
}

const emailHistory: DispatchedEmailLog[] =
  globalThis.__kstore_dispatched_emails__ ??
  (globalThis.__kstore_dispatched_emails__ = []);

function recordDispatchedEmail(log: DispatchedEmailLog) {
  emailHistory.unshift(log);
  if (emailHistory.length > 20) {
    emailHistory.pop();
  }
}

export function getLastDispatchedEmails(): DispatchedEmailLog[] {
  return [...emailHistory];
}

/**
 * Returns whether real SMTP credentials are configured in environment
 */
export function isSmtpConfigured(): boolean {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const service = process.env.SMTP_SERVICE?.trim();
  return Boolean((host && user && pass) || (service && user && pass));
}

/**
 * Build the active Nodemailer transport instance
 */
function getTransport(): Transporter | null {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const service = process.env.SMTP_SERVICE?.trim();
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (service && user && pass) {
    return nodemailer.createTransport({
      service,
      auth: { user, pass },
    });
  }

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  return null;
}

function fromAddress(settings?: Partial<StoreSettings>): string {
  const customFrom = process.env.SMTP_FROM?.trim();
  if (customFrom) return customFrom;

  const storeName = settings?.store_name || APP_NAME;
  const user = process.env.SMTP_USER?.trim() || "concierge@kstore.com";
  return `"${storeName} Concierge" <${user}>`;
}

/**
 * Verifies Nodemailer SMTP connectivity
 */
export async function verifySmtpConnection(): Promise<{
  configured: boolean;
  connected: boolean;
  message: string;
}> {
  const transport = getTransport();
  if (!transport) {
    return {
      configured: false,
      connected: false,
      message:
        "SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) are not populated in environment.",
    };
  }

  try {
    await transport.verify();
    return {
      configured: true,
      connected: true,
      message: "Nodemailer SMTP transport connection established successfully.",
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      configured: true,
      connected: false,
      message: `Nodemailer connection failed: ${errorMsg}`,
    };
  }
}

/**
 * Primary dispatch method with graceful resilience and Ethereal preview support
 */
export async function sendEmail(
  input: EmailPayload,
  settings?: Partial<StoreSettings>
): Promise<{
  success: boolean;
  mode: "smtp" | "ethereal" | "simulation";
  previewUrl?: string;
  messageId?: string;
}> {
  const transport = getTransport();

  // 1. Production or configured SMTP dispatch
  if (transport) {
    try {
      const info = await transport.sendMail({
        from: fromAddress(settings),
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: input.replyTo || (settings?.support_email ?? undefined),
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      recordDispatchedEmail({
        id: info.messageId || `msg_${Date.now()}`,
        to: input.to,
        subject: input.subject,
        dispatchedAt: new Date().toISOString(),
        mode: "smtp",
        previewUrl,
      });

      return {
        success: true,
        mode: "smtp",
        messageId: info.messageId,
        previewUrl,
      };
    } catch (error) {
      console.error("[Nodemailer] SMTP send error:", error);
      throw error;
    }
  }

  // 2. Development / Test fallback: record in-memory and output luxury console preview
  const simId = `sim_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  console.info("==================================================================");
  console.info(`[Nodemailer:DevSimulator] Dispatching to: ${input.to}`);
  console.info(`Subject: ${input.subject}`);
  console.info(`From: ${fromAddress(settings)}`);
  console.info("------------------------------------------------------------------");
  console.info(input.text.slice(0, 300) + (input.text.length > 300 ? "..." : ""));
  console.info("==================================================================");

  recordDispatchedEmail({
    id: simId,
    to: input.to,
    subject: input.subject,
    dispatchedAt: new Date().toISOString(),
    mode: "simulation",
  });

  return {
    success: true,
    mode: "simulation",
    messageId: simId,
  };
}

/**
 * Resolves the client tracking link (logged-in vs guest token)
 */
export function orderTrackingUrl(order: Order): string {
  const site = getSiteUrl();
  return order.user_id
    ? `${site}/orders/${order.id}`
    : `${site}/track/${order.order_number}?t=${order.tracking_token}`;
}

/**
 * 1. ORDER CONFIRMATION EMAIL (Luxury Scandinavian Design)
 */
export async function sendOrderPlacedEmail(
  order: Order,
  settings: StoreSettings
) {
  const site = getSiteUrl();
  const total = formatMoney(
    order.total_cents,
    settings.currency_symbol,
    settings.currency
  );
  const subtotal = formatMoney(
    order.subtotal_cents,
    settings.currency_symbol,
    settings.currency
  );
  const shipping =
    order.shipping_cents === 0
      ? "Complimentary"
      : formatMoney(
          order.shipping_cents,
          settings.currency_symbol,
          settings.currency
        );

  const trackUrl = orderTrackingUrl(order);
  const subject = `Order Confirmation #${order.order_number} — ${settings.store_name}`;

  const textLines = [
    `Thank you, ${order.customer_name}.`,
    `We have received your order #${order.order_number} for ${total}.`,
    "",
    "ORDER ITEMS:",
    ...(order.items || []).map((i) => {
      const variant = [i.selected_color, i.selected_material]
        .filter(Boolean)
        .join(" / ");
      return `• ${i.product_name}${variant ? ` (${variant})` : ""} × ${i.quantity} — ${formatMoney(i.unit_price_cents * i.quantity, settings.currency_symbol, settings.currency)}`;
    }),
    "",
    `Subtotal: ${subtotal}`,
    `Shipping: ${shipping}`,
    `Total: ${total}`,
    "",
    `Shipping Address:`,
    `${order.customer_name}`,
    `${order.shipping_address}`,
    `${order.shipping_city}`,
    "",
    `Track your fulfillment in real-time: ${trackUrl}`,
    "",
    `With appreciation,`,
    `${settings.store_name} Concierge`,
  ];

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 32px 16px; background-color: #F4F0E8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1C18; line-height: 1.6;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #FFFFFF; border-radius: 24px; border: 1px solid rgba(26, 28, 24, 0.08); box-shadow: 0 8px 30px rgba(0,0,0,0.04); overflow: hidden;">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 40px 36px 24px 36px; text-align: center; border-bottom: 1px solid rgba(26, 28, 24, 0.08); background-color: #FAF9F6;">
              <div style="font-family: Georgia, serif; font-size: 28px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #1A1C18;">
                ${settings.store_name}
              </div>
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 2.5px; color: #8A927A; margin-top: 6px; font-weight: 600;">
                ${settings.tagline || "Modern Living, Simplified"}
              </div>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px;">
              <span style="display: inline-block; padding: 4px 10px; background-color: #8A927A; color: #FFFFFF; font-size: 10px; font-family: monospace; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px; margin-bottom: 16px;">
                Order Confirmed
              </span>
              <h1 style="font-family: Georgia, serif; font-size: 26px; font-weight: bold; color: #1A1C18; margin: 0 0 12px 0;">
                Thank you for your order, ${order.customer_name}.
              </h1>
              <p style="font-size: 14px; color: #4A483E; margin: 0 0 24px 0;">
                We have registered your commission and our fulfillment studio in Småland is preparing your essentials with care. Reference: <strong>#${order.order_number}</strong>.
              </p>

              <!-- Order Items Table -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid #F4F0E8;">
                    <th align="left" style="padding: 10px 0; font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; color: #8A927A;">Item</th>
                    <th align="center" style="padding: 10px 0; font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; color: #8A927A;">Qty</th>
                    <th align="right" style="padding: 10px 0; font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; color: #8A927A;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${(order.items || [])
                    .map((item) => {
                      const variantDetails = [item.selected_color, item.selected_material]
                        .filter(Boolean)
                        .join(" · ");
                      return `
                        <tr style="border-bottom: 1px solid rgba(26, 28, 24, 0.06);">
                          <td style="padding: 14px 0;">
                            <div style="font-size: 14px; font-weight: 600; color: #1A1C18;">${item.product_name}</div>
                            ${variantDetails ? `<div style="font-size: 11px; color: #8A927A; font-family: monospace; margin-top: 2px;">${variantDetails}</div>` : ""}
                          </td>
                          <td align="center" style="padding: 14px 0; font-size: 13px; color: #4A483E; font-family: monospace;">
                            ${item.quantity}
                          </td>
                          <td align="right" style="padding: 14px 0; font-size: 14px; font-weight: 600; color: #1A1C18; font-family: monospace;">
                            ${formatMoney(item.unit_price_cents * item.quantity, settings.currency_symbol, settings.currency)}
                          </td>
                        </tr>
                      `;
                    })
                    .join("")}
                </tbody>
              </table>

              <!-- Totals Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF9F6; border-radius: 12px; padding: 16px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 4px 16px; font-size: 13px; color: #77766E;">Subtotal</td>
                  <td align="right" style="padding: 4px 16px; font-size: 13px; font-family: monospace; color: #1A1C18;">${subtotal}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 16px; font-size: 13px; color: #77766E;">Shipping & Handling</td>
                  <td align="right" style="padding: 4px 16px; font-size: 13px; font-family: monospace; color: #1A1C18;">${shipping}</td>
                </tr>
                <tr style="border-top: 1px solid rgba(26, 28, 24, 0.1);">
                  <td style="padding: 10px 16px 4px 16px; font-size: 15px; font-weight: bold; color: #1A1C18;">Total</td>
                  <td align="right" style="padding: 10px 16px 4px 16px; font-size: 16px; font-weight: bold; font-family: monospace; color: #1A1C18;">${total}</td>
                </tr>
              </table>

              <!-- Shipping Destination -->
              <div style="background-color: #FFFFFF; border: 1px solid rgba(26, 28, 24, 0.1); border-radius: 12px; padding: 16px; margin-bottom: 28px;">
                <div style="font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; color: #8A927A; margin-bottom: 6px;">
                  Delivery Destination
                </div>
                <div style="font-size: 13px; font-weight: 600; color: #1A1C18;">${order.customer_name}</div>
                <div style="font-size: 13px; color: #4A483E; margin-top: 2px;">${order.shipping_address}</div>
                <div style="font-size: 13px; color: #4A483E;">${order.shipping_city}</div>
                ${order.shipping_notes ? `<div style="font-size: 12px; color: #B78E69; margin-top: 6px; font-style: italic;">Courier Note: ${order.shipping_notes}</div>` : ""}
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0 16px 0;">
                <a href="${trackUrl}" style="display: inline-block; background-color: #1A1C18; color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 13px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;">
                  Track Order in Sanctuary →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #FAF9F6; border-top: 1px solid rgba(26, 28, 24, 0.08); text-align: center;">
              <p style="font-size: 12px; color: #77766E; margin: 0 0 6px 0;">
                Questions regarding your dispatch? Reach our private concierge at <a href="mailto:${settings.support_email || "concierge@kstore.com"}" style="color: #1A1C18; font-weight: 600;">${settings.support_email || "concierge@kstore.com"}</a>.
              </p>
              <div style="font-size: 11px; color: #8A927A; margin-top: 8px;">
                © ${new Date().getFullYear()} ${settings.store_name} Studio · Scandinavian Architectural Living
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await sendEmail(
    { to: order.customer_email, subject, html, text: textLines.join("\n") },
    settings
  );

  // If support email is configured, notify internal concierge
  if (settings.support_email && settings.support_email !== order.customer_email) {
    await sendEmail(
      {
        to: settings.support_email,
        subject: `[Internal Dispatch] New Order #${order.order_number} Received`,
        text: `New order #${order.order_number} from ${order.customer_name} (${order.customer_email}) for ${total}.\n\nAdmin review: ${site}/admin/orders/${order.id}`,
        html: `<p>New order <strong>#${order.order_number}</strong> from ${order.customer_name} (${order.customer_email}) for <strong>${total}</strong>.</p><p><a href="${site}/admin/orders/${order.id}">Inspect in Admin</a></p>`,
      },
      settings
    );
  }
}

/**
 * 2. ORDER STATUS UPDATE EMAIL
 */
export async function sendOrderStatusEmail(
  order: Order,
  settings: StoreSettings,
  note: string
) {
  const trackUrl = orderTrackingUrl(order);
  const subject = `Update on Order #${order.order_number} — ${settings.store_name}`;

  const text = [
    `Dear ${order.customer_name},`,
    "",
    `Your order #${order.order_number} has an updated fulfillment status:`,
    note,
    "",
    `Track your delivery progress: ${trackUrl}`,
    "",
    `With appreciation,`,
    `${settings.store_name} Concierge`,
  ].join("\n");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 32px 16px; background-color: #F4F0E8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1C18; line-height: 1.6;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 24px; border: 1px solid rgba(26, 28, 24, 0.08); box-shadow: 0 4px 20px rgba(0,0,0,0.04); overflow: hidden;">
          <tr>
            <td style="padding: 32px 36px 20px 36px; text-align: center; border-bottom: 1px solid rgba(26, 28, 24, 0.08); background-color: #FAF9F6;">
              <span style="font-family: Georgia, serif; font-size: 24px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #1A1C18;">
                ${settings.store_name}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px;">
              <div style="font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; color: #8A927A; margin-bottom: 8px;">
                Fulfillment Milestone
              </div>
              <h2 style="font-family: Georgia, serif; font-size: 24px; font-weight: bold; color: #1A1C18; margin: 0 0 16px 0;">
                Update on Order #${order.order_number}
              </h2>
              <div style="background-color: #FAF9F6; border-left: 3px solid #8A927A; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 14px; color: #1A1C18;">
                ${note}
              </div>
              <div style="text-align: center; margin: 30px 0 10px 0;">
                <a href="${trackUrl}" style="display: inline-block; background-color: #1A1C18; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
                  View Live Tracking Portal →
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 36px; background-color: #FAF9F6; border-top: 1px solid rgba(26, 28, 24, 0.08); text-align: center; font-size: 11px; color: #8A927A;">
              © ${new Date().getFullYear()} ${settings.store_name} Studio · Scandinavian Architectural Living
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendEmail(
    { to: order.customer_email, subject, html, text },
    settings
  );
}

/**
 * 3. NEWSLETTER WELCOME EMAIL (With Promo Code WELCOME20)
 */
export async function sendNewsletterWelcomeEmail(
  email: string,
  settings: Partial<StoreSettings>
) {
  const site = getSiteUrl();
  const storeName = settings.store_name || APP_NAME;
  const subject = `Welcome to the ${storeName} Private Collector Circle`;

  const text = [
    `Welcome to ${storeName}.`,
    "",
    "Thank you for joining our private circle of Scandinavian design connoisseurs.",
    "As our welcome token, please enjoy 20% off your first commission of $250 or more with code:",
    "",
    "   WELCOME20",
    "",
    `Explore the catalog: ${site}/shop`,
    "",
    `Warm regards,`,
    `${storeName} Curators`,
  ].join("\n");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 32px 16px; background-color: #F4F0E8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1C18; line-height: 1.6;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 24px; border: 1px solid rgba(26, 28, 24, 0.08); box-shadow: 0 4px 20px rgba(0,0,0,0.04); overflow: hidden;">
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: center; border-bottom: 1px solid rgba(26, 28, 24, 0.08); background-color: #FAF9F6;">
              <span style="font-family: Georgia, serif; font-size: 26px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #1A1C18;">
                ${storeName}
              </span>
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #8A927A; margin-top: 4px; font-weight: 600;">
                The Art of Living Well
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px;">
              <h2 style="font-family: Georgia, serif; font-size: 24px; font-weight: bold; color: #1A1C18; margin: 0 0 12px 0;">
                Make room for what matters.
              </h2>
              <p style="font-size: 14px; color: #4A483E; margin: 0 0 24px 0;">
                Thank you for subscribing to our private dispatch. You will receive private previews of seasonal capsule releases, editorial interviews on functional craftsmanship, and exclusive collector events.
              </p>
              
              <!-- Voucher Box -->
              <div style="background-color: #FAF9F6; border: 1px dashed rgba(26, 28, 24, 0.2); border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 1.5px; color: #8A927A; display: block; margin-bottom: 8px;">
                  Welcome Gift Code
                </span>
                <span style="font-family: monospace; font-size: 30px; font-weight: bold; letter-spacing: 4px; color: #1A1C18; display: block;">
                  WELCOME20
                </span>
                <span style="font-size: 12px; color: #B78E69; display: block; margin-top: 8px;">
                  Enjoy 20% off your first commission of $250 or more.
                </span>
              </div>

              <div style="text-align: center; margin-top: 28px;">
                <a href="${site}/shop" style="display: inline-block; background-color: #1A1C18; color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
                  Discover Living Essentials →
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 36px; background-color: #FAF9F6; border-top: 1px solid rgba(26, 28, 24, 0.08); text-align: center; font-size: 11px; color: #8A927A;">
              © ${new Date().getFullYear()} ${storeName} Studio · Scandinavian Architectural Living
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html, text }, settings);
}

/**
 * 4. CONCIERGE & CONTACT INQUIRY EMAIL
 */
export async function sendContactInquiryEmail(
  inquiry: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    category?: string;
    message: string;
  },
  settings: Partial<StoreSettings>
) {
  const storeName = settings.store_name || APP_NAME;
  const supportEmail = settings.support_email || "concierge@kstore.com";

  // 1. Notify Store Concierge
  const internalSubject = `[Inquiry] ${inquiry.subject} — From ${inquiry.name}`;
  const internalText = [
    `New concierge inquiry received:`,
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Phone: ${inquiry.phone || "Not provided"}`,
    `Category: ${inquiry.category || "General"}`,
    `Subject: ${inquiry.subject}`,
    "",
    "MESSAGE:",
    inquiry.message,
  ].join("\n");

  const internalHtml = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;color:#1A1C18;">
      <h2 style="margin:0 0 12px">New Concierge Inquiry</h2>
      <p><strong>Name:</strong> ${inquiry.name}<br/>
      <strong>Email:</strong> <a href="mailto:${inquiry.email}">${inquiry.email}</a><br/>
      <strong>Phone:</strong> ${inquiry.phone || "N/A"}<br/>
      <strong>Category:</strong> ${inquiry.category || "General"}<br/>
      <strong>Subject:</strong> ${inquiry.subject}</p>
      <div style="background:#F4F0E8;padding:16px;border-radius:12px;margin-top:12px;">
        <p style="white-space:pre-wrap;margin:0;">${inquiry.message}</p>
      </div>
    </div>
  `;

  await sendEmail(
    {
      to: supportEmail,
      subject: internalSubject,
      html: internalHtml,
      text: internalText,
      replyTo: inquiry.email,
    },
    settings
  );

  // 2. Send immediate acknowledgment receipt to the customer
  const ackSubject = `We received your inquiry — ${storeName} Concierge`;
  const ackText = [
    `Dear ${inquiry.name},`,
    "",
    `Thank you for reaching out to the ${storeName} Concierge team.`,
    `We have received your message regarding "${inquiry.subject}". Our dedicated team in Småland will review your request and reply within 24 hours.`,
    "",
    "Your message:",
    inquiry.message,
    "",
    `With appreciation,`,
    `${storeName} Concierge Team`,
  ].join("\n");

  const ackHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${ackSubject}</title>
      </head>
      <body style="margin: 0; padding: 32px 16px; background-color: #F4F0E8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1C18; line-height: 1.6;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 24px; border: 1px solid rgba(26, 28, 24, 0.08); overflow: hidden;">
          <tr>
            <td style="padding: 32px; text-align: center; border-bottom: 1px solid rgba(26, 28, 24, 0.08); background-color: #FAF9F6;">
              <span style="font-family: Georgia, serif; font-size: 24px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #1A1C18;">
                ${storeName}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px;">
              <h2 style="font-family: Georgia, serif; font-size: 22px; font-weight: bold; color: #1A1C18; margin: 0 0 12px 0;">
                Inquiry Received
              </h2>
              <p style="font-size: 14px; color: #4A483E; margin: 0 0 16px 0;">
                Dear ${inquiry.name}, thank you for contacting our concierge. We have registered your message and a design specialist will respond within 24 hours.
              </p>
              <div style="background-color: #FAF9F6; border-radius: 12px; padding: 16px; font-size: 13px; color: #1A1C18; font-style: italic;">
                "${inquiry.message}"
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 36px; background-color: #FAF9F6; border-top: 1px solid rgba(26, 28, 24, 0.08); text-align: center; font-size: 11px; color: #8A927A;">
              © ${new Date().getFullYear()} ${storeName} Concierge
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendEmail({ to: inquiry.email, subject: ackSubject, html: ackHtml, text: ackText }, settings);
}

/**
 * 5. ADMIN SMTP TEST EMAIL
 */
export async function sendTestEmail(toEmail: string, settings?: Partial<StoreSettings>) {
  const storeName = settings?.store_name || APP_NAME;
  const subject = `[Diagnostic] Nodemailer SMTP Test from ${storeName}`;
  const timestamp = new Date().toLocaleString();

  const text = [
    `This is an automated diagnostic test message from ${storeName}.`,
    `Dispatched at: ${timestamp}`,
    `If you received this message, your Nodemailer SMTP transport is operating seamlessly.`,
  ].join("\n");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background: #FAF9F6; border-radius: 16px; border: 1px solid rgba(26,28,24,0.1); max-width: 500px; color: #1A1C18;">
      <h3 style="margin: 0 0 8px 0; color: #8A927A; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Nodemailer Transport Verified</h3>
      <h2 style="margin: 0 0 12px 0; font-size: 20px;">${storeName} SMTP Test Successful</h2>
      <p style="font-size: 14px; color: #4A483E; margin: 0 0 16px 0;">
        Your mail transport server successfully negotiated and transferred this dispatch at <strong>${timestamp}</strong>.
      </p>
      <div style="font-size: 11px; font-family: monospace; background: #FFFFFF; padding: 12px; border-radius: 8px; border: 1px solid #E5E0D8;">
        Transporter: Nodemailer / Node.js<br/>
        Target: ${toEmail}<br/>
        Status: 250 OK
      </div>
    </div>
  `;

  return sendEmail({ to: toEmail, subject, html, text }, settings);
}
