"use client";

import React, { useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
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

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md transition-opacity duration-200" />

        {/* Bottom Sheet Drawer */}
        <DialogPrimitive.Content
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-b from-[#121622]/95 to-[#0A0D14]/98 rounded-t-3xl shadow-[0_-25px_60px_rgba(0,0,0,0.8)] overflow-hidden",
            "max-h-[85vh] flex flex-col animate-bottom-sheet-enter text-left text-neutral-200",
            "border-t border-white/10 backdrop-blur-2xl"
          )}
        >
          {/* Grab Handle */}
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />

          {/* Header */}
          {(title || description) && (
            <div className="px-6 py-3 border-b border-white/[0.08] flex items-start justify-between">
              <div>
                {title && (
                  <DialogPrimitive.Title className="font-heading font-bold text-lg text-white">
                    {title}
                  </DialogPrimitive.Title>
                )}
                {description && (
                  <DialogPrimitive.Description className="text-xs text-neutral-400 mt-0.5">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>
              <DialogPrimitive.Close asChild>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close sheet"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-neutral-400 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors focus:outline-none"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </DialogPrimitive.Close>
            </div>
          )}

          {/* Body Content */}
          <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
