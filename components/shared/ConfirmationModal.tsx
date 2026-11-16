"use client";

import { useEffect, type ReactNode } from "react";
import { AlertCircle, AlertTriangle, Trash2, CheckCircle2, X } from "lucide-react";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  title: string;
  subtitle?: string;
  description: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "neutral" | "success";
  isLoading?: boolean;
  showCancel?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle = "Confirmation Required",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  showCancel = true,
}: ConfirmationModalProps) {
  // Close on Escape key press and manage body scroll
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <Trash2 className="w-5 h-5 text-rose-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-[#8A927A]" />;
    }
  };

  const getIconWrapperClass = () => {
    switch (variant) {
      case "danger":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "warning":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-[#F4F0E8] text-[#1A1C18] border-[#1A1C18]/15";
    }
  };

  const getConfirmButtonClass = () => {
    switch (variant) {
      case "danger":
        return "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500";
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500";
      default:
        return "bg-[#1A1C18] hover:bg-[#32362F] text-white focus:ring-[#1A1C18]";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1C18]/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Overlay click catcher */}
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#1A1C18]/15 space-y-5 animate-in fade-in zoom-in-95 duration-150 z-10">
        {/* Close Button Top-Right */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#4A483E]/60 hover:text-[#1A1C18] hover:bg-[#FAF9F6] transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pr-6">
          <div
            className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${getIconWrapperClass()}`}
          >
            {getIcon()}
          </div>
          <div>
            <h3 className="font-editorial text-xl font-bold text-[#1A1C18] leading-tight">
              {title}
            </h3>
            <span className="text-[11px] font-mono text-[#8A927A] uppercase tracking-wider block mt-0.5">
              {subtitle}
            </span>
          </div>
        </div>

        {/* Description Body */}
        <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#1A1C18]/10 text-xs text-[#4A483E] leading-relaxed space-y-2">
          {typeof description === "string" ? (
            <p className="font-medium text-[#1A1C18]">{description}</p>
          ) : (
            description
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {showCancel && (
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs font-semibold text-[#1A1C18] hover:bg-stone-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (onConfirm) {
                onConfirm();
              } else {
                onClose();
              }
            }}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50 ${getConfirmButtonClass()}`}
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
