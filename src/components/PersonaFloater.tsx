import { useEffect, useRef, useState } from 'react';
import { Layers, Check, X } from 'lucide-react';

export type Persona =
  | 'new-user'
  | 'bl-waiting'
  | 'bl-approved-zero'
  | 'bl-approved-sellers'
  | 'bl-expired';

interface PersonaOption {
  id: Persona;
  label: string;
  description: string;
}

const PERSONA_OPTIONS: PersonaOption[] = [
  { id: 'new-user', label: 'New User', description: 'No BL activity yet' },
  { id: 'bl-waiting', label: 'User with Waiting BL', description: 'BL submitted, pending approval' },
  { id: 'bl-approved-zero', label: 'User with Approved BL (0)', description: 'Approved, no sellers connected' },
  { id: 'bl-approved-sellers', label: 'User with Approved BL + Sellers', description: 'Approved, sellers connected' },
  { id: 'bl-expired', label: 'User with Expired BL', description: 'BL has expired' },
];

interface PersonaFloaterProps {
  activePersona: Persona;
  onSelect: (persona: Persona) => void;
}

export default function PersonaFloater({ activePersona, onSelect }: PersonaFloaterProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
      {open && (
        <div className="w-72 max-w-[85vw] bg-white rounded-2xl shadow-2xl shadow-black/20 border border-gray-200 overflow-hidden animate-[slideInUp_0.15s_ease-out]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-[#1a1a2e]">Homepage version</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="py-1.5 max-h-80 overflow-y-auto">
            {PERSONA_OPTIONS.map((option) => {
              const isActive = option.id === activePersona;
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    onSelect(option.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 text-left px-4 py-2.5 transition-colors ${
                    isActive ? 'bg-[#1d8480]/10' : 'hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-4 h-4 flex-shrink-0 rounded-full border flex items-center justify-center ${
                      isActive ? 'bg-[#1d8480] border-[#1d8480]' : 'border-gray-300'
                    }`}
                  >
                    {isActive && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-sm font-medium ${isActive ? 'text-[#1d8480]' : 'text-gray-800'}`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Homepage versions"
        className="w-14 h-14 rounded-full bg-[#1d8480] text-white shadow-lg shadow-black/20 flex items-center justify-center hover:bg-[#166b67] active:scale-95 transition-all duration-150"
      >
        <Layers className="w-6 h-6" />
      </button>
    </div>
  );
}
