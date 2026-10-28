import { useEffect, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { fetchSuggestions } from '../utils/suggest';

// Shown before the live suggester responds, or if it fails (network-restricted
// in this environment) / returns nothing for the typed text. Keyed loosely so a
// query like "diesel" surfaces its generator-related variants first.
const FALLBACK_SUGGESTIONS = [
  'Diesel Cans', 'Diesel Generators', 'Silent Diesel Generators',
  'Cotton Kurti', 'Rayon Embroidered Kurti', 'LED Bulb',
  'Steel Pipes', 'Packaging Machine', 'Solar Panel', 'Air Compressor',
];

interface DesktopSearchSuggestProps {
  query: string;
  onSelect: (label: string) => void;
  onAskAi: (query: string) => void;
}

// Header search autosuggest dropdown (desktop) — shows up to 3 matching product/
// service suggestions plus a 4th "Ask AI" row, styled like an upsell, that takes
// the buyer straight to the Advance Search results/refine screen (not the blank
// "what are you looking for" screen) with their typed keyword already applied.
export default function DesktopSearchSuggest({ query, onSelect, onAskAi }: DesktopSearchSuggestProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const trimmed = query.trim();

  useEffect(() => {
    if (!trimmed) {
      setSuggestions([]);
      return;
    }
    const fallback = FALLBACK_SUGGESTIONS.filter(s => s.toLowerCase().includes(trimmed.toLowerCase())).slice(0, 3);
    setSuggestions(fallback);

    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchSuggestions(trimmed, controller.signal)
        .then(list => {
          if (list.length > 0) setSuggestions(list.slice(0, 3));
        })
        .catch(() => {});
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [trimmed]);

  if (!trimmed) return null;

  return (
    <div
      className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-30"
      // Prevent the input's onBlur from firing (and closing this) before the click registers.
      onMouseDown={e => e.preventDefault()}
    >
      {suggestions.map(label => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(label)}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-100"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-sm text-slate-800 truncate">{label}</span>
        </button>
      ))}

      <button
        type="button"
        onClick={() => onAskAi(trimmed)}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-slate-50 transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-fuchsia-400" />
        <span className="text-sm text-slate-800 truncate">
          Find the best options for {trimmed}
        </span>
      </button>
    </div>
  );
}
