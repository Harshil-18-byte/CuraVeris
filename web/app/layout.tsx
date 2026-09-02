import type { Metadata } from "next";
import "../styles/globals.css";
import { Providers } from "@/app/providers";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "CuraVeris — Medical Bill Check",
  description: "Check your hospital bills against government price rules and get fair complaint letters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-body bg-bg-secondary text-text-primary min-h-screen antialiased selection:bg-brand-accent/20 selection:text-brand-accent">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-accent focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <Providers>
          {children}
          <ToastProvider />
        </Providers>
      </body>
    </html>
  );
}
