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
          gating the habitual stories content buyers expect at the very top.
          Deliberately styled to stand apart from the plain white cards around
          it (gradient fill, badge, explicit CTA) so it reads as a feature
          being promoted, not just another row in the feed. */}
      <div className="px-2 pt-2">
        <button
          type="button"
          onClick={() => setShowAiMode(true)}
          className="relative w-full flex items-center gap-3 overflow-hidden rounded-xl shadow-md px-3.5 py-3.5 text-left active:scale-[0.99] transition-transform bg-gradient-to-r from-[#2e1065] via-[#4c1d95] to-[#6d28d9]"
        >
          <span className="absolute -top-6 -right-4 w-24 h-24 rounded-full bg-fuchsia-400/20 blur-xl" aria-hidden="true" />
          <span className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/15 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-fuchsia-300 animate-[sparkle-pulse_1.6s_ease-in-out_infinite]" />
          </span>
          <span className="relative min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white">AI Mode</span>
              <span className="flex-shrink-0 text-[8px] font-bold uppercase tracking-wide text-fuchsia-200 bg-white/15 rounded px-1.5 py-0.5">
                New
              </span>
            </span>
            <span className="block text-xs text-fuchsia-100/90 mt-0.5 truncate">Describe your need, let AI do the searching</span>
          </span>
          <span className="relative flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-white bg-white/15 rounded-full px-2.5 py-1.5">
            Try now
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
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
