import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Phone, Plus, Send, Check, X, MapPin } from 'lucide-react';
import { createPortal } from 'react-dom';
import SearchModal from './SearchModal';
import { topFoldListingResponse } from '../data/feedListingResponse';
import { parseTopFoldStories, timeSince, TopFoldStoryGroup } from '../utils/topFoldStories';

// B2B-flavoured take on the "stories" rail pattern: same horizontally
// scrollable thumbnail shape as a social feed's stories, but each card
// surfaces a real seller post (fresh listing / factory photo / stock update)
// pulled from the real Seller Feed Listing API response, grouped by seller
// so one card can hold more than one story — keeps the familiar, glanceable
// interaction without borrowing any social-network framing.
export default function StoriesRow() {
  const [showAdvanceSearch, setShowAdvanceSearch] = useState(false);
  const [viewer, setViewer] = useState<{ group: number; story: number } | null>(null);

  // Status !== "Success" or an empty Posts object both just mean nothing to
  // show here — never an error state (per the API's own contract).
  const groups = useMemo(() => parseTopFoldStories(topFoldListingResponse), []);

  function openStory(groupIdx: number) {
    setViewer({ group: groupIdx, story: 0 });
  }
  function closeStory() {
    setViewer(null);
  }
  function nextStory() {
    setViewer(v => {
      if (!v) return v;
      const g = groups[v.group];
      if (v.story < g.stories.length - 1) return { group: v.group, story: v.story + 1 };
      if (v.group < groups.length - 1) return { group: v.group + 1, story: 0 };
      return null; // closed the last story of the last seller
    });
  }
  function prevStory() {
    setViewer(v => {
      if (!v) return v;
      if (v.story > 0) return { group: v.group, story: v.story - 1 };
      if (v.group > 0) return { group: v.group - 1, story: groups[v.group - 1].stories.length - 1 };
      return v; // already at the very first story
    });
  }

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

        {groups.map((group, idx) => {
          const first = group.stories[0];
          return (
            <button
              key={group.sellerId}
              type="button"
              onClick={() => openStory(idx)}
              className="relative flex-shrink-0 w-[92px] h-[150px] rounded-xl overflow-hidden group"
            >
              <img
                src={group.coverImage}
                alt={first.overlayText || group.companyName}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/0" />

              {/* Multiple posts from this seller — small story-count pips, same pattern as the
                  viewer's own progress segments so the grouping reads consistently */}
              {group.stories.length > 1 && (
                <div className="absolute top-2 inset-x-2 flex gap-1">
                  {group.stories.map(s => (
                    <span key={s.feedPostId} className="h-[2.5px] flex-1 rounded-full bg-white/60" />
                  ))}
                </div>
              )}

              <div className="absolute bottom-0 inset-x-0 px-2 pb-2 text-left">
                <p className="text-[11px] font-semibold text-white leading-tight line-clamp-2">
                  {first.overlayText || group.companyName}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {showAdvanceSearch &&
        createPortal(
          <SearchModal query="" city="" onClose={() => setShowAdvanceSearch(false)} />,
          document.body
        )}

      {viewer &&
        createPortal(
          <StoryViewer
            groups={groups}
            groupIdx={viewer.group}
            storyIdx={viewer.story}
            onNext={nextStory}
            onPrev={prevStory}
            onClose={closeStory}
          />,
          document.body
        )}
    </div>
  );
}

interface StoryViewerProps {
  groups: TopFoldStoryGroup[];
  groupIdx: number;
  storyIdx: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

function StoryViewer({ groups, groupIdx, storyIdx, onNext, onPrev, onClose }: StoryViewerProps) {
  const group = groups[groupIdx];
  const story = group?.stories[storyIdx];
  const [enquirySent, setEnquirySent] = useState(false);
  const [callRevealed, setCallRevealed] = useState(false);

  if (!group || !story) return null;

  const locationLine = [story.cityName, story.stateName].filter(Boolean).join(', ');
  const subtext = [locationLine, timeSince(story.createdAt)].filter(Boolean).join(' · ');

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <div
        className="relative w-full h-full md:w-[420px] md:h-[90vh] md:max-h-[860px] md:rounded-2xl overflow-hidden bg-black flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Progress segments — one per story in this seller's group */}
        <div className="absolute top-0 inset-x-0 z-20 flex gap-1 px-2 pt-2">
          {group.stories.map((s, i) => (
            <div key={s.feedPostId} className="h-[2.5px] flex-1 rounded-full bg-white/35 overflow-hidden">
              <div className={`h-full bg-white transition-all ${i <= storyIdx ? 'w-full' : 'w-0'}`} />
            </div>
          ))}
        </div>

        {/* Header — seller link (real external URL), location + time, close */}
        <div className="absolute top-4 inset-x-0 z-20 flex items-center gap-2 px-3 pt-2">
          <div className="min-w-0 flex-1">
            <a
              href={story.catalogUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-[13px] font-semibold text-white truncate hover:underline block"
            >
              {group.companyName}
            </a>
            {subtext && (
              <p className="flex items-center gap-1 text-[11px] text-white/75 truncate">
                <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                {subtext}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image + tap zones for prev/next */}
        <div className="relative flex-1 min-h-0">
          <img
            key={story.feedPostId}
            src={story.image1000}
            alt={story.overlayText || group.companyName}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/40" />

          <button
            type="button"
            aria-label="Previous story"
            onClick={onPrev}
            className="absolute left-0 top-0 h-full w-1/3"
          />
          <button
            type="button"
            aria-label="Next story"
            onClick={onNext}
            className="absolute right-0 top-0 h-full w-2/3"
          />

          {/* Visible nav arrows — desktop-friendly affordance on top of the tap zones */}
          <div
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white hover:bg-black/55 transition-colors pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
          </div>
          <div
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white hover:bg-black/55 transition-colors pointer-events-none"
          >
            <ChevronRight className="w-4 h-4" />
          </div>

          {/* Type tag + overlay text + category, bottom of the image */}
          <div className="absolute bottom-0 inset-x-0 z-10 px-4 pb-4">
            <span className="inline-block mb-2 px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold">
              {story.postTypeLabel}
            </span>
            {story.overlayText && (
              <p className="text-base font-bold text-white leading-snug line-clamp-2">{story.overlayText}</p>
            )}
            {story.caption && (
              <p className="mt-1 text-xs text-white/85 line-clamp-2">{story.caption}</p>
            )}
            {story.mcatId !== null && story.mcatName && (
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-white/15 text-white text-[10px] font-medium">
                {story.mcatName}
              </span>
            )}
          </div>
        </div>

        {/* CTAs — Get Best Price + Call, pinned to the bottom */}
        <div className="flex-shrink-0 flex items-center gap-2 p-3 bg-black">
          <button
            type="button"
            onClick={() => setEnquirySent(true)}
            disabled={enquirySent}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95 ${
              enquirySent
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-[#1d8480] text-white hover:bg-[hsl(174,97%,27%)]'
            }`}
          >
            {enquirySent ? <><Check className="w-4 h-4" strokeWidth={3} />Sent!</> : <><Send className="w-4 h-4" />Get Best Price</>}
          </button>
          <button
            type="button"
            onClick={() => setCallRevealed(true)}
            disabled={!story.sellerPnsNumber}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold border border-white/30 text-white hover:bg-white/10 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Phone className="w-4 h-4" />
            {callRevealed && story.sellerPnsNumber ? story.sellerPnsNumber : 'Call Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
