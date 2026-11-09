import nodemailer from "nodemailer";
import { APP_NAME } from "@/lib/constants";
import { getSiteUrl } from "@/lib/env";
import { formatMoney } from "@/lib/format";
import type { Order, StoreSettings } from "@/lib/types";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function fromAddress() {
  return (
    process.env.SMTP_FROM ||
    `${APP_NAME} <${process.env.SMTP_USER || "noreply@localhost"}>`
  );
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const transport = getTransport();
  if (!transport) {
    console.info("[email:demo]", input.subject, "→", input.to);
    console.info(input.text);
    return { demo: true as const };
  }

  await transport.sendMail({
    from: fromAddress(),
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  return { demo: false as const };
}

// Logged-in customers track in-app; guests follow the token link.
export function orderTrackingUrl(order: Order): string {
  const site = getSiteUrl();
  return order.user_id
    ? `${site}/orders/${order.id}`
    : `${site}/track/${order.order_number}?t=${order.tracking_token}`;
}

export async function sendOrderPlacedEmail(
  order: Order,
  settings: StoreSettings,
) {
  const total = formatMoney(
    order.total_cents,
    settings.currency_symbol,
    settings.currency,
  );
  const trackUrl = orderTrackingUrl(order);
  const subject = `Order ${order.order_number} received`;
  const text = [
    `Thanks ${order.customer_name}!`,
    `We received order ${order.order_number} for ${total}.`,
    `Track your order any time: ${trackUrl}`,
  ].join("\n\n");

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5">
      <h1 style="font-size:20px;margin:0 0 12px">Order ${order.order_number}</h1>
      <p>Thanks ${order.customer_name}. Total: <strong>${total}</strong>.</p>
      <p><a href="${trackUrl}">Track your order</a></p>
    </div>
  `;

  await sendEmail({ to: order.customer_email, subject, html, text });

  if (settings.support_email) {
    await sendEmail({
      to: settings.support_email,
      subject: `New order ${order.order_number}`,
      text: `New order ${order.order_number} from ${order.customer_name} (${order.customer_email}) — ${total}`,
      html: `<p>New order <strong>${order.order_number}</strong> from ${order.customer_name} — ${total}</p>`,
    });
  }
}

export async function sendOrderStatusEmail(
  order: Order,
  settings: StoreSettings,
  note: string,
) {
  const trackUrl = orderTrackingUrl(order);
  const subject = `Update on order ${order.order_number}`;
  const text = `${note}\n\nTrack your order: ${trackUrl}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5">
      <h1 style="font-size:20px;margin:0 0 12px">${settings.store_name}</h1>
      <p>${note}</p>
      <p><a href="${trackUrl}">Track your order</a></p>
    </div>
  `;
  return sendEmail({ to: order.customer_email, subject, html, text });
}
