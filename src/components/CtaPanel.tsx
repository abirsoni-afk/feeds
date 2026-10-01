import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Sparkles, PackageSearch } from 'lucide-react';
import SearchModal from './SearchModal';


interface CtaPanelProps {
  variant?: 'mobile' | 'desktop';
}

// Shared greeting + quick-action chip row — the msite "Hi, Abir" bar, reused
// as a first-fold card on desktop (above the feed) so both surfaces offer the
// same entry points to Post Requirement / Advanced Search / profile shortcuts.
export default function CtaPanel({ variant = 'mobile' }: CtaPanelProps) {
  const [showAdvanceSearch, setShowAdvanceSearch] = useState(false);
  const isDesktop = variant === 'desktop';

  // Mobile's greeting + settings row has been dropped; mobile's equivalents
  // (Search, Post Requirement) live in the bottom nav bar instead, so there's
  // nothing left for this panel to render on msite.
  if (!isDesktop) return null;

  return (
    <div className="bg-white rounded-xl px-4 py-3.5">
      {isDesktop && (
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-thin -mx-1 px-1 justify-center">
          <button className="group flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full text-gray-700 hover:bg-gray-50 active:scale-[0.97] transition-all cursor-pointer flex-shrink-0">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 group-hover:bg-teal-50 transition-colors">
              <FileText className="w-4 h-4 text-gray-500 group-hover:text-[#1d8480]" strokeWidth={1.75} />
            </span>
            <span className="text-sm font-medium group-hover:text-[#1d8480] whitespace-nowrap">Post Requirement</span>
          </button>
          <span className="w-px h-4 bg-gray-100 flex-shrink-0" aria-hidden="true" />
          <button
            onClick={() => setShowAdvanceSearch(true)}
            className="group flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full text-gray-700 hover:bg-teal-50 active:scale-[0.97] transition-all cursor-pointer flex-shrink-0"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-50 group-hover:bg-[#1d8480] transition-colors">
              <Sparkles className="w-4 h-4 text-[#1d8480] group-hover:text-white transition-colors" strokeWidth={1.75} />
            </span>
            <span className="text-sm font-semibold group-hover:text-[#1d8480] whitespace-nowrap">Advanced Search</span>
          </button>
          <span className="w-px h-4 bg-gray-100 flex-shrink-0" aria-hidden="true" />
          <button className="group flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full text-gray-700 hover:bg-gray-50 active:scale-[0.97] transition-all cursor-pointer flex-shrink-0">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 group-hover:bg-teal-50 transition-colors">
              <PackageSearch className="w-4 h-4 text-gray-500 group-hover:text-[#1d8480]" strokeWidth={1.75} />
            </span>
            <span className="text-sm font-medium group-hover:text-[#1d8480] whitespace-nowrap">My Orders</span>
          </button>
        </div>
      )}

      {showAdvanceSearch &&
        createPortal(
          <SearchModal query="" city="" onClose={() => setShowAdvanceSearch(false)} />,
          document.body
        )}
    </div>
  );
}
