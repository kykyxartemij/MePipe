import type { Metadata } from 'next';
import './globals.css';
import Navbar from './Navbar';
import QueryProvider from '@/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'MePipe',
  description: 'YouTube-like video platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <Navbar />
          <main className="w-full px-8 py-6">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
