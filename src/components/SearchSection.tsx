import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, ChevronDown } from 'lucide-react';
import SearchModal from './SearchModal';

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

export default function SearchSection() {
  const [selectedCity, setSelectedCity] = useState('Dharamsala');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch() {
    if (productQuery.trim()) setShowModal(true);
  }

  const filteredCities = cities.filter(city =>
    city.toLowerCase().includes(searchInput.toLowerCase())
  );

  useEffect(() => {
    if (isDropdownOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isDropdownOpen]);

  return (
    <>
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-3 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-all duration-150 w-full sm:min-w-[160px] md:min-w-[200px]"
            >
              <MapPin className="w-4 md:w-5 h-4 md:h-5 text-slate-600 flex-shrink-0" />
              <span className="text-slate-900 font-medium flex-1 text-left text-xs md:text-sm truncate">{selectedCity}</span>
              <ChevronDown className="w-4 md:w-5 h-4 md:h-5 text-slate-400 flex-shrink-0" />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setSearchInput('');
                  }}
                />
                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-20">
                  <div className="p-2 border-b border-slate-200 sticky top-0 bg-white">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Type to search..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs md:text-sm bg-emerald-50 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <div className="max-h-[250px] overflow-y-auto">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            setSelectedCity(city);
                            setIsDropdownOpen(false);
                            setSearchInput('');
                          }}
                          className={`w-full text-left px-3 md:px-4 py-2 md:py-2.5 hover:bg-slate-50 transition-all duration-150 text-xs md:text-sm ${
                            selectedCity === city ? 'bg-emerald-100 font-medium text-slate-900' : 'text-slate-700'
                          }`}
                        >
                          {city}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 md:px-4 py-3 text-center text-slate-500 text-xs md:text-sm">
                        No cities found
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-1 min-w-0">
            <input
              type="text"
              placeholder="Enter product / service"
              value={productQuery}
              onChange={e => setProductQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              className="flex-1 min-w-0 px-3 md:px-4 py-2.5 md:py-3 border border-slate-300 border-r-0 rounded-l-lg text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-150"
            />
            <button
              onClick={handleSearch}
              className="px-5 md:px-8 py-2.5 md:py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs md:text-sm font-semibold rounded-r-lg transition-all duration-150 whitespace-nowrap flex-shrink-0"
            >
              Search
            </button>
          </div>

          <button className="px-4 sm:px-6 md:px-8 py-2.5 md:py-3 bg-[#2e3192] hover:bg-[#252a7a] text-white text-xs md:text-sm font-semibold rounded-lg transition-all duration-150 whitespace-nowrap">
            Post RFQ
          </button>
        </div>
      </div>
    </section>

      {showModal && createPortal(
        <SearchModal
          query={productQuery}
          city={selectedCity}
          onClose={() => setShowModal(false)}
        />,
        document.body
      )}
    </>
  );
}
