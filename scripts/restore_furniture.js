const fs = require('fs');
let code = fs.readFileSync('temp_furn_1.txt', 'utf8');

// Strip out the extra stuff at the beginning
const startIdx = code.indexOf('\'use client\';');
if (startIdx !== -1) {
  code = code.substring(startIdx);
}

// Remove the end of the file output if it exists
const endIdx = code.indexOf('}\n');
if (endIdx !== -1) {
  code = code.substring(0, endIdx + 2);
}

// Transform the imports
code = code.replace(/import React from 'react';/, "import React, { useState } from 'react';\nimport { supabase } from '@/lib/supabase/client';");

// Transform the component body
const stateLogic = `  const [form, setForm] = useState({
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
`;

code = code.replace(/const furnitureTypes = \[.*\];/, (match) => match + '\n\n' + stateLogic);

// Transform the form and inputs
code = code.replace(/<form className="space-y-6">/, '<form className="space-y-6" onSubmit={handleSubmit}>');

code = code.replace(/<input type="text" required className="w-full border/g, 
  '<input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border');

code = code.replace(/<input type="tel" required className="w-full border/g, 
  '<input type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border');

code = code.replace(/<select required className="w-full border/g, 
  '<select required value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full border');

code = code.replace(/placeholder="e\.g\., 6ft x 4ft x 2ft" className="w-full border/g, 
  'value={form.dimensions} onChange={e => setForm({...form, dimensions: e.target.value})} placeholder="e.g., 6ft x 4ft x 2ft" className="w-full border');

code = code.replace(/placeholder="e\.g\., Teak Wood, Plywood" className="w-full border/g, 
  'value={form.material} onChange={e => setForm({...form, material: e.target.value})} placeholder="e.g., Teak Wood, Plywood" className="w-full border');

code = code.replace(/<textarea required rows=\{4\} className="w-full border/g, 
  '<textarea required rows={4} value={form.requirements} onChange={e => setForm({...form, requirements: e.target.value})} className="w-full border');

// Remove the Image upload section
code = code.replace(/<div>\s*<label className="block text-sm font-medium text-gray-700 mb-1">Upload Reference Image \(Optional\)<\/label>[\s\S]*?<\/div>\s*<\/div>/, '');

code = code.replace(/<button type="submit" className="w-full py-4 bg-\[#C41E24\] hover:bg-\[#9B1B20\] text-white font-bold rounded-xl text-lg transition-all shadow-md\">\s*Submit Request\s*<\/button>/, 
  '<button type="submit" disabled={submitting} className="w-full py-4 bg-[#C41E24] hover:bg-[#9B1B20] disabled:bg-gray-400 text-white font-bold rounded-xl text-lg transition-all shadow-md">{submitting ? \'Submitting...\' : \'Submit Request\'}</button>');

fs.writeFileSync('src/app/(storefront)/furniture/page.tsx', code);
console.log('Done mapping.');
