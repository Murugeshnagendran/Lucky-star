'use client';

import React from 'react';
import { Package, MapPin, Map, Clock, Phone, Mail } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-poppins font-bold text-[#2D2D2D] mb-4">Contact Us</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We're here to help you find the perfect appliances and furniture for your home. Reach out to us anytime!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="bg-[#2D2D2D] rounded-2xl p-8 text-white shadow-lg">
            <h2 className="text-xl font-poppins font-semibold mb-6 border-b border-gray-700 pb-4">Store Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="text-[#E8353B] mr-4 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-lg text-white mb-1">Address</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Chappani Kovil Street,<br />
                    Chinna Chokkikulam,<br />
                    Madurai – 625 002
                  </p>
                  <p className="text-[#E8353B] text-sm mt-1">Landmark: Opp. to Bhooma Hospital</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="text-[#E8353B] mr-4 flex-shrink-0 mt-1" size={24} />
                <div className="w-full">
                  <h3 className="font-semibold text-lg text-white mb-2">Direct Contacts</h3>
                  
                  <div className="bg-[#1A1A1A] p-4 rounded-xl mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">K. Karthick</p>
                      <p className="text-xl font-bold text-[#E8353B]">9629599265</p>
                    </div>
                    <div className="flex gap-2">
                      <a href="tel:9629599265" className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">Call</a>
                      <a href="https://wa.me/919629599265" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20b858] rounded-lg text-sm font-medium transition-colors">WhatsApp</a>
                    </div>
                  </div>

                  <div className="bg-[#1A1A1A] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">P. Arivalagan</p>
                      <p className="text-xl font-bold text-[#E8353B]">9629609265</p>
                    </div>
                    <div className="flex gap-2">
                      <a href="tel:9629609265" className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">Call</a>
                      <a href="https://wa.me/919629609265" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20b858] rounded-lg text-sm font-medium transition-colors">WhatsApp</a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="text-[#E8353B] mr-4 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-lg text-white mb-1">Email</h3>
                  <a href="mailto:luckystarhomeappliance@gmail.com" className="text-gray-300 hover:text-white transition-colors break-all">
                    luckystarhomeappliance@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-poppins font-semibold text-[#2D2D2D] mb-6">Send us a message</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <input type="text" required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C41E24]/20 focus:border-[#C41E24]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input type="tel" required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C41E24]/20 focus:border-[#C41E24]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C41E24]/20 focus:border-[#C41E24]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea required rows={5} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C41E24]/20 focus:border-[#C41E24] resize-none" placeholder="How can we help you?"></textarea>
            </div>
            <button type="submit" className="w-full py-4 bg-[#C41E24] hover:bg-[#9B1B20] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg">
              Send Message
            </button>
          </form>
        </div>
      </div>
      
      {/* Map Embed */}
      <div className="mt-16 bg-gray-200 rounded-2xl h-[400px] w-full overflow-hidden flex items-center justify-center border border-gray-200">
         <p className="text-gray-500 flex items-center">
           <Map className="mr-2" /> Google Maps Embed: Chinna Chokkikulam, Madurai
         </p>
         {/* In production, replace with actual iframe from Google Maps */}
         {/* <iframe src="..." width="100%" height="100%" style={{border:0}} allowFullScreen="" loading="lazy"></iframe> */}
      </div>
    </div>
  );
}
