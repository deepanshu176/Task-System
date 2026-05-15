import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { SWRProvider } from "@/components/SWRProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lumina | High-Velocity Work OS",
  description: "The next-generation productivity platform for high-performance teams.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} selection:bg-lumina-primary/30`}>
        <SWRProvider>
          {children}
        </SWRProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
