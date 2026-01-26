import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { auth } from '@/lib/auth';
import Providers from '@/contexts/providers';
import { siteConfig } from '@/config/site';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: siteConfig.metadata.keywords,
  authors: [
    {
      name: siteConfig.author.name,
      url: siteConfig.author.url
    }
  ],
  creator: 'N Admin Team',
  alternates: {
    canonical: siteConfig.url
  },
  openGraph: {
    type: siteConfig.metadata.openGraph.type,
    locale: siteConfig.metadata.openGraph.locale,
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.metadata.openGraph.siteName,
    images: siteConfig.metadata.openGraph.images
  },
  twitter: {
    card: siteConfig.metadata.twitter.card,
    title: siteConfig.metadata.twitter.title,
    description: siteConfig.metadata.twitter.description,
    images: siteConfig.metadata.twitter.images,
    creator: '@guizimo'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  },
  manifest: '/site.webmanifest'
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang={siteConfig.locale.toLowerCase()} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NuqsAdapter>
          <Providers session={session}>
            <Toaster />
            {children}
          </Providers>
        </NuqsAdapter>
      </body>
    </html>
  );
}
