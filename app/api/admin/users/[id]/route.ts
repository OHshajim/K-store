import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminOnlyProfile } from "@/lib/data/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  role: z.enum(["admin", "manager", "customer"]),
});

export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await requireAdminOnlyProfile();
    const { id } = await params;
    const body = bodySchema.parse(await request.json());

    // Prevent admin from demoting themselves
    if (admin.id === id && body.role !== "admin") {
      return NextResponse.json(
        { error: "Security restriction: You cannot revoke your own administrator account." },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // 1. Update profiles table
    let updatedProfile = null;
    const { data, error: profileError } = await supabase
      .from("profiles")
      .update({ role: body.role })
      .eq("id", id)
      .select("*")
      .single();

    if (profileError) {
      // If DB constraint profiles_role_check has not yet been migrated to include manager,
      // fallback to 'admin' in profiles table while saving exact role in user_metadata
      if (
        body.role === "manager" &&
        (profileError.code === "23514" || profileError.message.includes("check constraint"))
      ) {
        const fallbackRes = await supabase
          .from("profiles")
          .update({ role: "admin" })
          .eq("id", id)
          .select("*")
          .single();

        if (fallbackRes.error) {
          throw new Error(fallbackRes.error.message || "Failed to update profile role.");
        }
        updatedProfile = { ...fallbackRes.data, role: body.role };
      } else {
        throw new Error(profileError.message || "Failed to update profile role.");
      }
    } else {
      updatedProfile = data;
    }

    // 2. Also sync auth user metadata if possible
    try {
      await supabase.auth.admin.updateUserById(id, {
        user_metadata: { role: body.role },
      });
    } catch {}

    try {
      revalidatePath("/admin", "layout");
      revalidatePath("/admin/users", "page");
    } catch {}

    return NextResponse.json({ ok: true, profile: updatedProfile });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update user role";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const admin = await requireAdminOnlyProfile();
    const { id } = await params;

    if (admin.id === id) {
      return NextResponse.json(
        { error: "Security restriction: You cannot delete your own administrator account." },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("id", id)
      .maybeSingle();

    const targetEmail = (profile?.email as string | undefined)?.trim();

    // 1. Delete user's reviews, wishlists, and orders (including guest orders matching email)
    await supabase.from("reviews").delete().eq("user_id", id);
    await supabase.from("wishlists").delete().eq("user_id", id);
    await supabase.from("orders").delete().eq("user_id", id);

    if (targetEmail) {
      await supabase
        .from("orders")
        .delete()
        .ilike("customer_email", targetEmail);
      try {
        await supabase
          .from("auth_otps")
          .delete()
          .ilike("email", targetEmail);
      } catch {}
      try {
        await supabase
          .from("newsletter_subscribers")
          .delete()
          .ilike("email", targetEmail);
      } catch {}
    }

    // 2. Delete profile row
    await supabase.from("profiles").delete().eq("id", id);

    // 3. Delete Supabase Auth user
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(id);
    if (
      deleteAuthError &&
      !deleteAuthError.message.toLowerCase().includes("not found")
    ) {
      throw new Error(deleteAuthError.message || "Failed to delete auth user.");
    }

    try {
      revalidatePath("/admin", "layout");
      revalidatePath("/admin", "page");
      revalidatePath("/admin/users", "page");
      revalidatePath("/admin/orders", "page");
      revalidatePath("/admin/reviews", "page");
    } catch {}

    return NextResponse.json({ ok: true, deletedUserId: id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete user";
    const status = message.includes("Admin") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
