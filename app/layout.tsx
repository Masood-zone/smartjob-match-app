import type { Metadata, Viewport } from "next";
import { EB_Garamond, Geist, Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers/providers";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Qualify Job Match",
    template: "%s | Qualify Job Match",
  },
  description:
    "Qualify Job Match is a warm, qualification-first recruitment platform that connects verified talent with roles based on skills, credentials, and real fit.",
  keywords: [
    "Qualify Job Match",
    "smart job matching",
    "qualification-based hiring",
    "recruitment platform",
    "job seekers",
    "employers",
    "verified credentials",
    "skills matching",
  ],
  authors: [{ name: "Qualify Job Match" }],
  creator: "Qualify Job Match",
  publisher: "Qualify Job Match",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Qualify Job Match",
    description:
      "A qualification-first recruitment platform built to match verified professionals with the right opportunities.",
    siteName: "Qualify Job Match",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qualify Job Match",
    description:
      "A qualification-first recruitment platform built to match verified professionals with the right opportunities.",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf5ee" },
    { media: "(prefers-color-scheme: dark)", color: "#231915" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        manrope.variable,
        ebGaramond.variable,
        "font-sans",
      )}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
