import { useState } from 'react';
import { Plus } from 'lucide-react';
import { createPortal } from 'react-dom';
import { sellers } from '../data/feedData';
import SearchModal from './SearchModal';

// B2B-flavoured take on the "stories" rail pattern: same horizontally
// scrollable thumbnail shape as a social feed's stories, but each card
// surfaces a real product (name + ring-highlighted seller avatar) instead
// of a personal update — keeps the familiar, glanceable interaction without
// borrowing any social-network framing.
interface StoryDef {
  id: string;
  productName: string;
  image: string;
  avatar: string;
}

const STORY_DEFS: StoryDef[] = [
  { id: 's1', productName: 'Hot Rolled Steel Coils' },
  { id: 's2', productName: 'Microprocessor Chips' },
  { id: 's3', productName: 'HDPE Plastic Granules' },
  { id: 's4', productName: 'Cotton Fabric Rolls' },
  { id: 's5', productName: 'Engine Bearing Sets' },
  { id: 's8', productName: 'Printing Paper Reams' },
  { id: 's7', productName: 'TMT Steel Bars' },
  { id: 's6', productName: 'Pharma Raw Materials' },
].map(def => {
  const seller = sellers.find(s => s.id === def.id)!;
  return { ...def, image: seller.coverImage, avatar: seller.avatar };
});

export default function StoriesRow() {
  const [showAdvanceSearch, setShowAdvanceSearch] = useState(false);

  return (
    <div className="bg-white rounded-xl px-3 py-3 overflow-hidden">
      <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-thin -mx-1 px-1 pb-0.5">
        {/* Post Requirement — the B2B equivalent of "Create story", opens the same
            Advanced Search flow as the CTA panel rather than a status composer */}
        <button
          onClick={() => setShowAdvanceSearch(true)}
          className="relative flex-shrink-0 w-[92px] h-[150px] rounded-xl overflow-hidden bg-gradient-to-b from-teal-50 to-white border border-slate-200 flex flex-col items-center justify-end group hover:border-teal-300 transition-colors"
        >
          <div className="absolute inset-x-0 top-0 h-[104px] bg-gradient-to-br from-[#1d8480] to-teal-600" />
          <span className="relative z-10 mb-1 flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-md text-[#1d8480] group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </span>
          <span className="relative z-10 px-2 pb-2.5 pt-1 text-[11px] font-semibold text-slate-800 text-center leading-tight">
            Post Requirement
          </span>
        </button>

        {STORY_DEFS.map(story => (
          <button
            key={story.id}
            type="button"
            className="relative flex-shrink-0 w-[92px] h-[150px] rounded-xl overflow-hidden group"
          >
            <img
              src={story.image}
              alt={story.productName}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/0" />

            <div className="absolute bottom-0 inset-x-0 px-2 pb-2 text-left">
              <p className="text-[11px] font-semibold text-white leading-tight line-clamp-2">{story.productName}</p>
            </div>
          </button>
        ))}
      </div>

      {showAdvanceSearch &&
        createPortal(
          <SearchModal query="" city="" onClose={() => setShowAdvanceSearch(false)} />,
          document.body
        )}
    </div>
  );
}
