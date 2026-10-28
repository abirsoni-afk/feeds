import { useEffect, useState } from 'react';
import { Clock, Sparkles } from 'lucide-react';
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

// Header search autosuggest dropdown (desktop) — matches the real product's
// header suggester: a clock icon + bold indigo text per row, flush against the
// input with thin row dividers, no card chrome. Shows up to 3 matching
// product/service suggestions plus a 4th "Ask AI" row, styled distinctly as
// the AI entry point, that takes the buyer straight to the Advance Search
// results/refine screen (not the blank "what are you looking for" screen)
// with their typed keyword already applied.
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
      className="absolute top-full left-0 right-0 bg-white border border-slate-200 border-t-0 rounded-b-lg shadow-lg overflow-hidden z-30"
      // Prevent the input's onBlur from firing (and closing this) before the click registers.
      onMouseDown={e => e.preventDefault()}
    >
      {suggestions.map(label => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(label)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100"
        >
          <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-[15px] font-bold text-[#2e3192] truncate">{label}</span>
        </button>
      ))}

      <button
        type="button"
        onClick={() => onAskAi(trimmed)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left bg-fuchsia-50/40 hover:bg-fuchsia-50 transition-colors"
      >
        <Sparkles className="w-4 h-4 flex-shrink-0 text-fuchsia-400 animate-[sparkle-pulse_1.6s_ease-in-out_infinite]" />
        <span className="text-[15px] font-bold text-slate-800 truncate flex-1 min-w-0">
          Ask AI about {trimmed}
        </span>
        <span className="ml-auto flex-shrink-0 whitespace-nowrap text-[8px] font-bold uppercase tracking-wide text-fuchsia-600 bg-fuchsia-100 rounded px-1.5 py-0.5">
          New
        </span>
      </button>
    </div>
  );
}
