import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/data/auth";
import { getOrderById, submitPaymentProof } from "@/lib/data/orders";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { sendOrderStatusEmail } from "@/lib/email/mailer";
import { getStoreSettings } from "@/lib/data/catalog";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const proof = formData.get("proof");
    const reference = String(formData.get("reference") || "");

    if (!(proof instanceof File) || proof.size === 0) {
      return NextResponse.json(
        { error: "Payment proof file is required" },
        { status: 400 },
      );
    }

    if (proof.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Proof must be under 4MB" },
        { status: 400 },
      );
    }

    let proofUrl = `demo://payment-proof/${id}/${proof.name}`;

    if (!isDemoMode()) {
      const supabase = await createClient();
      const ext = proof.name.split(".").pop() || "jpg";
      const path = `${user.id}/${id}-${Date.now()}.${ext}`;
      const buffer = Buffer.from(await proof.arrayBuffer());
      const { error } = await supabase.storage
        .from("payment-proofs")
        .upload(path, buffer, {
          contentType: proof.type || "image/jpeg",
          upsert: false,
        });
      if (error) throw new Error(error.message);

      const { data } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(path);
      proofUrl = data.publicUrl;
    }

    const order = await submitPaymentProof({
      orderId: id,
      userId: user.id,
      proofUrl,
      reference: reference || undefined,
    });

    try {
      const settings = await getStoreSettings();
      await sendOrderStatusEmail(
        order,
        settings,
        `We received your payment proof for order ${order.order_number}. We will confirm shortly.`,
      );
    } catch (error) {
      console.error("payment email failed", error);
    }

    const fresh = await getOrderById(id, user.id);
    return NextResponse.json({ order: fresh });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit proof";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
