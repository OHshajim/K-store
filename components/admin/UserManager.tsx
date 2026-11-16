"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  DollarSign,
  UserCheck,
  UserPlus,
  Briefcase,
} from "lucide-react";
import { formatMoney } from "@/lib/format";
import type { StoreSettings, UserRole } from "@/lib/types";
import { ConfirmationModal } from "@/components/shared/ConfirmationModal";

type CustomerSummary = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  order_count: number;
  spent_cents: number;
};

export function UserManager({
  customers: initialCustomers,
  settings,
}: {
  customers: CustomerSummary[];
  settings: StoreSettings | null;
}) {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerSummary[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "manager" | "customer">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    userId: string;
    email: string;
    fullName: string | null;
    targetRole: UserRole;
  } | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{
    title: string;
    subtitle: string;
    message: string;
    variant: "success" | "danger";
  } | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.email.toLowerCase().includes(q) ||
        (c.full_name && c.full_name.toLowerCase().includes(q));

      const matchesRole =
        roleFilter === "all"
          ? true
          : c.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [customers, search, roleFilter]);

  const totalSpent = customers.reduce((acc, c) => acc + c.spent_cents, 0);
  const totalOrders = customers.reduce((acc, c) => acc + c.order_count, 0);
  const adminCount = customers.filter((c) => c.role === "admin").length;
  const managerCount = customers.filter((c) => c.role === "manager").length;
  const customerCount = customers.filter((c) => c.role === "customer").length;

  function initiateRoleChange(user: CustomerSummary, targetRole: UserRole) {
    if (user.role === targetRole) return;
    setPendingRoleChange({
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
      targetRole,
    });
  }

  async function executeRoleChange() {
    if (!pendingRoleChange) return;

    const { userId, email, targetRole } = pendingRoleChange;
    setIsUpdatingRole(true);
    setUpdatingId(userId);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");

      setCustomers((prev) =>
        prev.map((c) => (c.id === userId ? { ...c, role: targetRole } : c))
      );
      setPendingRoleChange(null);
      router.refresh();

      setFeedbackModal({
        title: "Role Privileges Updated",
        subtitle: "Access Control Synchronized",
        message:
          targetRole === "admin"
            ? `Granted full Administrator access to ${email}. This user has unrestricted ownership and access control.`
            : targetRole === "manager"
            ? `Granted Store Manager permissions to ${email}. This team member can manage products, categories, orders, reviews, and journal essays.`
            : `Safely reverted ${email} to standard Customer account permissions.`,
        variant: "success",
      });
    } catch (err) {
      setPendingRoleChange(null);
      setFeedbackModal({
        title: "Role Update Failed",
        subtitle: "System Notice",
        message: err instanceof Error ? err.message : "Failed to update user role",
        variant: "danger",
      });
    } finally {
      setIsUpdatingRole(false);
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumbs & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1C18]/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A927A] uppercase tracking-wider mb-1">
            <span>Identity &amp; Access</span>
            <span>·</span>
            <span>{customers.length} Registered Accounts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C18]">
            User &amp; Customer Accounts
          </h1>
          <p className="text-xs sm:text-sm text-[#4A483E]/80">
            Inspect collector purchase histories, lifetime transaction volumes, and administrative privileges.
          </p>
        </div>

        <Link
          href="/admin"
          className="px-3.5 py-2 rounded-xl bg-white border border-[#1A1C18]/15 text-xs font-semibold text-[#1A1C18] hover:bg-[#F4F0E8] transition-colors shrink-0"
        >
          ← Back to Overview
        </Link>
      </div>

      {/* 2. Customer Telemetry Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#4A483E]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Accounts</span>
            <Users className="w-4 h-4 text-[#8A927A]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1A1C18]">{customers.length} Users</div>
          <div className="text-[10px] text-[#4A483E]/70 font-mono">
            {customerCount} Customers registered
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#4A483E]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Store Managers</span>
            <Briefcase className="w-4 h-4 text-[#B78E69]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1A1C18]">{managerCount} Managers</div>
          <div className="text-[10px] text-[#B78E69] font-mono">Store &amp; catalog managers</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#4A483E]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Administrators</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1A1C18]">
            {adminCount} {adminCount === 1 ? "Admin" : "Admins"}
          </div>
          <div className="text-[10px] text-emerald-700 font-mono">Full system authority</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#4A483E]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lifetime Gross</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1A1C18]">
            {formatMoney(totalSpent, settings?.currency_symbol ?? "$", settings?.currency ?? "USD")}
          </div>
          <div className="text-[10px] text-[#4A483E]/70 font-mono">{totalOrders} orders completed</div>
        </div>
      </div>

      {/* 3. Search and Role Filter Tabs */}
      <div className="p-4 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#4A483E]/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name or email address..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#1A1C18]/15 bg-[#FAF9F6] text-xs text-[#1A1C18] placeholder:text-[#4A483E]/50 focus:outline-none focus:ring-2 focus:ring-[#1A1C18] focus:bg-white transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#4A483E] hover:text-[#1A1C18]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: "all", label: `All Users (${customers.length})` },
            { id: "customer", label: `Customers (${customerCount})` },
            { id: "manager", label: `Store Managers (${managerCount})` },
            { id: "admin", label: `Administrators (${adminCount})` },
          ].map((tab) => {
            const isSelected = roleFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setRoleFilter(tab.id as "all" | "admin" | "manager" | "customer")
                }
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-[#1A1C18] text-white"
                    : "bg-stone-100 text-[#4A483E] hover:bg-stone-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Role Policy & Permissions Guide */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#8A927A]/15 text-[#8A927A] shrink-0 mt-0.5">
            <UserPlus className="w-5 h-5 text-[#B78E69]" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1C18] font-sans">
              Three Distinct Access Tiers
            </h4>
            <p className="text-xs text-[#4A483E]/80 mt-0.5 leading-relaxed font-sans">
              <strong className="text-[#1A1C18]">Customer:</strong> Standard shopper account. · <strong className="text-[#1A1C18]">Store Manager:</strong> Can manage products, categories, orders, reviews, and editorial journal stories. · <strong className="text-[#1A1C18]">Administrator:</strong> Full unrestricted system ownership, developer settings, and access control.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Users Table */}
      <div className="bg-white rounded-2xl border border-[#1A1C18]/10 shadow-[0_2px_12px_rgba(26,28,24,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1A1C18]/10 bg-[#FAF9F6] text-[#4A483E] uppercase font-bold tracking-wider text-[10px]">
                <th className="py-3.5 pl-6 pr-3">User Profile</th>
                <th className="py-3.5 px-3">Email Address</th>
                <th className="py-3.5 px-3">Role Privilege</th>
                <th className="py-3.5 px-3">Orders Fulfilled</th>
                <th className="py-3.5 px-3 text-right">Lifetime Spend</th>
                <th className="py-3.5 px-4 text-right pr-6">Manage Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1C18]/8">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-[#4A483E]">
                    <Users className="w-8 h-8 mx-auto text-[#8A927A] mb-2" />
                    <div className="font-bold text-[#1A1C18]">No users matched your search</div>
                    <p className="text-xs text-[#4A483E]/70 mt-1">Try resetting the keyword filter.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((user) => {
                  const displayName = user.full_name || user.email.split("@")[0];
                  const initials = displayName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  const isAdmin = user.role === "admin";
                  const isManager = user.role === "manager";

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-stone-50/80 transition-colors group"
                    >
                      {/* Avatar + Full Name */}
                      <td className="py-3.5 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isAdmin
                                ? "bg-[#1A1C18] text-white border border-[#1A1C18]"
                                : isManager
                                ? "bg-[#B78E69] text-white border border-[#B78E69]"
                                : "bg-stone-100 text-[#1A1C18] border border-[#1A1C18]/10"
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-[#1A1C18] block">
                              {displayName}
                            </span>
                            <span className="text-[10px] text-[#4A483E]/60 font-mono">
                              id: {user.id.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-3 font-mono text-xs text-[#4A483E]">
                        {user.email}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isAdmin
                              ? "bg-[#1A1C18] text-white"
                              : isManager
                              ? "bg-[#B78E69]/15 text-[#8C6239] border border-[#B78E69]/30"
                              : "bg-stone-100 text-[#4A483E] border border-stone-200"
                          }`}
                        >
                          {isAdmin ? (
                            <>
                              <ShieldCheck className="w-3 h-3 text-[#B78E69]" />
                              <span>Administrator</span>
                            </>
                          ) : isManager ? (
                            <>
                              <Briefcase className="w-3 h-3 text-[#B78E69]" />
                              <span>Store Manager</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3 text-[#8A927A]" />
                              <span>Customer</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Orders Count */}
                      <td className="py-3.5 px-3 font-mono text-xs text-[#1A1C18]">
                        <span className="font-bold">{user.order_count}</span>{" "}
                        <span className="text-[10px] text-[#4A483E]/70">orders</span>
                      </td>

                      {/* Total Spend */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-xs text-[#1A1C18]">
                        {formatMoney(
                          user.spent_cents,
                          settings?.currency_symbol ?? "$",
                          settings?.currency ?? "USD"
                        )}
                      </td>

                      {/* Manage Access Action Buttons */}
                      <td className="py-3.5 px-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          {user.role === "customer" && (
                            <>
                              <button
                                type="button"
                                disabled={updatingId === user.id}
                                onClick={() => initiateRoleChange(user, "manager")}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#B78E69]/40 bg-[#FAF7F2] text-[11px] font-semibold text-[#8C6239] hover:bg-[#B78E69] hover:text-white transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                                title={`Make ${user.email} a Store Manager`}
                              >
                                <Briefcase className="w-3 h-3" />
                                <span>Make Manager</span>
                              </button>
                              <button
                                type="button"
                                disabled={updatingId === user.id}
                                onClick={() => initiateRoleChange(user, "admin")}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#1A1C18] text-white text-[11px] font-semibold hover:bg-[#32362F] transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                                title={`Make ${user.email} an Administrator`}
                              >
                                <ShieldCheck className="w-3 h-3 text-[#B78E69]" />
                                <span>Make Admin</span>
                              </button>
                            </>
                          )}

                          {isManager && (
                            <>
                              <button
                                type="button"
                                disabled={updatingId === user.id}
                                onClick={() => initiateRoleChange(user, "admin")}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#1A1C18] text-white text-[11px] font-semibold hover:bg-[#32362F] transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                                title={`Promote ${user.email} to full Administrator`}
                              >
                                <ShieldCheck className="w-3 h-3 text-[#B78E69]" />
                                <span>Promote Admin</span>
                              </button>
                              <button
                                type="button"
                                disabled={updatingId === user.id}
                                onClick={() => initiateRoleChange(user, "customer")}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-[11px] font-semibold text-stone-600 hover:text-rose-600 hover:bg-rose-50 transition-all disabled:opacity-50 cursor-pointer"
                                title={`Revert ${user.email} to standard Customer`}
                              >
                                <ShieldAlert className="w-3 h-3 text-stone-400 group-hover:text-rose-600" />
                                <span>Revert Customer</span>
                              </button>
                            </>
                          )}

                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                disabled={updatingId === user.id}
                                onClick={() => initiateRoleChange(user, "manager")}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-[11px] font-semibold text-stone-600 hover:text-[#B78E69] hover:bg-[#FAF7F2] transition-all disabled:opacity-50 cursor-pointer"
                                title={`Demote ${user.email} to Store Manager`}
                              >
                                <Briefcase className="w-3 h-3 text-stone-400" />
                                <span>Set Manager</span>
                              </button>
                              <button
                                type="button"
                                disabled={updatingId === user.id}
                                onClick={() => initiateRoleChange(user, "customer")}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-[11px] font-semibold text-stone-600 hover:text-rose-600 hover:bg-rose-50 transition-all disabled:opacity-50 cursor-pointer"
                                title={`Revoke all administrative access from ${user.email}`}
                              >
                                <ShieldAlert className="w-3 h-3 text-stone-400 group-hover:text-rose-600" />
                                <span>Revert Customer</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#FAF9F6] border-t border-[#1A1C18]/10 flex items-center justify-between text-xs text-[#4A483E]">
          <span>
            Displaying <strong>{filteredCustomers.length}</strong> active registered profiles
          </span>
          <span className="text-[11px] font-mono text-[#8A927A]">
            Secured via Supabase Auth &amp; Role Policies (Admin · Manager · Customer)
          </span>
        </div>
      </div>

      {/* Role Change Confirmation Modal */}
      {pendingRoleChange && (
        <ConfirmationModal
          isOpen={!!pendingRoleChange}
          onClose={() => {
            if (!isUpdatingRole) setPendingRoleChange(null);
          }}
          onConfirm={executeRoleChange}
          isLoading={isUpdatingRole}
          title={
            pendingRoleChange.targetRole === "admin"
              ? "Grant Full Administrator Access?"
              : pendingRoleChange.targetRole === "manager"
              ? "Assign Store Manager Role?"
              : "Revert Account to Standard Customer?"
          }
          subtitle="Access Control & Security Policy"
          variant={
            pendingRoleChange.targetRole === "customer"
              ? "danger"
              : pendingRoleChange.targetRole === "admin"
              ? "warning"
              : "warning"
          }
          confirmText={
            pendingRoleChange.targetRole === "admin"
              ? "Yes, Grant Administrator"
              : pendingRoleChange.targetRole === "manager"
              ? "Yes, Assign Store Manager"
              : "Yes, Revert to Customer"
          }
          cancelText="Cancel Action"
          description={
            <div className="space-y-2">
              <p>
                Are you sure you want to update the role for{" "}
                <strong className="text-[#1A1C18]">{pendingRoleChange.email}</strong>?
              </p>
              {pendingRoleChange.targetRole === "admin" ? (
                <p className="text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs">
                  This user will receive full unrestricted ownership privileges across all products, orders, editorial content, store financial settings, and user access policies.
                </p>
              ) : pendingRoleChange.targetRole === "manager" ? (
                <p className="text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs">
                  This team member will be granted <strong className="text-[#1A1C18]">Store Manager</strong> access to manage inventory, catalog products, orders, customer reviews, and editorial journal stories.
                </p>
              ) : (
                <p className="text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-xs">
                  This account will be safely returned to standard Customer permissions. All administrative and management privileges will be revoked immediately.
                </p>
              )}
            </div>
          }
        />
      )}

      {/* Action Feedback Modal (Success / Error) */}
      {feedbackModal && (
        <ConfirmationModal
          isOpen={!!feedbackModal}
          onClose={() => setFeedbackModal(null)}
          title={feedbackModal.title}
          subtitle={feedbackModal.subtitle}
          variant={feedbackModal.variant}
          showCancel={false}
          confirmText="Done"
          description={<p>{feedbackModal.message}</p>}
        />
      )}
    </div>
  );
}