import { Search, MapPin, Store, MessageSquare, HelpCircle, Globe, User, Camera, Menu, Mic } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import SearchModal from './SearchModal';
import MobileSearchSuggest from './MobileSearchSuggest';

interface HeaderProps {
  showSearch: boolean;
  onProfileClick: () => void;
}

const cities = [
  'Dharamsala',
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Ahmedabad',
  'Pune',
  'Chennai',
  'Kolkata',
  'Hyderabad',
  'Jaipur',
  'Surat',
  'Lucknow',
  'Kanpur',
  'Nagpur',
  'Indore',
  'Thane',
  'Bhopal',
  'Visakhapatnam',
  'Pimpri-Chinchwad',
  'Patna',
];

export default function Header({ onProfileClick }: HeaderProps) {
  const [selectedCity, setSelectedCity] = useState('Dharamsala');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [headerQuery, setHeaderQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);

  function handleSearch(useAi = false) {
    if (!headerQuery.trim()) return;
    setAiMode(useAi);
    setShowModal(true);
  }

  return (
    <>
    <header className="fixed top-0 left-0 right-0 border-b z-50 transition-all duration-300 bg-[#128a7a] md:bg-[#2e3192] border-[#0f6e61] md:border-[#252a7a]">
      {/* ── Mobile / msite header — brand row on top, full-width search pill below ── */}
      <div className="md:hidden flex flex-col">
        <div className="h-[55px] px-3 flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onProfileClick}
            aria-label="Menu"
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-white"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-[10px]">m</span>
            </div>
            <span className="text-white font-semibold text-base">IndiaMART</span>
          </div>

          <button
            onClick={onProfileClick}
            aria-label="Profile"
            className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center"
          >
            <span className="text-teal-700 font-bold text-xs">A</span>
          </button>
        </div>

        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={() => setShowSuggest(true)}
            className="relative z-10 w-full flex items-center bg-white rounded-md h-9 pl-3 pr-2.5 gap-2 text-left"
          >
            <Search className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span className={`flex-1 min-w-0 text-sm truncate ${headerQuery ? 'text-slate-900' : 'text-slate-400'}`}>
              {headerQuery || 'Search suppliers, products, services'}
            </span>
            <span
              role="button"
              tabIndex={-1}
              aria-label="Search by image"
              className="flex-shrink-0 flex items-center justify-center w-5 h-5 text-teal-600"
            >
              <Camera className="w-4 h-4" />
            </span>
            <span
              role="button"
              tabIndex={-1}
              aria-label="Search by voice"
              className="flex-shrink-0 flex items-center justify-center w-5 h-5 text-teal-600"
            >
              <Mic className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>

      {showSuggest && (
        <MobileSearchSuggest
          query={headerQuery}
          onQueryChange={setHeaderQuery}
          onClose={() => setShowSuggest(false)}
          onSubmit={(q, ai = false) => {
            setHeaderQuery(q);
            setAiMode(ai);
            setShowSuggest(false);
            setShowModal(true);
          }}
        />
      )}

      {/* ── Desktop header (unchanged) ── */}
      <div className="hidden md:flex px-3 sm:px-4 md:px-6 lg:px-8 h-[55px] items-center">
        <div className="flex items-center justify-between gap-2 md:gap-4 lg:gap-6 w-full">
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <div className="w-6 h-6 md:w-7 md:h-7 bg-white rounded flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xs">m</span>
            </div>
            <span className="text-sm md:text-base font-semibold text-white hidden sm:inline">indiamart</span>
          </div>

          <div className="hidden md:flex flex-1 max-w-4xl opacity-100 translate-y-0">
            <div className="flex items-center gap-2.5 w-full">
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 pl-3 pr-2.5 bg-white hover:bg-slate-50 transition-all duration-150 rounded-lg border border-slate-200 min-w-[130px] lg:min-w-[150px] h-[38px]"
                >
                  <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" />
                  <span className="text-slate-900 font-medium flex-1 text-left text-sm truncate">{selectedCity}</span>
                  <span className="w-px h-5 bg-slate-200 flex-shrink-0" />
                  <Search className="w-4 h-4 text-teal-600 flex-shrink-0" />
                </button>

                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-[300px] overflow-y-auto">
                      {cities.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            setSelectedCity(city);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-all duration-150 text-xs ${
                            selectedCity === city ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-700'
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="relative flex-1 min-w-0">
                <div className="relative z-10 flex items-center bg-white rounded-lg h-[38px] pl-3 overflow-hidden transition-all duration-300 border border-slate-200">
                <input
                  type="text"
                  placeholder="Enter product / service to search"
                  value={headerQuery}
                  onChange={e => setHeaderQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                  className="flex-1 min-w-0 h-full border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  aria-label="Search by image"
                  className="flex items-center justify-center w-7 h-7 mr-1.5 rounded-md border border-dashed border-red-300 flex-shrink-0 hover:bg-slate-50 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                </button>
                <button
                  onClick={() => handleSearch()}
                  aria-label="Search"
                  className="flex items-center justify-center w-10 h-full bg-teal-600 hover:bg-teal-700 text-white transition-all duration-150 flex-shrink-0"
                >
                  <Search className="w-4 h-4" />
                </button>
                </div>
              </div>
              <button className="hidden lg:flex px-5 bg-white hover:bg-slate-50 text-teal-700 text-sm font-semibold rounded-lg transition-all duration-150 whitespace-nowrap border border-slate-200 h-[38px] items-center flex-shrink-0">
                Get Best Price
              </button>
            </div>
          </div>

          <div className="flex items-center gap-0.5 md:gap-1">
            <button className="hidden xl:flex flex-col items-center justify-center px-2 md:px-2.5 py-1 hover:bg-blue-700 rounded-lg transition-all duration-150 group">
              <Store className="w-3.5 md:w-4 h-3.5 md:h-4 text-white mb-0.5" />
              <span className="text-white text-[9px] md:text-[10px] font-medium">Seller Tools</span>
            </button>
            <div className="relative">
              <button className="flex flex-col items-center justify-center px-2 md:px-2.5 py-1 hover:bg-blue-700 rounded-lg transition-all duration-150 group">
                <MessageSquare className="w-3.5 md:w-4 h-3.5 md:h-4 text-white mb-0.5" />
                <span className="text-white text-[9px] md:text-[10px] font-medium hidden sm:inline">Messages</span>
              </button>
              <div className="absolute -top-0.5 -right-0.5 w-3.5 md:w-4 h-3.5 md:h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[8px] md:text-[9px] font-bold">3</span>
              </div>
            </div>
            <button className="hidden lg:flex flex-col items-center justify-center px-2 md:px-2.5 py-1 hover:bg-blue-700 rounded-lg transition-all duration-150 group">
              <HelpCircle className="w-3.5 md:w-4 h-3.5 md:h-4 text-white mb-0.5" />
              <span className="text-white text-[9px] md:text-[10px] font-medium">Help</span>
            </button>
            <button className="hidden lg:flex flex-col items-center justify-center px-2 md:px-2.5 py-1 hover:bg-blue-700 rounded-lg transition-all duration-150 group">
              <Globe className="w-3.5 md:w-4 h-3.5 md:h-4 text-white mb-0.5" />
              <span className="text-white text-[9px] md:text-[10px] font-medium">Exporters</span>
            </button>
            <button
              onClick={onProfileClick}
              className="flex flex-col items-center justify-center px-2 md:px-2.5 py-1"
            >
              <User className="w-3.5 md:w-4 h-3.5 md:h-4 text-white mb-0.5" />
              <span className="text-white text-[9px] md:text-[10px] font-medium">Hi GLK</span>
            </button>
          </div>
        </div>
      </div>
    </header>
    {showModal && createPortal(
      <SearchModal
        query={headerQuery}
        city={selectedCity}
        aiMode={aiMode}
        onClose={() => setShowModal(false)}
      />,
      document.body
    )}
    </>
  );
}
