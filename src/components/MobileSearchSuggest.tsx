import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpLeft, Camera, Clock, Search, Sparkles } from 'lucide-react';
import { fetchSuggestions } from '../utils/suggest';

const RECENT_SEARCHES = ['potato', 'air coolers', 'organic potato', 'potatoes'];

// Shown before the live suggester responds, or if it fails (network-restricted
// in this environment) / returns nothing for the typed text.
const FALLBACK_SUGGESTIONS = [
  'Cotton Kurti', 'Rayon Embroidered Kurti', 'Diesel Generator', 'LED Bulb',
  'Steel Pipes', 'Packaging Machine', 'Solar Panel', 'Air Compressor',
];

interface MobileSearchSuggestProps {
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (query: string, ai?: boolean) => void;
}

export default function MobileSearchSuggest({ query, onQueryChange, onClose, onSubmit }: MobileSearchSuggestProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchSuggestions(trimmed, controller.signal)
        .then(list => {
          if (list.length > 0) {
            setSuggestions(list);
          } else {
            setSuggestions(
              FALLBACK_SUGGESTIONS.filter(s => s.toLowerCase().includes(trimmed.toLowerCase()))
            );
          }
        })
        .catch(() => {
          setSuggestions(
            FALLBACK_SUGGESTIONS.filter(s => s.toLowerCase().includes(trimmed.toLowerCase()))
          );
        });
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);

  const trimmed = query.trim();
  const filteredRecent = trimmed
    ? RECENT_SEARCHES.filter(s => s.toLowerCase().includes(trimmed.toLowerCase()))
    : RECENT_SEARCHES;
  const listToShow = trimmed ? suggestions : FALLBACK_SUGGESTIONS.slice(0, 2);

  return (
    <div className="fixed inset-0 z-[9998] bg-white flex flex-col">
      {/* Header — back arrow, input, camera, search */}
      <div className="flex-shrink-0 flex items-center gap-2.5 px-3 h-14 border-b border-slate-200">
        <button type="button" onClick={onClose} aria-label="Back" className="flex-shrink-0 p-1 text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && trimmed) onSubmit(trimmed); }}
          placeholder="Search for a Product / Service"
          className="flex-1 min-w-0 border-0 bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="button"
          aria-label="Search by image"
          className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-md border border-dashed border-red-300"
        >
          <Camera className="w-4 h-4 text-teal-600" />
        </button>
        <button
          type="button"
          onClick={() => trimmed && onSubmit(trimmed)}
          aria-label="Search"
          className="flex-shrink-0 p-1 text-slate-500"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Body — scrollable list */}
      <div className="flex-1 overflow-y-auto">
        {/* Ask AI — only once there's something to ask about */}
        {trimmed && (
          <button
            type="button"
            onClick={() => onSubmit(trimmed, true)}
            className="w-full flex items-center gap-3 px-4 py-3 border-b border-slate-100 hover:bg-teal-50 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span className="flex-1 text-left text-sm font-semibold text-teal-700">
              Ask AI about "{trimmed}"
            </span>
          </button>
        )}

        {filteredRecent.map(label => (
          <SuggestRow key={`recent-${label}`} icon={<Clock className="w-4 h-4 text-slate-400" />} label={label} onSelect={() => onSubmit(label)} onFill={() => onQueryChange(label)} />
        ))}
        {listToShow.map(label => (
          <SuggestRow key={`sugg-${label}`} icon={<Search className="w-4 h-4 text-slate-400" />} label={label} onSelect={() => onSubmit(label)} onFill={() => onQueryChange(label)} />
        ))}

        <div className="px-4 pt-3 pb-4">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-blue-800 text-blue-800 text-sm font-semibold"
          >
            <Camera className="w-4 h-4" />
            Search with photo
          </button>
        </div>
      </div>
    </div>
  );
}

function SuggestRow({ icon, label, onSelect, onFill }: { icon: React.ReactNode; label: string; onSelect: () => void; onFill: () => void }) {
  return (
    <div className="w-full flex items-center gap-3 px-4 py-3 border-b border-slate-100">
      <button type="button" onClick={onSelect} className="flex-shrink-0">{icon}</button>
      <button type="button" onClick={onSelect} className="flex-1 min-w-0 text-left text-sm font-semibold text-slate-800 truncate">
        {label}
      </button>
      <button type="button" onClick={onFill} aria-label={`Fill search with ${label}`} className="flex-shrink-0 p-1 text-slate-400">
        <ArrowUpLeft className="w-4 h-4" />
      </button>
    </div>
  );
}
