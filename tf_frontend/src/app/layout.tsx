'use client';

import { SessionProvider } from 'next-auth/react';
import Layout from '../components/Layout'; // Adjust the path if necessary
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Layout>{children}</Layout> {/* Wrap with your custom Layout */}
        </SessionProvider>
      </body>
    </html>
  );
}
