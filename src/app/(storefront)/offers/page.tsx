'use client';

import React from 'react';
import Link from 'next/link';

export default function OffersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 min-h-[60vh]">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-poppins font-bold text-[#2D2D2D] mb-3">Special Offers & Deals</h1>
        <p className="text-gray-600">Discover incredible discounts on top appliances and furniture</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder Offers */}
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="bg-[#C41E24] text-white p-6 text-center">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Festive Sale</span>
              <h3 className="text-2xl font-bold font-poppins leading-tight">Up to 30% OFF</h3>
              <p className="text-sm text-red-100 mt-2">On Select Washing Machines</p>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <p className="text-gray-600 text-sm mb-6 flex-1">Upgrade your laundry experience with top brands at unbeatable prices. Free installation included.</p>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-500">Valid till: Oct 31, 2024</span>
                <Link href="/products?category=washing-machines" className="text-[#C41E24] text-sm font-semibold hover:underline">
                  Shop Now &rarr;
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

