import { useRef, useState } from 'react';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';

interface FilterSection {
  id: string;
  label: string;
  type: 'pill' | 'checkbox' | 'quantity';
  options: string[];
  singleSelect?: boolean;
}

// Ported from project 2's SearchModal ("Refine your requirement" panel) — spec labels below
// are placeholder/demo data for the generator category and can be swapped per active category.
const FILTER_SECTIONS: FilterSection[] = [
  { id: 'quantity', label: 'Quantity', type: 'quantity', singleSelect: true, options: [] },
  { id: 'power', label: 'Power (kVA)', type: 'pill', singleSelect: true, options: ['15 kVA', '25 kVA', '5 kVA', '62.5 kVA', '125 kVA', '250 kVA'] },
  { id: 'phase', label: 'Phase', type: 'pill', singleSelect: true, options: ['Three Phase', 'Single Phase'] },
  { id: 'gentype', label: 'Generator Type', type: 'pill', singleSelect: true, options: ['Silent', 'Non-Silent', 'Open', 'Portable'] },
];

const QUANTITY_UNITS = ['Piece', 'Dozen', 'Box'];
const ALL_GROUP_IDS = FILTER_SECTIONS.map((s) => s.id);

interface AdvancedSearchWidgetProps {
  onClose?: () => void;
  onFindBestMatch?: (filters: string[], quantity: { value: string; unit: string }) => void;
}

export default function AdvancedSearchWidget({ onClose, onFindBestMatch }: AdvancedSearchWidgetProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [openGroups, setOpenGroups] = useState<string[]>(ALL_GROUP_IDS);
  const [quantityValue, setQuantityValue] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('Piece');
  const [filterShake, setFilterShake] = useState(false);
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasActiveFilters = activeFilters.length > 0;

  function toggleFilter(filter: string, section?: FilterSection) {
    setActiveFilters((prev) => {
      if (prev.includes(filter)) return prev.filter((f) => f !== filter);
      if (section?.singleSelect) {
        return [...prev.filter((f) => !section.options.includes(f)), filter];
      }
      return [...prev, filter];
    });
  }

  function toggleGroup(id: string) {
    setOpenGroups((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  }

  function handleFindBestMatch() {
    if (!hasActiveFilters) {
      setFilterShake(true);
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
      shakeTimer.current = setTimeout(() => setFilterShake(false), 600);
      return;
    }
    onFindBestMatch?.(activeFilters, { value: quantityValue, unit: quantityUnit });
  }

  return (
    <div className="bg-white rounded-xl border border-[hsl(220,10%,84%)] shadow-md overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <p className="text-xs font-semibold text-slate-700">Refine your requirement</p>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close advanced search"
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div
        className={`px-4 py-2 space-y-0 ${filterShake ? 'animate-filter-shake' : ''}`}
        style={filterShake ? { animationFillMode: 'both' } : undefined}
      >
        {FILTER_SECTIONS.map((section) => {
          const isCollapsible = !section.singleSelect;
          const isOpen = isCollapsible ? openGroups.includes(section.id) : true;
          return (
            <div key={section.id} className="pb-1 border-b border-gray-50 last:border-b-0">
              {isCollapsible ? (
                <button
                  onClick={() => toggleGroup(section.id)}
                  className="w-full flex items-center justify-between py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <span>{section.label}</span>
                  {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              ) : (
                <div className="py-2 text-sm font-medium text-slate-600">{section.label}</div>
              )}

              {isOpen &&
                (section.type === 'quantity' ? (
                  <div className="pb-2 flex flex-col gap-1.5">
                    <div className="flex gap-1.5 flex-wrap">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Qty"
                        value={quantityValue}
                        onChange={(e) => setQuantityValue(e.target.value)}
                        className="w-16 text-xs border border-slate-200 rounded px-1.5 py-1.5 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200 transition-all"
                      />
                      {QUANTITY_UNITS.map((unit) => (
                        <button
                          key={unit}
                          onClick={() => setQuantityUnit(unit)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                            quantityUnit === unit
                              ? 'bg-teal-50 border-teal-500 text-teal-700 font-medium'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600'
                          }`}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 pb-2">
                    {section.options.map((opt) => {
                      const active = activeFilters.includes(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() => toggleFilter(opt, section)}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-all ${
                            active
                              ? 'bg-teal-100 border-teal-600 text-teal-800 font-medium'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600'
                          }`}
                        >
                          {active && <Check className="w-3 h-3 flex-shrink-0" strokeWidth={3} />}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-2">
        <div className={`best-match-ring w-full ${hasActiveFilters ? 'is-active' : ''}`}>
          <button
            onClick={handleFindBestMatch}
            className={`w-full py-2.5 text-white text-sm font-semibold rounded-lg transition-all duration-300 ${
              hasActiveFilters ? 'bg-teal-600 hover:bg-teal-700' : 'bg-slate-300 hover:bg-slate-400 cursor-not-allowed'
            }`}
          >
            Find Best Match
          </button>
        </div>
        {!hasActiveFilters && (
          <p className="text-[11px] text-slate-500 text-center font-medium">
            Select at least one spec to find your best match
          </p>
        )}
      </div>
    </div>
  );
}
