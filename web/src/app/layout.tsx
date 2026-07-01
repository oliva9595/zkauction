import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
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
      className={`${inter.variable} h-full bg-[var(--canvas)] text-[var(--text-primary)] antialiased dark`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="w-full flex-1">{children}</main>
      </body>
    </html>
  );
}
