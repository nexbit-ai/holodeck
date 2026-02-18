// Trigger Rebuild
import type { Metadata } from "next";
import { Nata_Sans } from "next/font/google";
import "./globals.css";
import { StytchProvider } from "./components/StytchProvider";
import { AuthProvider } from "./contexts/AuthContext";

const nataSans = Nata_Sans({
  variable: "--font-nata-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: 'swap',
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Nexbit: AI Demo Powerhouse",
  description: "Create and share interactive AI-powered demo videos with ease.",
  icons: {
    icon: "/assets/logo.jpg",
    shortcut: "/assets/logo.jpg",
    apple: "/assets/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/logo.jpg" type="image/jpeg" />
        <link rel="shortcut icon" href="/assets/logo.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/assets/logo.jpg" />
      </head>
      <body
        className={`${nataSans.variable} antialiased`}
      >
        <StytchProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </StytchProvider>
      </body>
    </html>
  );
}
