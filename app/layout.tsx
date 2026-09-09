import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "nonebg — cut backgrounds, keep it free",
  description: "Remove image backgrounds for free. No ads, no signup.",
  icons: {
    icon: "/fav.png",
    shortcut: "/fav.png",
    apple: "/fav.png",
  },
  openGraph: {
    title: "nonebg — cut backgrounds, keep it free",
    description: "Remove background image secara gratis tanpa iklan!",
    url: "https://nonebg.vercel.app",
    siteName: "nonebg",
    images: [
      {
        url: "/NoneBG.png",
        width: 1200,
        height: 630,
        alt: "nonebg preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "nonebg",
    description: "Remove background image gratis tanpa iklan.",
    images: ["/NoneBG.png"],
  },
  metadataBase: new URL("https://nonebg.vercel.app"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Font Titillium Web, Cascadia Code, Edu VIC WA NT Hand Pre */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cascadia+Code:ital,wght@0,200..700;1,200..700&family=Titillium+Web:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700&family=Edu+VIC+WA+NT+Hand+Pre:wght@400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
