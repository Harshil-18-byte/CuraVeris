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
      ? "max-w-[480px]"
      : maxWidth === "lg"
      ? "max-w-[560px]"
      : "max-w-[680px]";

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        {/* Backdrop (40% opacity with 4px blur) */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[4px] transition-opacity duration-200" />

        {/* Content Container */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <DialogPrimitive.Content
            className={cn(
              "relative w-full bg-white rounded-xl shadow-xl overflow-hidden border border-border-subtle",
              "animate-modal-enter text-left",
              maxWidthClass
            )}
          >
            {/* Header */}
            {(title || description) && (
              <div className="pt-6 px-6 pb-2 pr-12">
                {title && (
                  <DialogPrimitive.Title className="font-heading font-bold text-lg text-text-primary tracking-tight">
                    {title}
                  </DialogPrimitive.Title>
                )}
                {description && (
                  <DialogPrimitive.Description className="mt-1 text-sm text-text-secondary font-normal">
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
                className="absolute top-5 right-5 w-8 h-8 rounded-md bg-bg-secondary text-text-secondary flex items-center justify-center hover:bg-border-default hover:text-text-primary transition-colors focus:outline-none"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </DialogPrimitive.Close>

            {/* Body */}
            <div className="p-6">{children}</div>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
