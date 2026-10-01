import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { fetchSuggestions } from '../utils/suggest';

interface SuggestSearchInputProps {
  placeholder?: string;
  autoFocus?: boolean;
  inputClassName?: string;
  wrapperClassName?: string;
  iconClassName?: string;
  onSearch?: (query: string, city: string) => void;
}

interface DropdownRect {
  left: number;
  width: number;
  top: number; // distance from viewport top to the input's BOTTOM edge — the dropdown sits just below this
}

const CITIES = [
  'Noida',
  'Greater Noida',
  'Delhi',
  'Gurugram',
  'Mumbai',
  'Bengaluru',
  'Pune',
  'Ahmedabad',
];

export default function SuggestSearchInput({
  placeholder = 'a product or service',
  autoFocus = false,
  inputClassName = '',
  wrapperClassName = '',
  iconClassName = '',
  onSearch,
}: SuggestSearchInputProps) {
  const [query, setQuery] = useState('');
  const [justOpened, setJustOpened] = useState(false);
  const wasOpenRef = useRef(false);
  const [city, setCity] = useState(CITIES[0]);
  const [cityOpen, setCityOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rect, setRect] = useState<DropdownRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const abortRef = useRef<AbortController>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;
      fetchSuggestions(trimmed, controller.signal)
        .then((results) => {
          setSuggestions(results);
          setOpen(true);
        })
        .catch((err) => {
          if (err?.name !== 'AbortError') setSuggestions([]);
        })
        .finally(() => setLoading(false));
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Keep the portal-rendered dropdown's position pinned to the input,
  // below it, while it's open (survives scroll and the expand/collapse
  // animation of the card it lives in).
  useEffect(() => {
    if (!open) return;

    function updateRect() {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ left: r.left, width: r.width, top: r.bottom });
    }

    updateRect();
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);
    return () => {
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [open]);

  // Close the suggestion dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close the city dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Play the gradient-border sweep once, only at the moment this field
  // opens (autoFocus flips false -> true) — not on every re-render, and
  // never looping.
  useEffect(() => {
    if (autoFocus && !wasOpenRef.current) {
      setJustOpened(true);
      const t = setTimeout(() => setJustOpened(false), 900);
      wasOpenRef.current = true;
      return () => clearTimeout(t);
    }
    wasOpenRef.current = autoFocus;
  }, [autoFocus]);

  const showDropdown = open && (loading || suggestions.length > 0);

  function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpen(false);
    onSearch?.(trimmed, city);
  }

  return (
    <div ref={containerRef} className={`relative ${wrapperClassName}`}>
      <div
        className={`flex items-center gap-1.5 h-10 pl-3 pr-1.5 rounded-lg bg-white transition-colors ${
          justOpened ? 'ai-cta-gradient-border ai-cta-gradient-border-once' : 'border-2 border-teal-200 focus-within:border-teal-500'
        }`}
      >
        <span className="flex-shrink-0 text-sm text-slate-500 whitespace-nowrap">I need</span>
        <input
          autoFocus={autoFocus}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          placeholder={placeholder}
          className={`flex-1 min-w-0 text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none ${inputClassName}`}
        />
        <span className="flex-shrink-0 text-sm text-slate-500 whitespace-nowrap">in</span>

        <div ref={cityRef} className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setCityOpen((v) => !v)}
            className="flex items-center gap-1 px-2 h-7 rounded-md text-sm font-semibold text-teal-700 hover:bg-teal-50 transition-colors whitespace-nowrap"
          >
            {city}
            <ChevronDown className={`w-3.5 h-3.5 text-teal-500 flex-shrink-0 transition-transform ${cityOpen ? 'rotate-180' : ''} ${iconClassName}`} />
          </button>

          {cityOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-xl z-[9999] max-h-56 overflow-y-auto scrollbar-thin">
              {CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setCity(c);
                    setCityOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${c === city ? 'text-teal-700 font-semibold bg-teal-50' : 'text-slate-700 hover:bg-teal-50 hover:text-teal-700'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSearch}
          disabled={!query.trim()}
          className="flex-shrink-0 px-3 h-7 rounded-md bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
        >
          Search
        </button>
      </div>

      {showDropdown && rect && createPortal(
        <div
          className="fixed bg-white border border-slate-200 rounded-lg shadow-xl z-[9999] max-h-64 overflow-y-auto scrollbar-thin"
          style={{
            left: rect.left,
            width: rect.width,
            // Anchored BELOW the input, breaking out of any clipped/overflow-hidden
            // ancestor (e.g. the collapsible card this field lives in) since this
            // renders into document.body via a portal.
            top: rect.top + 8,
          }}
        >
          {loading && suggestions.length === 0 ? (
            <p className="px-3 py-2 text-xs text-slate-400">Searching...</p>
          ) : (
            suggestions.map((label, i) => (
              <button
                key={`${label}-${i}`}
                type="button"
                onMouseDown={(e) => {
                  // onMouseDown so the click registers before the input's blur closes the dropdown
                  e.preventDefault();
                  setQuery(label);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
              >
                {label}
              </button>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
