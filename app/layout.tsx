import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "./service-worker/service-worker-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://devnex.app"),
  title: {
    default: "Devnex | Web and App Development",
    template: "%s | Devnex",
  },
  description:
    "Devnex builds modern websites, web apps, and mobile applications for growing businesses.",
  applicationName: "Devnex",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Devnex",
    title: "Devnex | Web and App Development",
    description:
      "Devnex builds modern websites, web apps, and mobile applications for growing businesses.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Devnex | Web and App Development",
    description:
      "Devnex builds modern websites, web apps, and mobile applications for growing businesses.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
