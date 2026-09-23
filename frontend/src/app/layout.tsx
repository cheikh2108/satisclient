import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '../styles/globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'SatisClient | Plateforme de satisfaction et réclamations',
  description: 'Transformez vos avis et réclamations en amélioration continue',
  keywords: ['satisfaction client', 'réclamations', 'feedback', 'NPS', 'CSAT', 'qualité'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
