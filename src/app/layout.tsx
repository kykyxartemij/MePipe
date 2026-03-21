import type { Metadata } from 'next';
import './globals.css';
import Navbar from './Navbar';
import QueryProvider from '@/providers/QueryProvider';
import { ArtSnackbarProvider } from '@/components/ui/ArtSnackbar';
import { ArtDialogProvider } from '@/components/ui/ArtDialog';

export const metadata: Metadata = {
  title: 'MePipe',
  description: 'YouTube-like video platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <ArtSnackbarProvider>
          <ArtDialogProvider>
            <Navbar />
            <main className="w-full max-w-screen-2xl mx-auto px-2 py-3">{children}</main>
          </ArtDialogProvider>
          </ArtSnackbarProvider>
        </QueryProvider>
      </body>
    </html>
  );
}