'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';

export default function EnquirePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchQuery.trim()) {
        setProducts([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (res.ok) {
          const allProducts: Product[] = await res.json();
          const query = searchQuery.toLowerCase();
          const filtered = allProducts.filter(p => p.name.toLowerCase().includes(query) || (p.modelNumber && p.modelNumber.toLowerCase().includes(query))).slice(0, 5);
          setProducts(filtered);
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Only search if user hasn't explicitly selected something matching the exact query string
    if (selectedProduct && selectedProduct.name === searchQuery) {
      setProducts([]);
    } else {
      const timeoutId = setTimeout(fetchProducts, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, selectedProduct]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-poppins font-bold text-[#2D2D2D] mb-2">Product Enquiry</h1>
        <p className="text-gray-500 text-sm mb-8">Fill out the form below and our store team will contact you shortly.</p>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Enquiry submitted successfully!'); }}>
          {/* Product Selection */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Which product are you interested in?</label>
            <input 
              type="text" 
              placeholder="Search products (e.g. Samsung Refrigerator)" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selectedProduct && e.target.value !== selectedProduct.name) {
                  setSelectedProduct(null);
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#C41E24] focus:border-[#C41E24] bg-white"
            />
            
            {loading && searchQuery && !selectedProduct && (
              <div className="absolute left-4 right-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-500 z-10">
                Searching...
              </div>
            )}
            
            {!loading && products.length > 0 && (
              <div className="absolute left-4 right-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                {products.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => {
                      setSelectedProduct(p);
                      setSearchQuery(p.name);
                      setProducts([]);
                    }}
                    className="p-3 hover:bg-red-50 cursor-pointer border-b text-sm flex flex-col"
                  >
                    <span className="font-medium">{p.name}</span>
                    {p.modelNumber && <span className="text-xs text-gray-500">Model: {p.modelNumber}</span>}
                  </div>
                ))}
              </div>
            )}
            
            {!loading && searchQuery && products.length === 0 && !selectedProduct && (
              <div className="absolute left-4 right-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-500 z-10">
                No products found. Try a different term.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
              <input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#C41E24] focus:border-[#C41E24]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
              <input type="tel" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#C41E24] focus:border-[#C41E24]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#C41E24] focus:border-[#C41E24]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" defaultValue="1" min="1" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#C41E24] focus:border-[#C41E24]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Contact Method</label>
            <div className="flex space-x-6 mt-2">
              <label className="flex items-center text-sm"><input type="radio" name="contact" defaultChecked className="mr-2 text-[#C41E24] focus:ring-[#C41E24]" /> WhatsApp</label>
              <label className="flex items-center text-sm"><input type="radio" name="contact" className="mr-2 text-[#C41E24] focus:ring-[#C41E24]" /> Phone Call</label>
              <label className="flex items-center text-sm"><input type="radio" name="contact" className="mr-2 text-[#C41E24] focus:ring-[#C41E24]" /> Email</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
            <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#C41E24] focus:border-[#C41E24] resize-none" placeholder="Any specific questions about price, delivery, or availability?"></textarea>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full py-4 bg-[#C41E24] hover:bg-[#9B1B20] text-white font-bold rounded-xl transition-colors text-lg shadow-sm">
              Submit Enquiry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
