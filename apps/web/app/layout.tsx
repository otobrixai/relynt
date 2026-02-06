// web/app/layout.tsx - SIMPLIFIED FOR TAILWIND CSS v4

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { OrganizationProvider } from "@/context/OrganizationContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Relynt | AI Governance Platform",
  description: "Secure, auditable logging and governance for AI-powered applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-bg-primary antialiased selection:bg-cyan-500/30 selection:text-white">
        <OrganizationProvider>
          {children}
        </OrganizationProvider>
      </body>
    </html>
  );
}