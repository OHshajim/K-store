"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  ShieldCheck,
  ShoppingBag,
  DollarSign,
  UserCheck,
} from "lucide-react";
import { formatMoney } from "@/lib/format";
import type { StoreSettings } from "@/lib/types";

type CustomerSummary = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "customer";
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
  const [customers] = useState<CustomerSummary[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "customer">("all");

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.email.toLowerCase().includes(q) ||
        (c.full_name && c.full_name.toLowerCase().includes(q));

      const matchesRole =
        roleFilter === "all" ? true : c.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [customers, search, roleFilter]);

  const totalSpent = customers.reduce((acc, c) => acc + c.spent_cents, 0);
  const totalOrders = customers.reduce((acc, c) => acc + c.order_count, 0);

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
          <div className="text-[10px] text-[#4A483E]/70 font-mono">Authentication active</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#4A483E]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lifetime Customer Value</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1A1C18]">
            {formatMoney(totalSpent, settings?.currency_symbol ?? "$", settings?.currency ?? "USD")}
          </div>
          <div className="text-[10px] text-emerald-700 font-mono">Total customer gross</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#4A483E]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#B78E69]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1A1C18]">{totalOrders} Orders</div>
          <div className="text-[10px] text-[#B78E69] font-mono">Across registered collectors</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#4A483E]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Admin Staff</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1A1C18]">
            {customers.filter((c) => c.role === "admin").length} Admin
          </div>
          <div className="text-[10px] text-[#4A483E]/70 font-mono">Full system authority</div>
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
            { id: "customer", label: `Customers (${customers.filter((c) => c.role === "customer").length})` },
            { id: "admin", label: `Staff & Admins (${customers.filter((c) => c.role === "admin").length})` },
          ].map((tab) => {
            const isSelected = roleFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setRoleFilter(tab.id as "all" | "admin" | "customer")
                }
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${isSelected
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
                <th className="py-3.5 px-3 text-right pr-6">Lifetime Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1C18]/8">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-[#4A483E]">
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

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-stone-50/80 transition-colors group"
                    >
                      {/* Avatar + Full Name */}
                      <td className="py-3.5 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isAdmin
                                ? "bg-[#1A1C18] text-white border border-[#1A1C18]"
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
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isAdmin
                              ? "bg-[#1A1C18] text-white"
                              : "bg-stone-100 text-[#4A483E] border border-stone-200"
                            }`}
                        >
                          {isAdmin ? (
                            <>
                              <ShieldCheck className="w-3 h-3 text-[#B78E69]" />
                              <span>Administrator</span>
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
                      <td className="py-3.5 px-3 text-right pr-6 font-mono font-bold text-xs text-[#1A1C18]">
                        {formatMoney(
                          user.spent_cents,
                          settings?.currency_symbol ?? "$",
                          settings?.currency ?? "USD"
                        )}
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
            Secured via Supabase Auth &amp; Role Policies
          </span>
        </div>
      </div>
    </div>
  );
}