import React from 'react';
import Link from 'next/link';
import HomePageCategories from '@/components/HomePageCategories';

export default function HomePage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Lucky Star Home Appliances & Furnitures',
      alternateName: 'Lucky Star',
      url: 'https://luckystarhomeappliances.vercel.app/',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Lucky Star Home Appliances & Furnitures',
      alternateName: 'Lucky Star',
      url: 'https://luckystarhomeappliances.vercel.app/',
      image: 'https://luckystarhomeappliances.vercel.app/images/lucky-star-logo.png',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Madurai',
        addressRegion: 'Tamil Nadu',
        addressCountry: 'IN'
      },
      telephone: '+919629599265'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <section className="bg-[#D13A41] text-white py-20 px-6 relative overflow-hidden">
        

        <div className="max-w-7xl mx-auto relative z-10 text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-poppins font-bold mb-4">
            Welcome to Lucky Star
          </h1>
          <h2 className="text-2xl md:text-4xl font-poppins font-semibold mb-6">
            Make Your Home Paradise
          </h2>
          <p className="text-lg md:text-2xl mb-10 max-w-3xl">
            Your Trusted Home Appliances & Furniture Store in Madurai
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products" className="px-8 py-3 bg-white text-[#C41E24] font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg">
              Explore Products
            </Link>
            <Link href="/availability" className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors">
              Check Availability
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-poppins font-bold text-[#2D2D2D] text-center md:text-left">Browse Categories</h2>
          <Link href="/categories" className="hidden md:inline-block text-[#C41E24] font-medium hover:underline">
            View All →
          </Link>
        </div>
        <HomePageCategories />
      </section>

      {/* Furniture CTA */}
      <section className="bg-[#2D2D2D] text-white py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-poppins font-bold mb-6">Custom Furniture Made to Order</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-10 text-lg">
            Transform your living space with our premium customized furniture. Built to your exact specifications, style, and budget.
          </p>
          <Link href="/furniture" className="px-8 py-3 bg-[#E8353B] text-white font-semibold rounded-full hover:bg-[#C41E24] transition-colors inline-block">
            Request Customization
          </Link>
        </div>
      </section>

      {/* Why Lucky Star */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: 'Free Installation', desc: 'Expert installation on all major appliances' },
            { title: 'Brand Warranty', desc: '100% genuine products with full warranty' },
            { title: 'All Major Brands', desc: 'Top brands available under one roof' },
            { title: 'Local Delivery', desc: 'Fast & safe delivery across Madurai' }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 border border-gray-100 rounded-2xl bg-white">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 text-[#C41E24]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l5 5l10 -10"></path></svg>
              </div>
              <h3 className="font-semibold text-lg text-[#2D2D2D] mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Store Info & Contact CTA */}
      <section className="bg-[#C41E24] py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-white">
          <div>
            <h2 className="text-2xl font-bold font-poppins mb-2">Have a question?</h2>
            <p className="opacity-90">Our store experts are ready to help you find the perfect product.</p>
          </div>
          <div className="flex gap-4 mt-6 md:mt-0">
            <a href="tel:9629599265" className="px-6 py-2.5 bg-white text-[#C41E24] font-medium rounded-full hover:bg-gray-100 transition-colors">Call Store</a>
            <a href="https://wa.me/919629599265" className="px-6 py-2.5 bg-[#25D366] text-white font-medium rounded-full hover:bg-[#20b858] transition-colors shadow-sm">WhatsApp</a>
          </div>
        </div>
      </section>

    </div>
  );
}

