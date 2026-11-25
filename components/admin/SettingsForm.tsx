"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Building,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Mail,
  Send,
  Server,
} from "lucide-react";
import Image from "next/image";
import type { StoreSettings, FaqItem } from "@/lib/types";
import { ImageUploadInput } from "@/components/admin/ImageUploadInput";
import { GoogleDocEditor } from "@/components/admin/GoogleDocEditor";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [draft, setDraft] = useState({
    store_name: settings.store_name,
    tagline: settings.tagline,
    support_email: settings.support_email ?? "",
    currency: settings.currency,
    currency_symbol: settings.currency_symbol,
    shipping_dollars: String(settings.shipping_flat_cents / 100),
    free_shipping_dollars:
      settings.free_shipping_over_cents === null
        ? ""
        : String(settings.free_shipping_over_cents / 100),
    delivery_notes: settings.delivery_notes,
    about_html: settings.about_html ?? "",
    terms_html: settings.terms_html ?? "",
    privacy_html: settings.privacy_html ?? "",
    faq_html: settings.faq_html ?? "",
    faq_items: (settings.faq_items as FaqItem[] | undefined) ?? null,
    logo_url: settings.logo_url ?? "",
    favicon_url: settings.favicon_url ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [testRecipient, setTestRecipient] = useState(draft.support_email || "");
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [emailTestFeedback, setEmailTestFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [smtpStatus, setSmtpStatus] = useState<{
    isConfigured: boolean;
    host: string | null;
    port: number;
    user: string | null;
    passConfigured: boolean;
    connection?: { configured: boolean; connected: boolean; message: string };
  } | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/email/test")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) setSmtpStatus(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  async function handleSendTestEmail() {
    if (!testRecipient.trim()) {
      setEmailTestFeedback({
        success: false,
        message: "Please enter a test recipient email address.",
      });
      return;
    }
    setIsTestingEmail(true);
    setEmailTestFeedback(null);
    try {
      const res = await fetch("/api/admin/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testRecipient.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispatch test email");
      setEmailTestFeedback({
        success: true,
        message: data.message || "Diagnostic test email dispatched successfully via Nodemailer.",
      });
    } catch (err) {
      setEmailTestFeedback({
        success: false,
        message: err instanceof Error ? err.message : "Error sending test email",
      });
    } finally {
      setIsTestingEmail(false);
    }
  }

  function set<K extends keyof typeof draft>(key: K, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSavedNotice(false);
  }

  async function save() {
    setError(null);
    setSavedNotice(false);
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_name: draft.store_name,
          tagline: draft.tagline,
          support_email: draft.support_email || null,
          currency: draft.currency,
          currency_symbol: draft.currency_symbol,
          shipping_flat_cents: Math.round(Number(draft.shipping_dollars) * 100) || 0,
          free_shipping_over_cents: draft.free_shipping_dollars
            ? Math.round(Number(draft.free_shipping_dollars) * 100)
            : null,
          delivery_notes: draft.delivery_notes,
          about_html: draft.about_html || null,
          terms_html: draft.terms_html || null,
          privacy_html: draft.privacy_html || null,
          faq_html: draft.faq_html || null,
          faq_items: draft.faq_items ?? null,
          logo_url: draft.logo_url || null,
          favicon_url: draft.favicon_url || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save");
      setSavedNotice(true);
      router.refresh();
      setTimeout(() => setSavedNotice(false), 4000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save");
    } finally {
      setIsSaving(false);
    }
  }

  return (
      <div className="space-y-6 max-w-4xl">
        {/* 1. Header with Breadcrumbs & Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1C18]/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#8A927A] uppercase tracking-wider mb-1">
              <span>System Parameters</span>
              <span>·</span>
              <span>Commercial Configuration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C18]">
              Storefront Settings &amp; Global Rules
            </h1>
            <p className="text-xs sm:text-sm text-[#4A483E]/80">
              Configure currency parameters, shipping policies, customer support, and legal terms.
            </p>
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={save}
            data-btn="dark"
            style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1C18] text-white text-xs font-semibold hover:bg-[#2D302A] transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
          >
            <Save className="w-4 h-4 text-white" />
            <span style={{ color: "#FFFFFF" }}>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>

        {savedNotice && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Settings saved successfully and synchronized across the storefront!</span>
          </div>
        )}

                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* 2. Section 1: Storefront Identity */}
      <div className="p-6 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.04)] space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#1A1C18]/10">
                  <Building className="w-4 h-4 text-[#B78E69]" />
                  <h2 className="text-sm font-bold text-[#1A1C18]">Storefront Identity &amp; Branding</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
                      Store Brand Name
                    </label>
                    <input
                      type="text"
                      required
                      value={draft.store_name}
                      onChange={(e) => set("store_name", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#1A1C18]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
                      Editorial Brand Tagline
                    </label>
                    <input
                      type="text"
                      required
                      value={draft.tagline}
                      onChange={(e) => set("tagline", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#1A1C18]"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
                      Customer Support Email
                    </label>
                    <input
                      type="email"
                      value={draft.support_email}
                      onChange={(e) => set("support_email", e.target.value)}
                      placeholder="care@kstore.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#1A1C18]"
                    />
                  </div>

                  {/* Brand Logo Upload */}
                  <div className="md:col-span-2 pt-2 border-t border-[#1A1C18]/8">
                    <ImageUploadInput
                      bucket="banners"
                      label="Storefront Brand Logo (Vector SVG or Transparent PNG)"
                      value={draft.logo_url}
                      onChange={(url) => set("logo_url", url)}
                    />
                    <p className="text-[11px] text-[#4A483E]/70 mt-1">
                      Appears in top storefront navigation, luxury sidebar header, invoice receipts, and OpenGraph meta tags.
                    </p>
                  </div>

                  {/* Browser Favicon / App Icon Upload */}
                  <div className="md:col-span-2 pt-2 border-t border-[#1A1C18]/8">
                    <ImageUploadInput
                      bucket="banners"
                      label="Browser Favicon / App Icon (Square 1:1 PNG or ICO)"
                      value={draft.favicon_url}
                      onChange={(url) => set("favicon_url", url)}
                    />
                    <p className="text-[11px] text-[#4A483E]/70 mt-1">
                      Displayed in browser tabs, mobile bookmarks, and PWA home screen tiles.
                    </p>
                  </div>

                  {/* Live Brand Preview Card */}
                  {(draft.logo_url || draft.store_name) && (
                    <div className="md:col-span-2 pt-3 border-t border-[#1A1C18]/8">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-3.5 h-3.5 text-[#8A927A]" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A927A]">
                          Live Brand Appearance Preview
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Light Storefront Surface */}
                        <div className="p-4 rounded-xl bg-[#F4F0E8] border border-[#1A1C18]/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {draft.logo_url ? (
                              <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white border border-[#1A1C18]/10 shrink-0">
                                <Image
                                  src={draft.logo_url}
                                  alt="Logo preview"
                                  fill
                                  sizes="36px"
                                  className="object-contain p-1"
                                />
                              </div>
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-[#1A1C18] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {draft.store_name.slice(0, 2).toUpperCase() || "KS"}
                              </div>
                            )}
                            <div>
                              <div className="font-editorial text-base font-bold text-[#1A1C18] uppercase leading-none">
                                {draft.store_name || "Kstore"}
                              </div>
                              <div className="text-[9px] uppercase tracking-wider text-[#4A483E] mt-0.5">
                                {draft.tagline || "Modern Living, Simplified"}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 text-[#4A483E]">
                            Light Nav
                          </span>
                        </div>

                        {/* Dark Studio Surface */}
                        <div className="p-4 rounded-xl bg-[#1A1C18] border border-white/10 flex items-center justify-between text-white">
                          <div className="flex items-center gap-3">
                            {draft.logo_url ? (
                              <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white/10 border border-white/15 shrink-0">
                                <Image
                                  src={draft.logo_url}
                                  alt="Logo preview"
                                  fill
                                  sizes="36px"
                                  className="object-contain p-1"
                                />
                              </div>
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-[#B78E69] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {draft.store_name.slice(0, 2).toUpperCase() || "KS"}
                              </div>
                            )}
                            <div>
                              <div className="font-editorial text-base font-bold text-white uppercase leading-none">
                                {draft.store_name || "Kstore"}
                              </div>
                              <div className="text-[9px] uppercase tracking-wider text-[#D8C9B5] mt-0.5">
                                Studio CMS
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-[#D8C9B5]">
                            Dark Nav
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Section 2: Regional Currencies & Shipping Rules */}
              <div className="p-6 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.04)] space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#1A1C18]/10">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-sm font-bold text-[#1A1C18]">Currencies &amp; Shipping Economics</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
                      Primary Currency Code
                    </label>
                    <input
                      type="text"
                      required
                      value={draft.currency}
                      onChange={(e) => set("currency", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] font-mono"
                    />
          </div>

                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
                      Currency Symbol
                    </label>
                    <input
                      type="text"
                      required
                      value={draft.currency_symbol}
                      onChange={(e) => set("currency_symbol", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] font-mono"
                    />
          </div>

                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
                      Flat Shipping Rate ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={draft.shipping_dollars}
                      onChange={(e) => set("shipping_dollars", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] font-mono"
                    />
          </div>

                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
                      Free Shipping Over ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={draft.free_shipping_dollars}
                      onChange={(e) => set("free_shipping_dollars", e.target.value)}
                      placeholder="e.g. 150.00"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] font-mono"
                    />
            </div>

            <div className="space-y-1.5 sm:col-span-2 md:col-span-4">
              <label className="font-bold uppercase tracking-wider text-[#1A1C18] block">
                Checkout Shipping Notes &amp; Dispatch Details
              </label>
              <textarea
                rows={2}
                value={draft.delivery_notes}
                onChange={(e) => set("delivery_notes", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18]"
              />
            </div>
          </div>
      </div>

      {/* 3. Section 2.5: Nodemailer & Email Transport Diagnostics */}
      <div className="p-6 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.04)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1A1C18]/10">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#8A927A]" />
            <h2 className="text-sm font-bold text-[#1A1C18]">Email Dispatch &amp; Nodemailer Transport</h2>
          </div>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
              smtpStatus?.connection?.connected
                ? "bg-emerald-500/15 text-emerald-700"
                : smtpStatus?.isConfigured
                  ? "bg-amber-500/15 text-amber-700"
                  : "bg-[#8A927A]/15 text-[#8A927A]"
            }`}
          >
            {smtpStatus?.connection?.connected
              ? "Live SMTP Connected"
              : smtpStatus?.isConfigured
                ? "SMTP Configured (Verify Failed)"
                : "Simulation Mode"}
          </span>
        </div>

        <p className="text-xs text-[#4A483E] leading-relaxed">
          Kstore utilizes <strong>Nodemailer</strong> for order confirmations, fulfillment status milestones, newsletter welcome vouchers (<code>WELCOME20</code>), concierge inquiries, and 6-digit OTP password recovery codes.
        </p>

        {smtpStatus && (
          <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#1A1C18]/10 text-xs space-y-1.5 font-mono">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[#1A1C18]">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Server className="w-3.5 h-3.5 text-[#8A927A]" />
                Host: {smtpStatus.host || "unset"}:{smtpStatus.port}
              </span>
              <span>User: {smtpStatus.user ? smtpStatus.user : "Missing (SMTP_USER)"}</span>
              <span>Pass: {smtpStatus.passConfigured ? "Set" : "Missing (SMTP_PASS)"}</span>
            </div>
            {smtpStatus.connection?.message && (
              <p className="text-[11px] text-[#4A483E]">{smtpStatus.connection.message}</p>
            )}
          </div>
        )}

        {emailTestFeedback && (
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
              emailTestFeedback.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            {emailTestFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block">
                {emailTestFeedback.success ? "Dispatch Success" : "Dispatch Notice"}
              </span>
              <p className="mt-0.5">{emailTestFeedback.message}</p>
            </div>
          </div>
        )}

        <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#1A1C18]/10 space-y-3">
          <label className="font-bold uppercase tracking-wider text-[#1A1C18] block text-[11px] font-mono">
            Send Diagnostic Test Email
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="email"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              placeholder="Enter your destination email..."
              className="w-full sm:flex-1 px-3.5 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] bg-white font-mono"
            />
            <button
              type="button"
              disabled={isTestingEmail}
              onClick={handleSendTestEmail}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#1A1C18] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#32362F] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-white" />
              <span>{isTestingEmail ? "Testing..." : "Send Test Email"}</span>
            </button>
          </div>
          <span className="text-[10px] text-[#77766E] block font-mono">
            Uses Nodemailer SMTP transport configured in environment, with live development simulator fallback.
          </span>
        </div>
      </div>

      {/* 4. Section 3: Google Docs System for Brand Story, FAQ & Legal Policies */}
      <GoogleDocEditor
        storeName={draft.store_name}
        supportEmail={draft.support_email}
        aboutHtml={draft.about_html}
        faqHtml={draft.faq_html}
        privacyHtml={draft.privacy_html}
        termsHtml={draft.terms_html}
        onChange={(updates) => {
          setDraft((current) => ({
            ...current,
            ...(updates.about_html !== undefined ? { about_html: updates.about_html } : {}),
            ...(updates.faq_html !== undefined ? { faq_html: updates.faq_html } : {}),
            ...(updates.privacy_html !== undefined ? { privacy_html: updates.privacy_html } : {}),
            ...(updates.terms_html !== undefined ? { terms_html: updates.terms_html } : {}),
          }));
          setSavedNotice(false);
        }}
      />
    </div>
  );
}
