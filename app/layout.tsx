import BottomNav from "@/components/BottomNav";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digital Closet",
  description: "Digital Closet App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className={`${geistSans.variable} antialiased space-y-4 pb-16`}>
        <Navbar />
        <main className="max-w-6xl mx-auto p-4">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
