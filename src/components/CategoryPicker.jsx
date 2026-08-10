import React, { useState, useRef, useEffect } from 'react';
import { Briefcase, ChevronDown, Check, Search, Sparkles } from 'lucide-react';

export const VENDOR_CATEGORIES = [
  { id: 'resin-art', name: 'Resin Art, Handicrafts & Custom Gifts', icon: '🎨', badge: 'Handmade' },
  { id: 'grocery', name: 'Grocery & Organic Essentials', icon: '🛒', badge: 'Daily Needs' },
  { id: 'dairy', name: 'Dairy, Fresh Milk & Breakfast Supplies', icon: '🥛', badge: 'Fresh Daily' },
  { id: 'bakery', name: 'Bakery, Cakes & Artisan Bakes', icon: '🍞', badge: 'Fresh Baked' },
  { id: 'fruits-veg', name: 'Fruits & Farm-Fresh Vegetables', icon: '🍎', badge: 'Organic' },
  { id: 'food-junction', name: 'Fast Food, Junction & Evening Snacks', icon: '🍔', badge: 'Hot & Fresh' },
  { id: 'tiffin-catering', name: 'Homemade Tiffin & Catering Services', icon: '🍲', badge: 'Home Cooked' },
  { id: 'apparel-tailoring', name: 'Apparel, Tailoring & Boutique Outfits', icon: '👗', badge: 'Fashion' },
  { id: 'pharmacy-wellness', name: 'Pharmacy, Health & Wellness Supplies', icon: '💊', badge: 'Essential' },
  { id: 'stationery-books', name: 'Stationery, Books & Printing Services', icon: '📚', badge: 'Education' },
  { id: 'electronics-repair', name: 'Electronics, Mobile & Gadget Repairs', icon: '💻', badge: 'Tech Repair' },
  { id: 'home-services', name: 'Home Maintenance, Plumbing & Electrical', icon: '🔧', badge: 'Services' },
  { id: 'beauty-salon', name: 'Beauty, Salon & Personal Care', icon: '💇', badge: 'Wellness' },
  { id: 'pet-care', name: 'Pet Care, Food & Grooming Supplies', icon: '🐾', badge: 'Pets' },
  { id: 'florist-gardening', name: 'Florist, Live Plants & Gardening Supplies', icon: '🌸', badge: 'Plants' },
  { id: 'laundry-dryclean', name: 'Laundry, Dry Cleaning & Ironing', icon: '🧼', badge: 'Services' },
  { id: 'home-decor', name: 'Home Decor, Furnishings & Furniture', icon: '🛋️', badge: 'Home' },
  { id: 'sports-fitness', name: 'Fitness, Sports Equipment & Cycles', icon: '🚲', badge: 'Active' },
  { id: 'general-store', name: 'General Community Supermarket & Mart', icon: '🏪', badge: 'All-in-One' },
  { id: 'other-custom', name: 'Custom Variety / Other Specialized Business', icon: '✨', badge: 'Specialty' }
];

export default function CategoryPicker({ value, onChange, label = 'Business Category *' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCat = VENDOR_CATEGORIES.find(
    (c) => c.name.toLowerCase() === (value || '').toLowerCase() || c.id === value
  ) || {
    name: value || 'Resin Art, Handicrafts & Custom Gifts',
    icon: '🎨',
    badge: 'Handmade'
  };

  const filteredCategories = VENDOR_CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.badge.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-xs font-bold text-[#1E3623] mb-1">
          {label}
        </label>
      )}

      {/* Selected Category Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full pl-3.5 pr-3 py-2.5 rounded-2xl bg-[#FAF9F6] border text-left text-xs font-semibold focus:outline-none transition-all flex items-center justify-between shadow-xs cursor-pointer ${
          isOpen
            ? 'border-[#1E3623] ring-2 ring-[#1E3623]/15 bg-white'
            : 'border-border/80 hover:border-[#1E3623]/50 hover:bg-white'
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="text-base leading-none shrink-0">{selectedCat.icon}</span>
          <span className="truncate text-[#1E3623] font-bold">
            {selectedCat.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {selectedCat.badge && (
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-extrabold bg-[#E3EFE6] text-[#1E3623] rounded-full border border-[#1E3623]/15">
              {selectedCat.badge}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#1E3623]' : ''
            }`}
          />
        </div>
      </button>

      {/* Custom Dropdown Popover Window */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-2xl border border-[#1E3623]/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Search Filter Header */}
          <div className="p-2.5 border-b border-border/60 bg-[#FAF9F6]/80 backdrop-blur-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search business category or variety..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl bg-white border border-border/80 focus:outline-none focus:border-[#1E3623] transition-all"
              />
            </div>
          </div>

          {/* Options Scroll List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => {
                const isSelected =
                  selectedCat.name.toLowerCase() === cat.name.toLowerCase() ||
                  value === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      onChange(cat.name);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full p-2 rounded-xl text-left text-xs transition-all flex items-center justify-between cursor-pointer group ${
                      isSelected
                        ? 'bg-[#18281F] text-white font-bold shadow-xs'
                        : 'hover:bg-[#E3EFE6] text-[#1E3623] font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="text-base leading-none shrink-0 group-hover:scale-110 transition-transform">
                        {cat.icon}
                      </span>
                      <span className="truncate">{cat.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                          isSelected
                            ? 'bg-[#E6C35C] text-[#0F1C15] border-[#E6C35C]'
                            : 'bg-white/80 text-[#1E3623] border-[#1E3623]/15'
                        }`}
                      >
                        {cat.badge}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#E6C35C] shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground font-medium">
                No matching category found. Try searching another variety keyword.
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-2 border-t border-border/50 bg-[#FAF9F6] text-[10px] text-muted-foreground text-center font-bold flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-[#E6C35C]" />
            <span>Select the category that best represents your store variety</span>
          </div>
        </div>
      )}
    </div>
  );
}
