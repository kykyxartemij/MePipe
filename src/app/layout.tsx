import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "MePipe",
  description: "YouTube-like video platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
