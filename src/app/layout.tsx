import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { EnvBadge } from "@/components/EnvBadge";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WhatList — track movies & TV with friends",
    template: "%s · WhatList",
  },
  description:
    "Keep a watchlist, log what you've watched, rate and review movies & TV shows, and follow friends to see what they're watching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
        <EnvBadge />
      </body>
    </html>
  );
}
