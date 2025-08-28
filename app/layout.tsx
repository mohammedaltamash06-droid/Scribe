// app/layout.tsx (Server Component)
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import ClientToaster from "@/components/ClientToaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scribe — RCM Medical Transcription",
  description: "Advanced medical transcription and billing management system",
  keywords: "medical transcription, RCM, healthcare, billing",
  // If you're on Next 13.4+, consider using `export const viewport` instead.
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ReactQueryProvider>

        {/* Client-only toasters (e.g., Sonner/Radix Toaster) mounted safely */}
        <ClientToaster />
      </body>
    </html>
  );
}
