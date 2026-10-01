import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Camera, X, ArrowUp, Plus, Mic, Search } from 'lucide-react';
import AIModeGlow from './AIModeGlow';

interface AIModeSearchBarProps {
  placeholder?: string;
  /** Called when AI Mode is triggered with a non-empty keyword — opens the full search/curated-match flow */
  onAiModeTrigger?: (query: string) => void;
}

export default function AIModeSearchBar({ placeholder = 'Search for product/service...', onAiModeTrigger }: AIModeSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');

  // Lock page scroll while the full-screen AI panel is open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const glowActive = isOpen || isFocused;

  return (
    <>
      {/* Compact inline bar — hidden (but layout-preserving) while the full-screen panel is open */}
      <div className="relative flex-1" style={{ visibility: isOpen ? 'hidden' : 'visible' }}>
        <AIModeGlow active={glowActive} className="rounded-full" />
        <motion.div
          layoutId="ai-search-shell"
          className="relative flex items-center h-11 border border-gray-300 rounded-full bg-white overflow-hidden pl-4 pr-1.5 gap-2.5 focus-within:border-[#1d8480] focus-within:shadow-sm transition-colors"
        >
          <button
            aria-label="More options"
            className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="flex-1 min-w-0 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none h-full leading-normal"
          />
          <button
            aria-label="Search by voice"
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            aria-label="Search by image"
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (onAiModeTrigger) {
                onAiModeTrigger(query.trim());
              } else {
                setIsOpen(true);
              }
            }}
            className="ai-cta-gradient flex-shrink-0 flex items-center gap-1.5 pl-3 pr-3.5 h-8 rounded-full text-white shadow-sm hover:shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold whitespace-nowrap">AI Mode</span>
          </button>
        </motion.div>
      </div>

      {/* Full-screen conversational panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center bg-white/90 backdrop-blur-sm px-4 pt-6 sm:pt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative w-full max-w-2xl">
              <AIModeGlow active className="rounded-2xl scale-110" />

              <motion.div
                layoutId="ai-search-shell"
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="relative flex items-center h-12 border border-[#1d8480]/40 rounded-2xl bg-white shadow-lg shadow-black/5 overflow-hidden pl-4 pr-2 gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#1d8480] flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask AI to find suppliers, compare prices, or draft an RFQ..."
                  className="flex-1 min-w-0 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none h-full"
                />
                <button
                  aria-label="Submit"
                  className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-[#1d8480] hover:bg-[#166360] text-white transition-colors disabled:opacity-40"
                  disabled={!query.trim()}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </motion.div>

              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close AI mode"
                className="absolute -top-11 right-0 flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 px-2 py-1.5 transition-colors"
              >
                Close <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-6 text-sm text-gray-400 text-center max-w-md"
            >
              Ask in plain language — AI Mode will search products, sellers, and RFQs for you.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
