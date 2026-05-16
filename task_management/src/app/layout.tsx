import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { SWRProvider } from "@/components/SWRProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumina | High-Velocity Work OS",
  description: "The next-generation productivity platform for high-performance teams.",
};

const themeScript = `
  try {
    var theme = localStorage.getItem('lumina-theme');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  } catch (_) {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans selection:bg-lumina-primary/30">
        <SWRProvider>
          {children}
        </SWRProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
