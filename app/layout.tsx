import './globals.css';
import type { Metadata } from 'next';
import { Manrope, Space_Grotesk } from 'next/font/google';
import { APP_URL } from '../lib/app-config';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: { default: 'prodicii - Launch Your Online Store in Minutes', template: '%s | prodicii' },
  description: 'Create your professional online store, showcase products, and accept UPI payments instantly. Built for the modern Indian entrepreneur.',
  keywords: ['online store builder', 'UPI payments', 'ecommerce platform India', 'sell online India', 'digital storefront', 'prodicii', 'create online shop'],
  authors: [{ name: 'prodicii Team' }],
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'prodicii - Launch Your Online Store in Minutes',
    description: 'Create your professional online store and accept UPI payments instantly. Built for Indian sellers.',
    url: APP_URL,
    siteName: 'prodicii',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'prodicii - Launch Your Online Store in Minutes',
    description: 'Create your professional online store and accept UPI payments instantly. Built for Indian sellers.',
  },
  verification: {
    google: 'google5a954939909bdfc9',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} min-h-screen antialiased`}
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'prodicii',
              url: APP_URL,
              logo: `${APP_URL}/icon.png`,
              description: 'Create your professional online store and accept UPI payments instantly. Built for Indian sellers.',
              sameAs: [
                // Add social links here if available
              ],
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
