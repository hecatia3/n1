import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NoneBG - Free and no ADS Background Tool",
  description: "Free and no ADS Background Tool",
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
