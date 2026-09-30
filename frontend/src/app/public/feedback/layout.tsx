import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Donner mon avis — SatisClient',
  description: 'Partagez votre expérience en quelques secondes.',
  robots: { index: false, follow: false },
};

export default function PublicFeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
