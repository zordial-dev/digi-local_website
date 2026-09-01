import React, { useState, useRef, useEffect } from 'react';
import { Briefcase, ChevronDown, Check, Search, Sparkles } from 'lucide-react';

export const VENDOR_CATEGORIES = [
  { id: 'fresh-flowers', name: 'Fresh Flowers, Bouquets & Puja Floral Supplies', icon: '🌸', badge: 'Fresh Flowers' },
  { id: 'resin-art', name: 'Resin Art, Handicrafts & Custom Gifts', icon: '🎨', badge: 'Handmade' },
  { id: 'grocery', name: 'Grocery & Organic Essentials', icon: '🛒', badge: 'Daily Needs' },
  { id: 'dairy', name: 'Dairy, Fresh Milk & Breakfast Supplies', icon: '🥛', badge: 'Fresh Daily' },
  { id: 'bakery', name: 'Bakery, Cakes & Artisan Bakes', icon: '🍞', badge: 'Fresh Baked' },
  { id: 'fruits-veg', name: 'Fruits & Farm-Fresh Vegetables', icon: '🍎', badge: 'Organic' },
  { id: 'sweets-mithai', name: 'Sweet Shop, Mithai & Traditional Snacks', icon: '🍬', badge: 'Sweets' },
  { id: 'food-junction', name: 'Fast Food, Cloud Kitchen & Evening Snacks', icon: '🍔', badge: 'Hot & Fresh' },
  { id: 'tiffin-catering', name: 'Homemade Tiffin & Catering Services', icon: '🍱', badge: 'Home Cooked' },
  { id: 'apparel-tailoring', name: 'Apparel, Clothing, Tailoring & Boutiques', icon: '👗', badge: 'Fashion' },
  { id: 'jewelry-accessories', name: 'Jewelry, Artificial Accessories & Ornaments', icon: '💍', badge: 'Accessories' },
  { id: 'footwear-leather', name: 'Footwear, Shoes & Leather Goods', icon: '👟', badge: 'Footwear' },
  { id: 'pharmacy-wellness', name: 'Pharmacy, Medicines & Healthcare Supplies', icon: '💊', badge: 'Medical' },
  { id: 'cosmetics-beauty', name: 'Cosmetics, Skincare & Beauty Products', icon: '💄', badge: 'Beauty' },
  { id: 'toys-babycare', name: 'Toys, Baby Care & Kids Accessories', icon: '🧸', badge: 'Kids & Toys' },
  { id: 'stationery-books', name: 'Stationery, Office Supplies & Printing Services', icon: '📚', badge: 'Education' },
  { id: 'electronics-repair', name: 'Electronics, Mobile Accessories & Repairs', icon: '📱', badge: 'Gadgets' },
  { id: 'kitchenware-appliances', name: 'Home Appliances, Kitchenware & Utensils', icon: '🍳', badge: 'Kitchen' },
  { id: 'home-decor', name: 'Home Decor, Furnishings, Curtains & Lighting', icon: '🛋️', badge: 'Home Decor' },
  { id: 'florist-gardening', name: 'Nursery, Indoor Plants, Seeds & Gardening', icon: '🪴', badge: 'Plants' },
  { id: 'pet-care', name: 'Pet Care, Food & Grooming Supplies', icon: '🐾', badge: 'Pets' },
  { id: 'sports-fitness', name: 'Sports Goods, Cycles & Fitness Equipment', icon: '🚲', badge: 'Fitness' },
  { id: 'hardware-tools', name: 'Hardware, Sanitaryware, Paints & Tools', icon: '🛠️', badge: 'Hardware' },
  { id: 'laundry-dryclean', name: 'Laundry, Dry Cleaning & Ironing', icon: '🧺', badge: 'Services' },
  { id: 'home-services', name: 'Home Maintenance, Plumbing & Electrical', icon: '🔧', badge: 'Services' },
  { id: 'beauty-salon', name: 'Salon, Spa & Personal Grooming Services', icon: '💇', badge: 'Wellness' },
  { id: 'auto-accessories', name: 'Car & Bike Washing, Accessories & Detailing', icon: '🚗', badge: 'Automotive' },
  { id: 'general-store', name: 'General Community Supermarket & Mart', icon: '🏪', badge: 'All-in-One' },
  { id: 'other-custom', name: 'Custom Variety / Specialized Local Business', icon: '✨', badge: 'Specialty' }
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
    <div ref={containerRef} className="relative w-full font-sans">
      {label && (
        <label className="block text-xs font-bold text-[#211A19] mb-1">
          {label}
        </label>
      )}

      {/* Selected Category Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full pl-3.5 pr-3 py-2.5 rounded-2xl bg-white border text-left text-xs font-semibold focus:outline-none transition-all flex items-center justify-between shadow-xs cursor-pointer ${
          isOpen
            ? 'border-[#541D26] ring-2 ring-[#541D26]/15 bg-white'
            : 'border-[#E5DAD0] hover:border-[#541D26] hover:bg-white'
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="text-base leading-none shrink-0">{selectedCat.icon}</span>
          <span className="truncate text-[#211A19] font-bold">
            {selectedCat.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {selectedCat.badge && (
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-extrabold bg-[#541D26]/10 text-[#541D26] rounded-full border border-[#541D26]/15">
              {selectedCat.badge}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-[#211A19]/60 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#541D26]' : ''
            }`}
          />
        </div>
      </button>

      {/* Custom Dropdown Popover Window */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-2xl border border-[#E5DAD0] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Search Filter Header */}
          <div className="p-2.5 border-b border-[#E5DAD0] bg-[#F6F0E8]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#211A19]/60" />
              <input
                type="text"
                placeholder="Search business category or variety..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl bg-white border border-[#E5DAD0] text-[#211A19] focus:outline-none focus:border-[#541D26] transition-all"
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
                        ? 'bg-[#541D26] text-white font-bold shadow-xs'
                        : 'hover:bg-[#EEE5DA] text-[#211A19] font-medium'
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
                            ? 'bg-white text-[#541D26] border-white'
                            : 'bg-[#541D26]/10 text-[#541D26] border-[#541D26]/15'
                        }`}
                      >
                        {cat.badge}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-[#211A19]/70 font-medium">
                No matching category found. Try searching another variety keyword.
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-2 border-t border-[#E5DAD0] bg-[#F6F0E8] text-[10px] text-[#541D26] text-center font-bold flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-[#541D26]" />
            <span>Select the category that best represents your store variety</span>
          </div>
        </div>
      )}
    </div>
  );
}
