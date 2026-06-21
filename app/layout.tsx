import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Director Matcher',
  description: 'Find the perfect director for your project',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#000000', overflowX: 'hidden', overflowY: 'auto' }}>
        {children}
      </body>
    </html>
  );
}





