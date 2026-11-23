"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
} from "lucide-react";
import type { StoreSettings } from "@/lib/types";

export function ContactView({ settings }: { settings: StoreSettings }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("Order & Dispatch Inquiry");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setSuccessNotice(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          category,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to send inquiry");
      }

      setSuccessNotice(
        data.message ||
          "Your inquiry has been delivered to our concierge team. We will respond within 24 hours."
      );
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setErrorNotice(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#8A927A] uppercase tracking-wider">
          <Link href="/" className="hover:text-[#1A1C18] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#1A1C18] font-bold">Concierge &amp; Care</span>
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-[#B78E69] font-sans block">
          Client Services &amp; Trade Inquiries
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[#1A1C18]">
          Connect with Our Studio
        </h1>
        <p className="text-sm sm:text-base text-[#4A483E] leading-relaxed max-w-2xl">
          Whether you are tracking an international dispatch, specifying bespoke dimensions for an architectural project, or requesting material samples, our team is at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Form (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-[#1A1C18]/10 shadow-xs space-y-6">
          <div>
            <h2 className="font-editorial text-2xl font-bold text-[#1A1C18]">
              Send an Inquiry
            </h2>
            <p className="text-xs text-[#77766E] mt-1 font-sans">
              All messages are dispatched immediately to our concierge desk via Nodemailer.
            </p>
          </div>

          {successNotice && (
            <div className="p-4 rounded-2xl bg-[#8A927A]/15 border border-[#8A927A]/30 flex items-start gap-3 text-xs sm:text-sm text-[#1A1C18]">
              <CheckCircle2 className="w-5 h-5 text-[#8A927A] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Inquiry Dispatched</span>
                <p className="text-[#4A483E] mt-0.5">{successNotice}</p>
              </div>
            </div>
          )}

          {errorNotice && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs sm:text-sm text-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Transmission Error</span>
                <p className="mt-0.5">{errorNotice}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1C18] uppercase tracking-wider mb-1.5 font-mono">
                  Full Name <span className="text-[#B78E69]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Astrid Lindgren"
                  className="w-full px-4 py-3 rounded-xl border border-[#1A1C18]/15 bg-[#FAF9F6] text-xs text-[#1A1C18] focus:outline-hidden focus:ring-2 focus:ring-[#1A1C18] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1C18] uppercase tracking-wider mb-1.5 font-mono">
                  Email Address <span className="text-[#B78E69]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-4 py-3 rounded-xl border border-[#1A1C18]/15 bg-[#FAF9F6] text-xs text-[#1A1C18] focus:outline-hidden focus:ring-2 focus:ring-[#1A1C18] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1C18] uppercase tracking-wider mb-1.5 font-mono">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 rounded-xl border border-[#1A1C18]/15 bg-[#FAF9F6] text-xs text-[#1A1C18] focus:outline-hidden focus:ring-2 focus:ring-[#1A1C18] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1C18] uppercase tracking-wider mb-1.5 font-mono">
                  Inquiry Topic
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#1A1C18]/15 bg-[#FAF9F6] text-xs text-[#1A1C18] focus:outline-hidden focus:ring-2 focus:ring-[#1A1C18] transition-all"
                >
                  <option>Order &amp; Dispatch Inquiry</option>
                  <option>Product Specifications &amp; Materials</option>
                  <option>Architectural / Interior Trade Services</option>
                  <option>Press &amp; Editorial</option>
                  <option>General Concierge</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1C18] uppercase tracking-wider mb-1.5 font-mono">
                Subject <span className="text-[#B78E69]">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your inquiry..."
                className="w-full px-4 py-3 rounded-xl border border-[#1A1C18]/15 bg-[#FAF9F6] text-xs text-[#1A1C18] focus:outline-hidden focus:ring-2 focus:ring-[#1A1C18] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1C18] uppercase tracking-wider mb-1.5 font-mono">
                Your Message <span className="text-[#B78E69]">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your requirements, order numbers, room dimensions, or bespoke finishes..."
                className="w-full px-4 py-3 rounded-xl border border-[#1A1C18]/15 bg-[#FAF9F6] text-xs text-[#1A1C18] focus:outline-hidden focus:ring-2 focus:ring-[#1A1C18] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              data-btn="dark"
              style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
              className="w-full py-4 rounded-xl bg-[#1A1C18] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#32362F] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Dispatching via Nodemailer...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-white" style={{ color: "#FFFFFF" }} />
                  <span style={{ color: "#FFFFFF" }}>Dispatch Message to Concierge</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Studio Info & Locations (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Direct Contacts */}
          <div className="bg-[#FAF9F6] rounded-3xl p-6 sm:p-8 border border-[#1A1C18]/10 space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8A927A] font-bold block">
              Direct Channels
            </span>
            <h3 className="font-editorial text-2xl font-bold text-[#1A1C18]">
              Immediate Reach
            </h3>

            <div className="space-y-3 pt-2 text-xs text-[#4A483E]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-[#1A1C18]/10 flex items-center justify-center text-[#B78E69]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#1A1C18] block">Electronic Dispatch</span>
                  <a
                    href={`mailto:${settings.support_email || "concierge@kstore.com"}`}
                    className="hover:underline text-[#B78E69]"
                  >
                    {settings.support_email || "concierge@kstore.com"}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-[#1A1C18]/10 flex items-center justify-center text-[#B78E69]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#1A1C18] block">Studio Operating Hours</span>
                  <span>Monday – Friday: 08:00 – 20:00 CET / EST</span>
                </div>
              </div>
            </div>
          </div>

          {/* Studios */}
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A1C18] block font-mono">
              International Studios &amp; Workshops
            </span>

            {/* Småland */}
            <div className="p-5 rounded-2xl bg-white border border-[#1A1C18]/10 space-y-1 text-xs">
              <div className="flex items-center gap-2 text-[#8A927A] font-bold font-mono">
                <MapPin className="w-3.5 h-3.5" />
                <span>Småland Craftsmanship Studio</span>
              </div>
              <p className="text-[#1A1C18] font-semibold">Stenhuggargatan 14, 343 31 Älmhult, Sweden</p>
              <p className="text-[#77766E] text-[11px]">Primary timber joinery and central fulfillment facility.</p>
            </div>

            {/* Copenhagen */}
            <div className="p-5 rounded-2xl bg-white border border-[#1A1C18]/10 space-y-1 text-xs">
              <div className="flex items-center gap-2 text-[#8A927A] font-bold font-mono">
                <MapPin className="w-3.5 h-3.5" />
                <span>Copenhagen Architectural Gallery</span>
              </div>
              <p className="text-[#1A1C18] font-semibold">Bredgade 28, 1260 København K, Denmark</p>
              <p className="text-[#77766E] text-[11px]">Material library, lighting installations, and trade consultations.</p>
            </div>

            {/* Vermont */}
            <div className="p-5 rounded-2xl bg-white border border-[#1A1C18]/10 space-y-1 text-xs">
              <div className="flex items-center gap-2 text-[#8A927A] font-bold font-mono">
                <MapPin className="w-3.5 h-3.5" />
                <span>North American Design Office</span>
              </div>
              <p className="text-[#1A1C18] font-semibold">120 Church Street, Burlington, VT 05401, United States</p>
              <p className="text-[#77766E] text-[11px]">East Coast dispatch logistics and client concierge.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
