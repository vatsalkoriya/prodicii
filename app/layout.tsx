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
  title: { default: 'prodicii', template: '%s | prodicii' },
  description: 'Create your online store and accept UPI payments - built for Indian sellers.',
  metadataBase: new URL(APP_URL),
  icons: {
    icon: [],
    apple: [],
    shortcut: [],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} min-h-screen antialiased`}
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {children}
      </body>
    </html>
  );
}
