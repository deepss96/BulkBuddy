import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
export const metadata: Metadata = {
  title: 'BulkBuddy',
  description: 'WhatsApp Automation & Bulk Messaging Software',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          {children}
          <Toaster position="top-right" />
        </AppProvider>
      </body>
    </html>
  );
}
