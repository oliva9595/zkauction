import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "zkAuction - Private Sealed-Bid Auctions",
  description:
    "Private sealed-bid auctions with real Noir proofs and settlement on Stellar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceMono.variable} h-full bg-[var(--canvas)] text-[var(--text-primary)] antialiased dark`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="w-full flex-1">{children}</main>
      </body>
    </html>
  );
}
