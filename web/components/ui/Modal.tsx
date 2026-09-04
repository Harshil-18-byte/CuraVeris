"use client";

import React, { useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const maxWidthClass =
    maxWidth === "sm"
      ? "max-w-[400px]"
      : maxWidth === "md"
      ? "max-w-[500px]"
      : maxWidth === "lg"
      ? "max-w-[620px]"
      : "max-w-[740px]";

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        {/* Backdrop (Dark glass with blur) */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md transition-opacity duration-200" />

        {/* Content Container */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <DialogPrimitive.Content
            className={cn(
              "relative w-full bg-gradient-to-b from-[#121622]/95 to-[#0A0D14]/98 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden border border-white/10 backdrop-blur-2xl",
              "animate-modal-enter text-left text-neutral-200",
              maxWidthClass
            )}
          >
            {/* Top Shine Bar */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            {/* Header */}
            {(title || description) && (
              <div className="pt-6 px-6 sm:px-8 pb-2 pr-14">
                {title && (
                  <DialogPrimitive.Title className="font-heading font-bold text-lg text-white tracking-tight">
                    {title}
                  </DialogPrimitive.Title>
                )}
                {description && (
                  <DialogPrimitive.Description className="mt-1 text-xs text-neutral-400 font-normal">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>
            )}

            {/* Close Button */}
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-white/10 text-neutral-400 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors focus:outline-none"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </DialogPrimitive.Close>

            {/* Body */}
            <div className="p-6 sm:p-8">{children}</div>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
