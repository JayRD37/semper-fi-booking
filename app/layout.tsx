import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Semper Fi Booking & Entertainment | Artist Booking & Live Entertainment',
  description: 'Boutique artist representation and strategic live entertainment booking for venues, festivals, promoters, and events.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
