import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "./components/providers";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "GoCraft | Learn Go by building real things",
  description:
    "Practical Go challenges with short lessons, browser-based checks, XP, streaks, friends, and a virtual marketplace.",
  applicationName: "GoCraft",
  keywords: [
    "Go",
    "Golang",
    "learn to code",
    "coding challenges",
    "developer learning",
    "XP",
    "engineering practice",
  ],
  openGraph: {
    title: "GoCraft | Learn Go by building real things",
    description:
      "Write code. Solve challenges. Earn XP. Practical Go challenges for developers.",
    siteName: "GoCraft",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f8fa",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
