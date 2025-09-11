import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Meu Novo App',
  description: 'Criado com o Firebase Studio',
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
