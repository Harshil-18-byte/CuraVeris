"use client";

import React from "react";
import { Toaster as SonnerToaster } from "sonner";

export const ToastProvider: React.FC = () => {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        className:
          "bg-white text-text-primary border border-border-subtle rounded-lg shadow-xl p-3.5 font-body text-sm",
        style: {
          borderRadius: "var(--radius-lg)",
        },
      }}
    />
  );
};
