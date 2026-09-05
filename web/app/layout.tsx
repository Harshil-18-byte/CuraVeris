import type { Metadata, Viewport } from "next";
import "../styles/globals.css";
import { Providers } from "@/app/providers";
import { ToastProvider } from "@/components/ui/Toast";
import { Analytics } from "@vercel/analytics/next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://curaveris.in"),
  title: "CuraVeris — Your bill. Your rights.",
  description:
    "Your bill. Your rights. CuraVeris automatically audits hospital bills against official government price benchmarks and generates Section 65B dispute notices.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "CuraVeris — Your bill. Your rights.",
    description:
      "Automated medical billing audit and patient financial advocacy engine for the Indian healthcare system.",
    images: ["/logo-full.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-body bg-[#F5F7FB] text-[#202128] min-h-screen antialiased selection:bg-[#DBF1F4] selection:text-[#202128]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#202128] focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <Providers>
          {children}
          <ToastProvider />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
