'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User } from '@/lib/types';
import { Button, Input, Spinner, useToast } from '@/components/ui';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Settings
  const [name, setName] = useState('Lucky Star Home Appliances & Furnitures');
  const [address, setAddress] = useState('Chappani Kovil Street, Chinna Chokkikulam, Madurai – 625 002');
  const [phone, setPhone] = useState('9629599265, 9629609265');
  const [email, setEmail] = useState('luckystarhomeappliance@gmail.com');
  const [gstRate, setGstRate] = useState('18');

  // Promote User
  const [userEmail, setUserEmail] = useState('');
  const [promoting, setPromoting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase.from('store_settings').select('*').single();
        if (data) {
          if (data.name) setName(data.name);
          if (data.address) setAddress(data.address);
          if (data.phone) setPhone(data.phone);
          if (data.email) setEmail(data.email);
          if (data.defaultGstRate) setGstRate(data.defaultGstRate.toString());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { name, address, phone, email, defaultGstRate: Number(gstRate) };
      // Assuming the store_settings table has an 'id' column or a similar primary key, 
      // or we can use upsert. Without knowing schema, update should be safe if it already exists.
      // But just to be sure we can try to update it using an eq filter.
      await supabase.from('store_settings').update(data).eq('id', 'store');
      toast.success('Settings saved successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePromote = async () => {
    if (!userEmail) return;
    setPromoting(true);
    try {
      const { data: users, error } = await supabase.from('users').select('*');
      if (error) throw error;
      const user = (users || []).find(u => u.email?.toLowerCase() === userEmail.trim().toLowerCase());
      if (user) {
        await supabase.from('users').update({ role: 'store_manager' }).eq('id', user.id);
        toast.success(`User ${userEmail} promoted to store_manager`);
        setUserEmail('');
      } else {
        toast.error('User not found. They must register an account first.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to promote user');
    } finally {
      setPromoting(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>
          Store Settings
        </h1>
        <p className="text-sm text-neutral-500">Manage store information and team permissions</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2 text-brand-charcoal">Store Details</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Store Name" value={name} onChange={e => setName(e.target.value)} required />
          <Input label="Address" value={address} onChange={e => setAddress(e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Contact Phones" value={phone} onChange={e => setPhone(e.target.value)} />
            <Input label="Contact Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="w-full md:w-1/2">
            <Input label="Default GST Rate (%)" type="number" value={gstRate} onChange={e => setGstRate(e.target.value)} />
          </div>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? <Spinner size="sm" /> : 'Save Settings'}
          </Button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm border-l-4 border-l-brand-red">
        <h2 className="text-lg font-semibold mb-1 text-brand-charcoal">Team Role Assignment</h2>
        <p className="text-sm text-neutral-500 mb-4">Promote an existing customer to the <strong>store_manager</strong> role.</p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 max-w-lg">
          <div className="flex-1">
            <Input 
              label="Registered User Email" 
              type="email" 
              value={userEmail} 
              onChange={e => setUserEmail(e.target.value)} 
              placeholder="manager@luckystar.com" 
            />
          </div>
          <Button onClick={handlePromote} variant="secondary" disabled={promoting || !userEmail}>
            {promoting ? 'Promoting...' : 'Promote to Store Manager'}
          </Button>
        </div>
      </div>
    </div>
  );
}
