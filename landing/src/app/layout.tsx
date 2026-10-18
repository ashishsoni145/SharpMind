import type { Metadata, Viewport } from 'next';
import { Layout } from '@/components/layout/Layout';
import { sharedMetadata } from './metadata';
import '@/styles/globals.css';

export const metadata: Metadata = sharedMetadata;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
