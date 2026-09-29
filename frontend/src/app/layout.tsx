import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '../styles/globals.css';
import { Providers } from '@/components/providers';
import { ThemeScript } from '@/components/theme-script';

export const metadata: Metadata = {
  title: 'SatisClient — Gestion satisfaction client pour les entreprises',
  description: 'Centralisez les feedbacks, suivez les réclamations et mesurez la satisfaction de vos clients sur tous vos sites depuis une seule plateforme.',
  keywords: ['satisfaction client', 'réclamations', 'feedback', 'NPS', 'CSAT', 'qualité', 'Afrique'],
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">
        <ThemeScript />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
