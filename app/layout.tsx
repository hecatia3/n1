import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NoneBG - Free and no ADS Tool",
  description: "Free no ADS Background Remove Tool",
  icons: {
    icon: "/fav.png",
    shortcut: "/fav.png",
    apple: "/fav.png",
  },
  openGraph: {
    title: "NoneBG - Free no ADS Background Tool",
    description: "Remove background image secara gratis tanpa iklan!",
    url: "https://nonebg.vercel.app",
    siteName: "NoneBG",
    images: [
      {
        url: "/NoneBG.png",
        width: 1200,
        height: 630,
        alt: "NoneBG Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NoneBG",
    description: "Remove background image gratis tanpa iklan.",
    images: ["/NoneBG.png"],
  },
  metadataBase: new URL("https://nonebg.vercel.app"),
};

// ---------------------
// INI FUNGSI YANG HARUS ADA DI layout.tsx (wajib return children)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
