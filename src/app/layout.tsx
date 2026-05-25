import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'BoardMate | Learn board games at the table',
  description:
    'Setup guides, turn-by-turn help, and quick rule lookups while you play. Join the BoardMate beta waitlist.',
  openGraph: {
    title: 'BoardMate | Learn board games at the table',
    description:
      'Learn new board games by playing through setup and each turn. Quick rules when you need them. Join the beta waitlist.',
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
