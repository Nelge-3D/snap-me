import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { spaceGrotesk } from "@/lib/fonts";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#ff6b35",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://snap-me-omega.vercel.app"),
  appleWebApp: { capable: true, title: "Snap Me", statusBarStyle: "default" },
  title: "Snap Me - apprends l'anglais avec tes photos",
  description:
    "Photographie un objet autour de toi, apprends son nom en anglais, entends-le prononcer.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
