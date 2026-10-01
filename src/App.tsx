import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageSquare, Search, Sparkle, FilePlus2, CheckCircle2 } from 'lucide-react';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import MainFeed from './components/MainFeed';
import RightSidebar from './components/RightSidebar';
import MobileProfileBar from './components/MobileProfileBar';
import PersonaFloater, { Persona } from './components/PersonaFloater';
import SearchModal from './components/SearchModal';
import { FeedFilter } from './data/feedData';

export default function App() {
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all');
  const [rfqVisible, setRfqVisible] = useState(true);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [activePersona, setActivePersona] = useState<Persona>('bl-waiting');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header
        showSearch={!rfqVisible}
        onProfileClick={() => setLeftDrawerOpen(true)}
      />

      {/* Page body below fixed nav — single scrollable surface */}
      <div className="pt-[103px] md:pt-[55px] h-screen overflow-y-auto scrollbar-thin pb-16 lg:pb-0">
        <MobileProfileBar />
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex gap-4 items-start">
            {/* Column 1 — sticky on desktop, drawer on mobile */}
            <div className="hidden lg:block w-64 flex-shrink-0 py-5 sticky top-0">
              <LeftSidebar persona={activePersona} />
            </div>

            {/* Column 2 — main content */}
            <div className="flex-1 min-w-0 py-5">
              <MainFeed activeFilter={activeFilter} onRfqVisibilityChange={setRfqVisible} persona={activePersona} />
            </div>

            {/* Column 3 — sticky on desktop+tablet, drawer on mobile */}
            <div className="hidden md:block lg:w-64 md:w-56 flex-shrink-0 py-5 sticky top-0">
              <RightSidebar persona={activePersona} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation — labeled icons for the four primary destinations */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        <div className="flex items-stretch justify-around h-16">
          <button
            onClick={() => setRightDrawerOpen(true)}
            aria-label="Messages"
            className="group flex flex-col items-center justify-center gap-1 w-full h-full transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-[#1d8480] group-hover:text-[#166361] transition-colors" strokeWidth={1.75} />
            <span className="text-[10px] font-medium text-gray-900">Messages</span>
          </button>
          <button
            onClick={() => setShowMobileSearch(true)}
            aria-label="Advanced Search"
            className="group flex flex-col items-center justify-center gap-1 w-full h-full transition-colors"
          >
            <span className="relative">
              <Search className="w-5 h-5 text-[#1d8480] group-hover:text-[#166361] transition-colors" strokeWidth={1.75} />
              <Sparkle className="absolute -top-1 -right-1 w-2 h-2 text-[#1d8480] group-hover:text-[#166361] transition-colors" strokeWidth={2} fill="currentColor" />
            </span>
            <span className="text-[10px] font-medium text-gray-900">Advanced Search</span>
          </button>
          <button
            aria-label="Post Requirement"
            className="group relative flex flex-col items-center justify-center gap-1 w-full h-full transition-colors"
          >
            <span className="relative">
              <FilePlus2 className="w-5 h-5 text-[#1d8480] group-hover:text-[#166361] transition-colors" strokeWidth={1.75} />
              <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
            </span>
            <span className="text-[10px] font-medium text-gray-900">Post Requirement</span>
          </button>
          <button
            aria-label="Get Verified"
            className="group flex flex-col items-center justify-center gap-1 w-full h-full transition-colors"
          >
            <CheckCircle2 className="w-5 h-5 text-[#1d8480] group-hover:text-[#166361] transition-colors" strokeWidth={1.75} />
            <span className="text-[10px] font-medium text-gray-900">Get Verified</span>
          </button>
        </div>
      </nav>

      {/* Left drawer — workspace / profile */}
      {leftDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setLeftDrawerOpen(false)} />
          <div className="relative w-72 max-w-[85vw] bg-[hsl(220,20%,97%)] h-full overflow-y-auto scrollbar-thin pt-4 pb-20 px-3 shadow-2xl animate-[slideInLeft_0.2s_ease-out]">
            <button
              onClick={() => setLeftDrawerOpen(false)}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-700 shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
            <LeftSidebar persona={activePersona} />
          </div>
        </div>
      )}

      {/* Mobile bottom-nav Search — same Advanced Search modal used elsewhere */}
      {showMobileSearch &&
        createPortal(
          <SearchModal query="" city="" onClose={() => setShowMobileSearch(false)} />,
          document.body
        )}

      {/* Right drawer — messages / sellers / RFQ */}
      {rightDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRightDrawerOpen(false)} />
          <div className="relative w-72 max-w-[85vw] bg-[hsl(220,20%,97%)] h-full overflow-y-auto scrollbar-thin pt-4 pb-20 px-3 shadow-2xl animate-[slideInRight_0.2s_ease-out]">
            <button
              onClick={() => setRightDrawerOpen(false)}
              className="absolute top-3 left-3 z-10 p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-700 shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
            <RightSidebar persona={activePersona} />
          </div>
        </div>
      )}

      <PersonaFloater activePersona={activePersona} onSelect={setActivePersona} />
    </div>
  );
}
