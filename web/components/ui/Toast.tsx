"use client";

import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";

export const ToastProvider = () => {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        className: "bg-white border border-neutral-300 text-neutral-900 shadow-card font-body rounded-card",
        style: {
          border: "1px solid #C8C8D8",
          color: "#1A1A2E",
        },
      }}
    />
  );
};

export const toast = sonnerToast;
