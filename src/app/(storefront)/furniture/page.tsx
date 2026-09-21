'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Sofa, Bed, Layers, Home, Camera } from 'lucide-react';

export default function FurniturePage() {
  const furnitureTypes = ['Sofa & Seating', 'Beds & Bedroom', 'Tables & Dining', 'Wardrobes & Storage', 'TV Units', 'Modular Kitchens', 'Office Furniture', 'Other'];

  const [form, setForm] = useState({
    name: '',
    phone: '',
    type: '',
    dimensions: '',
    material: '',
    requirements: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('furniture_requests').insert([{
        customer_id: user?.id || null,
        customer_name: form.name,
        mobile: form.phone,
        furniture_type: form.type,
        dimensions: form.dimensions || null,
        material: form.material || null,
        requirements: form.requirements,
        status: 'new'
      }]);
      if (error) {
        console.error('Submit error:', error.message, error.details, error.hint, error.code);
        throw error;
      }
      alert('Request submitted successfully! We will contact you soon.');
      setForm({ name: '', phone: '', type: '', dimensions: '', material: '', requirements: '' });
    } catch (err: any) {
      alert('Failed to submit request: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <div className="bg-[#2D2D2D] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-poppins font-bold mb-6">Bespoke Custom Furniture</h1>
          <p className="text-xl text-gray-300 mb-4">All Brands Home Appliances & Customised Furnitures Available</p>
          <p className="text-base text-gray-400 max-w-2xl mx-auto">
            Bring your vision to life. Share your requirements, dimensions, and reference images, and our expert craftsmen will build the perfect piece for your home.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-3xl mx-auto px-4 py-12 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100">
          <div className="flex items-center mb-8 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-[#C41E24] mr-4">
              <Sofa size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-poppins text-[#2D2D2D]">Request a Quote</h2>
              <p className="text-sm text-gray-500">Fill in the details and we'll get back with an estimate.</p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#C41E24] focus:border-[#C41E24]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                <input type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#C41E24] focus:border-[#C41E24]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Furniture Type *</label>
              <select required value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#C41E24] focus:border-[#C41E24] bg-white">
                <option value="">Select a category</option>
                {furnitureTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approximate Dimensions</label>
                <input type="text" value={form.dimensions} onChange={e => setForm({...form, dimensions: e.target.value})} placeholder="e.g., 6ft x 4ft x 2ft" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#C41E24] focus:border-[#C41E24]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material Preference</label>
                <input type="text" value={form.material} onChange={e => setForm({...form, material: e.target.value})} placeholder="e.g., Teak Wood, Plywood" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#C41E24] focus:border-[#C41E24]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Requirements *</label>
              <textarea required rows={4} value={form.requirements} onChange={e => setForm({...form, requirements: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#C41E24] focus:border-[#C41E24] resize-none" placeholder="Describe the design, finish, color, and any specific requirements..."></textarea>
            </div>

            

            <div className="pt-4 border-t border-gray-100">
              <button type="submit" disabled={submitting} className="w-full py-4 bg-[#C41E24] hover:bg-[#9B1B20] disabled:bg-gray-400 text-white font-bold rounded-xl text-lg transition-all shadow-md">{submitting ? 'Submitting...' : 'Submit Request'}</button>
              <p className="text-center text-xs text-gray-500 mt-4">
                Our team will review your requirements and contact you within 24 hours.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

