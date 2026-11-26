import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminProfile } from "@/lib/data/auth";
import { requireStoreSettings } from "@/lib/data/catalog";
import { getOrderById } from "@/lib/data/orders";
import { updateOrderStatus, deleteOrderById } from "@/lib/data/orderAdmin";
import { sendOrderStatusEmail } from "@/lib/email/mailer";
import {
  DELIVERY_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  payment_status: z
    .enum(["pending", "awaiting_payment", "paid", "cod_pending", "refunded", "cancelled"])
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

    const previousOrder = await getOrderById(id, undefined, true);
    const order = await updateOrderStatus({
      orderId: id,
      adminId: admin.id,
      paymentStatus: body.payment_status,
      deliveryStatus: body.delivery_status,
      adminNotes: body.admin_notes,
    });

    const paymentChanged =
      Boolean(body.payment_status) &&
      previousOrder?.payment_status !== order.payment_status;
    const deliveryChanged =
      Boolean(body.delivery_status) &&
      previousOrder?.delivery_status !== order.delivery_status;

    try {
      const settings = await requireStoreSettings();
      const note = [
        paymentChanged
          ? `Payment is now ${PAYMENT_STATUS_LABELS[order.payment_status]}.`
          : null,
        deliveryChanged
          ? `Delivery is now ${DELIVERY_STATUS_LABELS[order.delivery_status]}.`
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

    try {
      revalidatePath("/admin", "layout");
      revalidatePath("/admin", "page");
      revalidatePath("/admin/orders", "page");
      revalidatePath(`/admin/orders/${id}`, "page");
      revalidatePath("/orders", "layout");
      revalidatePath(`/orders/${id}`, "page");
      revalidatePath("/account", "page");
      revalidatePath("/track", "layout");
      revalidatePath(`/track/${order.order_number}`, "page");
    } catch {}

    return NextResponse.json({ order });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update order";
    const status = message.includes("Admin")
      ? 403
      : message.includes("Order not found")
        ? 404
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdminProfile();
    const { id } = await params;
    const deleted = await deleteOrderById(id);

    try {
      revalidatePath("/admin", "layout");
      revalidatePath("/admin", "page");
      revalidatePath("/admin/orders", "page");
      revalidatePath(`/admin/orders/${id}`, "page");
      revalidatePath("/orders", "layout");
      revalidatePath(`/orders/${id}`, "page");
      revalidatePath("/account", "page");
      revalidatePath("/track", "layout");
      revalidatePath(`/track/${deleted.orderNumber}`, "page");
    } catch {}

    return NextResponse.json({ ok: true, deleted });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete order";
    const status = message.includes("Admin")
      ? 403
      : message.includes("Order not found")
        ? 404
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
