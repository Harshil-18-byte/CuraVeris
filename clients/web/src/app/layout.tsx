import type { Metadata } from 'next';
import React from 'react';
import { QueryProvider } from '../providers/QueryProvider';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'CuraVeris — Your bill. Your rights.',
  description:
    'Your bill. Your rights. Automated medical billing audit and patient financial advocacy engine for the Indian healthcare system.',
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
