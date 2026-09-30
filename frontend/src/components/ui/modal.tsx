"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showClose?: boolean;
}

export function Modal({
  open,
  onClose,
  children,
  title,
  description,
  size = "md",
  showClose = true,
}: ModalProps) {
  const sizes = {
    sm: "w-full max-w-sm",
    md: "w-full max-w-full sm:max-w-lg",
    lg: "w-full max-w-full sm:max-w-2xl",
    xl: "w-full max-w-full sm:max-w-4xl",
    full: "w-full max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
  };

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/20 backdrop-blur-sm">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/50 dark:bg-slate-950/80 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111111] shadow-2xl",
          "animate-in slide-in-from-bottom sm:zoom-in-95 duration-200",
          "max-h-[90vh] flex flex-col",
          "rounded-t-2xl sm:rounded-2xl",
          sizes[size],
        )}
      >
        {/* Header — sticky on mobile */}
        {(title || showClose) && (
          <div className="sticky top-0 z-10 flex items-start justify-between gap-3 p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800/40 bg-white dark:bg-[#111111] rounded-t-2xl sm:rounded-t-2xl">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              )}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors"
              >
                <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Modal footer for actions
export function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800/40",
        "bg-white dark:bg-[#111111]",
        className,
      )}
    >
      {children}
    </div>
  );
}
