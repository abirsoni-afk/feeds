import { useState } from 'react';
import { MapPin, Search, Camera, Globe, Store, HelpCircle, MessageSquare, User, ChevronDown, Menu } from 'lucide-react';

function IndiaMArtLogo() {
  return (
    <a href="#" className="flex items-center gap-0 flex-shrink-0 select-none">
      <svg width="40" height="36" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 32 L3 10 Q3 3 10 3 Q17 3 17 10 L17 18 Q17 24 20 24 Q23 24 23 18 L23 10 Q23 3 30 3 Q37 3 37 10 L37 32"
          stroke="#d32f2f" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"
        />
      </svg>
      <span className="text-[22px] font-bold text-[#1a1a2e] tracking-tight leading-none hidden sm:inline" style={{ fontFamily: 'Inter, sans-serif' }}>
        indiamart<sup className="text-[10px] font-normal align-super">®</sup>
      </span>
    </a>
  );
}

interface TopNavProps {
  searchVisible?: boolean;
  onOpenLeftDrawer?: () => void;
}

export default function TopNav({ searchVisible = true, onOpenLeftDrawer }: TopNavProps) {
  const [query, setQuery] = useState('');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-3 sm:px-4 h-[60px] flex items-center gap-2 sm:gap-3">

        {/* Mobile menu button */}
        <button
          onClick={onOpenLeftDrawer}
          className="md:hidden flex-shrink-0 p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo */}
        <IndiaMArtLogo />

        {/* City selector pill — hidden on mobile, shown on sm+ */}
        <div className={`hidden sm:flex flex-shrink-0 items-center h-9 border border-gray-300 rounded-md bg-white overflow-hidden transition-all duration-300 ${searchVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex items-center gap-1.5 px-3">
            <MapPin className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-800 whitespace-nowrap">Greater Noida</span>
          </div>
          <div className="w-px h-5 bg-gray-300" />
          <button className="flex items-center justify-center px-2.5 h-full hover:bg-gray-50 transition-colors">
            <Search className="w-4 h-4 text-[#1d8480]" />
          </button>
        </div>

        {/* Search bar — shown on all sizes */}
        <div className={`flex flex-1 items-center h-9 sm:h-10 border border-gray-300 rounded-md bg-white overflow-hidden focus-within:border-[#1d8480] transition-all duration-300 ${searchVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto'}`}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Enter product / service to search"
            className="flex-1 px-3 sm:px-4 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none h-full min-h-9"
          />
          <button className="hidden sm:flex flex-shrink-0 items-center justify-center px-3 border-l border-gray-200 h-full hover:bg-gray-50 transition-colors">
            <Camera className="w-4.5 h-4.5 text-[#1d8480]" strokeDasharray="2 1" />
          </button>
          <button className="flex-shrink-0 flex items-center justify-center bg-[#1d8480] hover:bg-[#166360] transition-colors px-3 sm:px-4 h-full min-h-9">
            <Search className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Post RFQ — hidden on mobile */}
        <button className={`hidden sm:flex flex-shrink-0 px-4 h-9 text-sm font-semibold text-[#1d8480] border border-[#1d8480] rounded-md hover:bg-teal-50 transition-colors whitespace-nowrap transition-all duration-300 ${searchVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          Post RFQ
        </button>

        {/* Right nav items — hidden on mobile, shown on md+ */}
        <nav className="hidden md:flex items-center flex-shrink-0">
          {[
            { icon: Globe, label: 'Exporters' },
            { icon: Store, label: 'Sell' },
            { icon: HelpCircle, label: 'Help' },
            { icon: MessageSquare, label: 'Messages' },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors group"
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-medium whitespace-nowrap">{label}</span>
            </button>
          ))}

          <button className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors">
            <User className="w-5 h-5" />
            <span className="text-[11px] font-medium flex items-center gap-0.5 whitespace-nowrap">
              Hi Aaan <ChevronDown className="w-3 h-3" />
            </span>
          </button>
        </nav>

        {/* Mobile user avatar */}
        <button className="sm:hidden flex-shrink-0 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
          <div className="w-7 h-7 rounded-full bg-[#1d8480] flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
        </button>

      </div>
    </header>
  );
}
