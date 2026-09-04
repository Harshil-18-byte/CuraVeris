"use client";

import React from "react";
import { Toaster as SonnerToaster } from "sonner";

export const ToastProvider: React.FC = () => {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        className:
          "bg-[#0E121A]/95 text-white border border-white/10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl p-4 font-body text-xs",
        style: {
          borderRadius: "1rem",
        },
      }}
    />
  );
};
