'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail, Menu, Search, User, Heart, X } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Categories', href: '/categories' },
    { name: 'Products', href: '/products' },
    { name: 'Availability', href: '/availability' },
    { name: 'Furniture', href: '/furniture' },
    { name: 'Offers', href: '/offers' },
    { name: 'Contact', href: '/contact' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="w-full">
      {/* Top Bar */}
      <div className="hidden md:flex bg-[#2D2D2D] text-white py-2 px-6 justify-between items-center text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Phone size={14} className="mr-2 text-[#E8353B]" />
            <span>9629599265 | 9629609265</span>
          </div>
        </div>
        <div className="flex items-center">
          <Mail size={14} className="mr-2 text-[#E8353B]" />
          <span>luckystarhomeappliance@gmail.com</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b py-4 px-4 md:px-6 sticky top-0 z-40 shadow-sm md:static md:shadow-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-[#2D2D2D]"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex flex-col items-center flex-shrink-0">
            <div className="flex items-center text-xl md:text-2xl font-bold font-poppins text-[#C41E24]">
              <span>LUCKY</span>
              <svg className="w-5 h-5 md:w-6 md:h-6 mx-1 text-yellow-500 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span>STAR</span>
            </div>
            <span className="text-[10px] md:text-xs text-[#2D2D2D] font-medium tracking-wide hidden md:block">
              Home Appliances & Furnitures
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <input 
                type="text" 
                placeholder="Search for appliances, furniture, brands..." 
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-[#C41E24] focus:ring-1 focus:ring-[#C41E24]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#C41E24]">
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Search Icon - Mobile */}
          <div className="md:hidden flex items-center">
             <Link href="/search" className="text-[#2D2D2D] p-2">
                <Search size={22} />
             </Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/wishlist" className="flex flex-col items-center text-[#2D2D2D] hover:text-[#C41E24] transition-colors relative">
              <Heart size={22} />
              <span className="text-xs mt-1">Wishlist</span>
            </Link>

            <Link href="/account" className="flex flex-col items-center text-[#2D2D2D] hover:text-[#C41E24] transition-colors relative">
              <User size={22} />
              <span className="text-xs mt-1">Account</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="hidden md:block border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <nav className="flex space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href}
                className={`py-4 text-sm font-medium transition-colors border-b-2 ${
                  pathname === link.href 
                    ? 'border-[#C41E24] text-[#C41E24]' 
                    : 'border-transparent text-gray-700 hover:text-[#C41E24]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <Link href="/" className="font-poppins font-bold text-xl text-[#2D2D2D]" onClick={() => setMobileMenuOpen(false)}>
                Lucky <span className="text-[#C41E24]">Star</span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 p-1">
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              <div className="flex flex-col space-y-1 px-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium ${
                      pathname === link.href
                        ? 'bg-red-50 text-[#C41E24]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 px-4 flex flex-col space-y-3">
                 <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center text-gray-700 hover:text-[#C41E24]">
                    <Heart size={20} className="mr-3" /> Wishlist
                 </Link>
                 <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center text-gray-700 hover:text-[#C41E24]">
                    <User size={20} className="mr-3" /> Account
                 </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
