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
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[4px] transition-opacity duration-200" />

        {/* Bottom Sheet Drawer */}
        <DialogPrimitive.Content
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-xl shadow-xl overflow-hidden",
            "max-h-[85vh] flex flex-col animate-bottom-sheet-enter text-left",
            "border-t border-border-subtle"
          )}
        >
          {/* Grab Handle */}
          <div className="w-9 h-1 bg-border-default rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />

          {/* Header */}
          {(title || description) && (
            <div className="px-6 py-3 border-b border-border-subtle flex items-start justify-between">
              <div>
                {title && (
                  <DialogPrimitive.Title className="font-heading font-bold text-lg text-text-primary">
                    {title}
                  </DialogPrimitive.Title>
                )}
                {description && (
                  <DialogPrimitive.Description className="text-sm text-text-secondary mt-0.5">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>
              <DialogPrimitive.Close asChild>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close sheet"
                  className="w-8 h-8 rounded-md bg-bg-secondary text-text-secondary flex items-center justify-center hover:bg-border-default hover:text-text-primary transition-colors focus:outline-none"
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
