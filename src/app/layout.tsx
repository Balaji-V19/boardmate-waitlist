import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'BoardMate — Learn any board game, the friendly way.',
  description:
    'BoardMate is your warm, patient board game teacher. Setup guides, clear rules, and a quick reference for table-side lookups. Join the waitlist.',
  openGraph: {
    title: 'BoardMate — Learn any board game, the friendly way.',
    description:
      'Your warm, patient board game teacher. Setup, rules, and quick references for table-side play. Join the waitlist.',
    type: 'website',
    images: ['/assets/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: '/assets/logo.png',
    apple: '/assets/logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#FFFEF0',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
