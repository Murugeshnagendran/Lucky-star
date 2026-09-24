'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useCategories } from '@/lib/hooks/useCategories';

export default function Footer() {
  const { categories: fetchedCategories } = useCategories();
  const fallbackCategories = [
    { id: '1', name: 'Refrigerators', slug: 'refrigerators' },
    { id: '2', name: 'Washing Machines', slug: 'washing-machines' },
    { id: '3', name: 'Air Conditioners', slug: 'air-conditioners' },
    { id: '4', name: 'Televisions', slug: 'televisions' },
    { id: '5', name: 'Kitchen Appliances', slug: 'kitchen-appliances' },
    { id: '6', name: 'Furniture', slug: 'furniture' },
  ];

  const categories = fetchedCategories && fetchedCategories.length > 0 ? fetchedCategories : fallbackCategories;

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Categories', href: '/categories' },
    { name: 'Availability', href: '/availability' },
    { name: 'Furniture', href: '/furniture' },
    { name: 'Offers', href: '/offers' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <footer className="bg-[#1A1A1A] text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* Column 1: About */}
        <div>
          <Link href="/" className="inline-block mb-4">
            <img 
              src="/images/lucky-star-logo.png" 
              alt="Lucky Star Home Appliances and Furnitures" 
              className="h-12 w-auto object-contain bg-white px-2 py-1 rounded"
            />
          </Link>
          <p className="text-[#C41E24] font-medium text-sm mb-4">
            All Brands Home Appliances & Customised Furnitures Available
          </p>
          <p className="text-sm leading-relaxed text-gray-400">
            Your trusted home appliances and custom furniture store in Madurai. We provide top-quality products with excellent customer service and fast local delivery.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-white font-poppins font-semibold text-lg mb-6">Quick Links</h3>
          <ul className="space-y-3">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} className="text-sm hover:text-[#E8353B] transition-colors">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Categories */}
        <div>
          <h3 className="text-white font-poppins font-semibold text-lg mb-6">Categories</h3>
          <ul className="space-y-3">
            {categories.slice(0, 6).map((cat) => (
              <li key={cat.id}>
                <Link href={`/categories/${cat.slug}`} className="text-sm hover:text-[#E8353B] transition-colors">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Contact */}
        <div>
          <h3 className="text-white font-poppins font-semibold text-lg mb-6">Contact Us</h3>
          <ul className="space-y-4">
            <li className="flex items-start text-sm">
              <MapPin size={18} className="mr-3 text-[#C41E24] flex-shrink-0 mt-0.5" />
              <span>
                Chappani Kovil Street, <br />
                Chinna Chokkikulam, <br />
                Madurai – 625 002 <br />
                <span className="text-gray-500 text-xs">Opp. to Bhooma Hospital</span>
              </span>
            </li>
            <li className="flex items-center text-sm">
              <Phone size={18} className="mr-3 text-[#C41E24] flex-shrink-0" />
              <div className="flex flex-col">
                <a href="tel:9629599265" className="hover:text-white transition-colors">9629599265 (K. Karthick)</a>
                <a href="tel:9629609265" className="hover:text-white transition-colors">9629609265 (P. Arivalagan)</a>
              </div>
            </li>
            <li className="flex items-center text-sm">
              <Mail size={18} className="mr-3 text-[#C41E24] flex-shrink-0" />
              <a href="mailto:luckystarhomeappliance@gmail.com" className="hover:text-white transition-colors break-all">
                luckystarhomeappliance@gmail.com
              </a>
            </li>
          </ul>
          
          <div className="mt-6 flex flex-wrap gap-2">
            <a href="tel:9629599265" className="px-3 py-1.5 bg-[#3D3D3D] hover:bg-[#C41E24] text-white text-xs rounded-full transition-colors flex items-center">
              <Phone size={12} className="mr-1.5" /> Call Now
            </a>
            <a href="https://wa.me/919629599265" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#3D3D3D] hover:bg-[#25D366] text-white text-xs rounded-full transition-colors flex items-center">
              <svg className="w-3 h-3 mr-1.5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-[#3D3D3D]">
        <p className="text-center text-xs text-gray-500">
          Copyright &copy; {new Date().getFullYear()} Lucky Star Home Appliances & Furnitures. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

