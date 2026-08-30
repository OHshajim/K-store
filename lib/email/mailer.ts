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

export async function sendOtpEmail(email: string, code: string) {
  const subject = `${code} is your ${APP_NAME} sign-in code`;
  const text = `Your one-time code is ${code}. It expires in 10 minutes.`;
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5">
      <h1 style="font-size:20px;margin:0 0 12px">${APP_NAME}</h1>
      <p style="margin:0 0 12px">Your one-time sign-in code:</p>
      <p style="font-size:28px;letter-spacing:4px;font-weight:700;margin:0 0 12px">${code}</p>
      <p style="color:#666;margin:0">Expires in 10 minutes. If you did not request this, ignore this email.</p>
    </div>
  `;
  return sendEmail({ to: email, subject, html, text });
}

export async function sendOrderPlacedEmail(
  order: Order,
  settings: StoreSettings,
) {
  const site = getSiteUrl();
  const total = formatMoney(
    order.total_cents,
    settings.currency_symbol,
    settings.currency,
  );
  const subject = `Order ${order.order_number} received`;
  const text = [
    `Thanks ${order.customer_name}!`,
    `We received order ${order.order_number} for ${total}.`,
    settings.payment_instructions,
    `Track it: ${site}/orders/${order.id}`,
  ].join("\n\n");

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5">
      <h1 style="font-size:20px;margin:0 0 12px">Order ${order.order_number}</h1>
      <p>Thanks ${order.customer_name}. Total due: <strong>${total}</strong>.</p>
      <p>${settings.payment_instructions}</p>
      <p><a href="${site}/orders/${order.id}">View order</a></p>
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
  const site = getSiteUrl();
  const subject = `Update on order ${order.order_number}`;
  const text = `${note}\n\nView order: ${site}/orders/${order.id}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5">
      <h1 style="font-size:20px;margin:0 0 12px">${settings.store_name}</h1>
      <p>${note}</p>
      <p><a href="${site}/orders/${order.id}">View order</a></p>
    </div>
  `;
  return sendEmail({ to: order.customer_email, subject, html, text });
}
