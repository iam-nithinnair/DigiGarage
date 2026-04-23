import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import TopNavBar from "@/components/TopNavBar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "THE DIGITAL CURATOR | Scale Model Mastery",
  description: "Archiving automotive legends with surgical precision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-surface-dim text-on-surface selection:bg-primary-container selection:text-white font-body">
        <TopNavBar />
        {children}
        <Footer />
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  );
}
