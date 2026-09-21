import React from 'react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import MobileNav from '@/components/storefront/MobileNav';
import WhatsAppButton from '@/components/storefront/WhatsAppButton';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-50 pb-16 md:pb-0">{children}</main>
      <Footer />
      <WhatsAppButton />
      <MobileNav />
    </>
  );
}

