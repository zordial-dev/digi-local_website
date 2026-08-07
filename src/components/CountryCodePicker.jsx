import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export const ALL_COUNTRIES = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', placeholder: 'e.g. 98765 43210' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', placeholder: 'e.g. (555) 234-5678' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', placeholder: 'e.g. 7911 123456' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', placeholder: 'e.g. 50 123 4567' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', placeholder: 'e.g. (416) 555-0143' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', placeholder: 'e.g. 412 345 678' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', placeholder: 'e.g. 8123 4567' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', placeholder: 'e.g. 50 123 4567' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', placeholder: 'e.g. 3312 3456' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼', placeholder: 'e.g. 9123 4567' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲', placeholder: 'e.g. 9123 4567' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭', placeholder: 'e.g. 3912 3456' },
  { code: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵', placeholder: 'e.g. 98412 34567' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', placeholder: 'e.g. 1712 345678' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰', placeholder: 'e.g. 77 123 4567' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', placeholder: 'e.g. 300 1234567' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', placeholder: 'e.g. 12-345 6789' },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭', placeholder: 'e.g. 81 234 5678' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩', placeholder: 'e.g. 812-3456-7890' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', placeholder: 'e.g. 917 123 4567' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳', placeholder: 'e.g. 91 234 56 78' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', placeholder: 'e.g. 151 23456789' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', placeholder: 'e.g. 6 12 34 56 78' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', placeholder: 'e.g. 312 345 6789' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', placeholder: 'e.g. 612 34 56 78' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱', placeholder: 'e.g. 6 12345678' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭', placeholder: 'e.g. 79 123 45 67' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪', placeholder: 'e.g. 70 123 45 67' },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴', placeholder: 'e.g. 412 34 567' },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰', placeholder: 'e.g. 20 12 34 56' },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮', placeholder: 'e.g. 40 1234567' },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪', placeholder: 'e.g. 87 123 4567' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿', placeholder: 'e.g. 21 123 4567' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', placeholder: 'e.g. 90 1234 5678' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', placeholder: 'e.g. 10-1234-5678' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', placeholder: 'e.g. 138 1234 5678' },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '🇭🇰', placeholder: 'e.g. 9123 4567' },
  { code: 'TW', name: 'Taiwan', dialCode: '+886', flag: '🇹🇼', placeholder: 'e.g. 912 345 678' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', placeholder: 'e.g. (11) 91234-5678' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽', placeholder: 'e.g. 55 1234 5678' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷', placeholder: 'e.g. 9 11 1234-5678' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱', placeholder: 'e.g. 9 1234 5678' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴', placeholder: 'e.g. 300 123 4567' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', placeholder: 'e.g. 82 123 4567' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬', placeholder: 'e.g. 100 123 4567' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', placeholder: 'e.g. 802 123 4567' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪', placeholder: 'e.g. 712 345678' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭', placeholder: 'e.g. 24 123 4567' },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺', placeholder: 'e.g. (912) 345-67-89' },
  { code: 'UA', name: 'Ukraine', dialCode: '+380', flag: '🇺🇦', placeholder: 'e.g. 50 123 4567' },
  { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱', placeholder: 'e.g. 512 345 678' },
  { code: 'CZ', name: 'Czech Republic', dialCode: '+420', flag: '🇨🇿', placeholder: 'e.g. 601 123 456' },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹', placeholder: 'e.g. 664 1234567' },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪', placeholder: 'e.g. 470 12 34 56' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹', placeholder: 'e.g. 912 345 678' },
  { code: 'GR', name: 'Greece', dialCode: '+30', flag: '🇬🇷', placeholder: 'e.g. 691 234 5678' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷', placeholder: 'e.g. 501 234 56 78' },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱', placeholder: 'e.g. 50-123-4567' },
  { code: 'JO', name: 'Jordan', dialCode: '+962', flag: '🇯🇴', placeholder: 'e.g. 7 9123 4567' },
  { code: 'LB', name: 'Lebanon', dialCode: '+961', flag: '🇱🇧', placeholder: 'e.g. 71 123 456' },
  { code: 'IQ', name: 'Iraq', dialCode: '+964', flag: '🇮🇶', placeholder: 'e.g. 790 123 4567' },
  { code: 'AF', name: 'Afghanistan', dialCode: '+93', flag: '🇦🇫', placeholder: 'e.g. 70 123 4567' },
  { code: 'DZ', name: 'Algeria', dialCode: '+213', flag: '🇩🇿', placeholder: 'e.g. 551 23 45 67' },
  { code: 'MA', name: 'Morocco', dialCode: '+212', flag: '🇲🇦', placeholder: 'e.g. 650-123456' },
  { code: 'TN', name: 'Tunisia', dialCode: '+216', flag: '🇹🇳', placeholder: 'e.g. 20 123 456' },
  { code: 'LY', name: 'Libya', dialCode: '+218', flag: '🇱🇾', placeholder: 'e.g. 91 123 4567' },
  { code: 'ET', name: 'Ethiopia', dialCode: '+251', flag: '🇪🇹', placeholder: 'e.g. 91 123 4567' },
  { code: 'UG', name: 'Uganda', dialCode: '+256', flag: '🇺🇬', placeholder: 'e.g. 772 123456' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿', placeholder: 'e.g. 712 345 678' },
  { code: 'ZW', name: 'Zimbabwe', dialCode: '+263', flag: '🇿🇼', placeholder: 'e.g. 77 123 4567' },
  { code: 'MU', name: 'Mauritius', dialCode: '+230', flag: '🇲🇺', placeholder: 'e.g. 5123 4567' },
  { code: 'MV', name: 'Maldives', dialCode: '+960', flag: '🇲🇻', placeholder: 'e.g. 712 3456' },
  { code: 'FJ', name: 'Fiji', dialCode: '+679', flag: '🇫🇯', placeholder: 'e.g. 701 2345' }
];

export default function CountryCodePicker({ value = '+91', onChange, disabled = false, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const selectedCountry = ALL_COUNTRIES.find(c => c.dialCode === value) || ALL_COUNTRIES[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = ALL_COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.dialCode.includes(searchQuery) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-1.5 px-3 py-3.5 bg-[#FAF9F6] border border-border/80 rounded-2xl text-xs font-bold text-[#18281F] hover:bg-[#F3EFE6] transition-all shadow-xs min-w-[95px] whitespace-nowrap cursor-pointer ${
          disabled ? 'opacity-60 cursor-not-allowed bg-secondary/40' : ''
        } ${className}`}
      >
        <span className="flex items-center gap-1.5">
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span className="font-extrabold text-[#18281F]">{selectedCountry.dialCode}</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#18281F]' : ''}`} />
      </button>

      {/* Animated Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-64 sm:w-72 bg-white border border-[#E8E2D5] rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150 text-ink">
          
          {/* Search Box */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder="Search country or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl text-xs font-medium text-[#18281F] focus:outline-none focus:border-[#18281F] transition-colors"
            />
          </div>

          {/* Scrollable Country List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => {
                const isSelected = selectedCountry.code === country.code && selectedCountry.dialCode === country.dialCode;
                return (
                  <button
                    key={`${country.code}-${country.dialCode}`}
                    type="button"
                    onClick={() => {
                      if (onChange) onChange(country.dialCode, country);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                      isSelected 
                        ? 'bg-[#18281F] text-white' 
                        : 'hover:bg-[#FAF8F5] text-[#18281F]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="text-lg leading-none shrink-0">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`font-bold ${isSelected ? 'text-[#C4A066]' : 'text-gray-500'}`}>
                        {country.dialCode}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#C4A066]" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-muted-foreground italic">
                No country found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
