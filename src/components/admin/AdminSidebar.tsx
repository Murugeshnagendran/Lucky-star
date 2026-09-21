'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const menu = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Products', path: '/admin/products', icon: '📦' },
    { name: 'Add Product', path: '/admin/products/add', icon: '➕' },
    { name: 'Categories', path: '/admin/categories', icon: '📂' },
    { name: 'Brands', path: '/admin/brands', icon: '🏷️' },
    { name: 'Inventory', path: '/admin/inventory', icon: '📋' },
    { name: 'Enquiries', path: '/admin/enquiries', icon: '💬' },
    { name: 'Furniture Requests', path: '/admin/furniture-requests', icon: '🪑' },
    { name: 'Offers', path: '/admin/offers', icon: '🎁' },
    { name: 'Reviews', path: '/admin/reviews', icon: '⭐' },
    { name: 'Delivery Zones', path: '/admin/delivery-zones', icon: '🚚' },
    { name: 'Settings', path: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-brand-charcoal-dark text-white flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black text-brand-red tracking-wider">LUCKY ★ STAR</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-neutral-400 hover:text-white md:hidden"
            >
              ✕
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menu.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-red text-white shadow-sm'
                    : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-800 text-xs text-neutral-400 text-center">
          Lucky Star Admin v1.0
        </div>
      </aside>
    </>
  );
}
