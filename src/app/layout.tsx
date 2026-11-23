import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GCSE Science Diagram Maker | Udhi Reviewer Dashboard',
  description:
    'AI-generated animated science diagrams for UK GCSE students with automated SVG validation and review pipeline.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
