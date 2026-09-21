const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/Header.tsx', 'utf8');

const replacement = `
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
                className={\`py-4 text-sm font-medium transition-colors border-b-2 \${
                  pathname === link.href 
                    ? 'border-[#C41E24] text-[#C41E24]' 
                    : 'border-transparent text-gray-700 hover:text-[#C41E24]'
                }\`}
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
                    className={\`px-4 py-3 rounded-lg text-sm font-medium \${
                      pathname === link.href
                        ? 'bg-red-50 text-[#C41E24]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }\`}
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
`;

code = code.trim();
code += '\n' + replacement;
fs.writeFileSync('src/components/storefront/Header.tsx', code);
console.log('Fixed Header.tsx!');
