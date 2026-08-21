import type { Metadata } from 'next';
import { Inter, Newsreader, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { LocaleProvider } from '@/lib/i18n/LocaleContext';
import { Toaster } from '@/lib/toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
});
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
});

export const metadata: Metadata = {
  title: 'Dossiera — PDF Tools',
  description: 'Professional PDF tools with AI-powered document intelligence.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable} ${plexMono.variable}`}>
      <body className="font-sans min-h-screen bg-surface text-ink">
        <LocaleProvider>
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </LocaleProvider>
      </body>
    </html>
  );
}
