'use client';

import { SessionProvider } from 'next-auth/react';

import Layout from '../components/Layout'; // Adjust the path if necessary
import { UserProvider, useUser } from '@/context/UserContext';

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
          <UserProvider> {/* Wrap with UserProvider */}
            <Layout>{children}</Layout> {/* Wrap with your custom Layout */}
          </UserProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
