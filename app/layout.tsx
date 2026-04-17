import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

/**
 * Inter — clean, modern sans-serif used across FinTech products.
 * Loaded with Latin subset for performance.
 */
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-headline",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Khata — Track Expenses, Settle Debts Effortlessly",
  description:
    "Voice notes and receipt scans turn into organized ledger entries automatically. Join the Khata waitlist today.",
  keywords: ["expense tracker", "ledger", "fintech", "voice notes", "receipts"],
  openGraph: {
    title: "Khata — Track Expenses, Settle Debts Effortlessly",
    description:
      "Zero data entry. Pure intelligence. Join thousands managing their finances with Khata.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
