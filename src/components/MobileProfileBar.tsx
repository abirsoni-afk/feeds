import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, ChevronRight } from 'lucide-react';
import CtaPanel from './CtaPanel';
import StoriesRow from './StoriesRow';
import StoryFeedCards from './StoryFeedCards';
import SearchModal from './SearchModal';
import { Persona } from './PersonaFloater';

interface MobileProfileBarProps {
  persona?: Persona;
}

export default function MobileProfileBar({ persona }: MobileProfileBarProps) {
  const [showAiMode, setShowAiMode] = useState(false);

  return (
    <div className="lg:hidden">
      <CtaPanel variant="mobile" />
      <div className="px-2 pt-2">
        {persona === 'new-user' ? <StoryFeedCards /> : <StoriesRow />}
      </div>

      {/* AI Mode banner — sits right below stories: high visibility without
          gating the habitual stories content buyers expect at the very top. */}
      <div className="px-2 pt-2">
        <button
          type="button"
          onClick={() => setShowAiMode(true)}
          className="w-full flex items-center gap-2.5 bg-white rounded-xl shadow-md px-3.5 py-3 text-left active:scale-[0.99] transition-transform"
        >
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-fuchsia-50 flex-shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-fuchsia-500 animate-[sparkle-pulse_1.6s_ease-in-out_infinite]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-slate-900">AI Mode</span>
            <span className="block text-xs text-slate-500 mt-0.5 truncate">Describe your need, let AI do the searching</span>
          </span>
          <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
        </button>
      </div>

      {showAiMode &&
        createPortal(
          <SearchModal query="" city="" aiMode onClose={() => setShowAiMode(false)} />,
          document.body
        )}
    </div>
  );
}
