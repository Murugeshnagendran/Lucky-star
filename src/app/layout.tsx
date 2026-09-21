import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lucky Star Home Appliances & Furnitures',
  description: 'Your premier destination for home appliances and furnitures in Madurai. Discover products, check real-time stock availability, and enquire directly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-body text-brand-charcoal bg-brand-white min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <WishlistProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
