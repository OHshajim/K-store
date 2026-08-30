import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminProfile } from "@/lib/data/auth";
import { getStoreSettings } from "@/lib/data/catalog";
import { updateOrderStatus } from "@/lib/data/orders";
import { sendOrderStatusEmail } from "@/lib/email/mailer";
import {
  DELIVERY_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  payment_status: z
    .enum([
      "awaiting_payment",
      "proof_submitted",
      "paid",
      "cod_pending",
      "refunded",
      "cancelled",
    ])
    .optional(),
  delivery_status: z
    .enum([
      "pending",
      "confirmed",
      "packed",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ])
    .optional(),
  admin_notes: z.string().optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await requireAdminProfile();
    const { id } = await params;
    const body = bodySchema.parse(await request.json());

    const order = await updateOrderStatus({
      orderId: id,
      adminId: admin.id,
      paymentStatus: body.payment_status,
      deliveryStatus: body.delivery_status,
      adminNotes: body.admin_notes,
    });

    try {
      const settings = await getStoreSettings();
      const note = [
        body.payment_status
          ? `Payment is now ${PAYMENT_STATUS_LABELS[body.payment_status]}.`
          : null,
        body.delivery_status
          ? `Delivery is now ${DELIVERY_STATUS_LABELS[body.delivery_status]}.`
          : null,
      ]
        .filter(Boolean)
        .join(" ");
      if (note) {
        await sendOrderStatusEmail(order, settings, note);
      }
    } catch (error) {
      console.error("admin status email failed", error);
    }

    return NextResponse.json({ order });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update order";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
