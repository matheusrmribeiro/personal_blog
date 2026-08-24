import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { siteDescription, siteName, siteUrl } from '@/lib/site';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: `${siteName} — Software & Design Journal`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: 'Matt' }],
  creator: 'Matt',
  category: 'technology',
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: '/',
    siteName,
    images: [{ url: '/og.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: ['/og.png'],
  },
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}try{var k="workbench-notes:archive-view";var s=function(){var v=localStorage.getItem(k);document.documentElement.setAttribute("data-archive-view",v==="list"?"list":"cards")};s();window.addEventListener("storage",function(e){if(e.key===k||e.key===null)s()})}catch(e){document.documentElement.setAttribute("data-archive-view","cards")}})()',
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
