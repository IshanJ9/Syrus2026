import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GemForge — AI Jewelry Studio",
  description: "AI-powered 2D to 3D jewelry generation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
