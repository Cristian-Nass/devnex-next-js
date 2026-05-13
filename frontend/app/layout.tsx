import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import ServiceWorkerRegister from './service-worker/service-worker-register';
import {Toaster} from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://netmart.app'),
  title: {
    default: 'Netmart | Web and App Development',
    template: '%s | Netmart',
  },
  description:
    'Netmart builds modern websites, web apps, and mobile applications for growing businesses.',
  applicationName: 'Netmart',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Netmart',
    title: 'Netmart | Web and App Development',
    description:
      'Netmart builds modern websites, web apps, and mobile applications for growing businesses.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Netmart | Web and App Development',
    description:
      'Netmart builds modern websites, web apps, and mobile applications for growing businesses.',
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
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        <Toaster richColors position="bottom-right" />
        {children}
      </body>
    </html>
  );
}
