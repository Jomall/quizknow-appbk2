import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Navbar from '@/components/Navbar-enhanced';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tec-Net Solutions QuizKnow",
  description: "A modern quiz platform built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main>
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
