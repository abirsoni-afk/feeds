import { useRef, useState } from 'react';
import { MapPin, Star, ChevronLeft, ChevronRight, ShieldCheck, Phone } from 'lucide-react';

function GstTick() {
  return (
    <span className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
      <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
        <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export interface SuggestedSeller {
  id: string;
  company: string;
  location: string;
  price?: string;
  priceUnit?: string;
  hasGst?: boolean;
  hasTrustSeal?: boolean;
  memberSince?: string;
  rating: number;
  reviewCount: number;
}

interface Props {
  sellers: SuggestedSeller[];
}

// LinkedIn "People you may know"-style horizontal strip of seller cards, used in
// place of a single product photo on active-order cards with multiple sellers.
export default function SellerSuggestCarousel({ sellers }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(sellers.length > 1);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  const scrollBy = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={updateArrows}
        className="flex gap-3 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {sellers.map((s) => (
          <div
            key={s.id}
            className="flex-shrink-0 w-[210px] rounded-2xl border border-gray-200 bg-white p-4 flex flex-col"
          >
            <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">{s.company}</p>

            <div className="mt-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 truncate">{s.location}</span>
            </div>

            <div className="mt-2 min-h-[20px] flex items-baseline gap-1">
              {s.price && (
                <>
                  <span className="text-sm font-bold text-gray-900">{s.price}</span>
                  <span className="text-[11px] text-gray-500">{s.priceUnit}</span>
                </>
              )}
            </div>

            <div className="mt-2 min-h-[18px] flex items-center gap-1.5">
              {s.hasGst !== false && (
                <>
                  <GstTick />
                  <span className="text-xs text-gray-600">GST</span>
                </>
              )}
            </div>

            <div className="mt-2 flex items-center gap-1.5">
              <ShieldCheck className={`w-4 h-4 flex-shrink-0 ${s.hasTrustSeal !== false ? 'text-emerald-600' : 'text-gray-400'}`} />
              <span className="text-xs text-gray-600">{s.hasTrustSeal !== false ? 'Payment Protected' : 'Click to Verify'}</span>
            </div>

            <p className="mt-2 min-h-[16px] text-xs text-gray-500">{s.memberSince ? `Member since ${s.memberSince}` : ''}</p>

            <div className="mt-2 flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${star <= Math.round(s.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
                />
              ))}
              <span className="text-xs font-semibold text-gray-700 ml-1">{s.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({s.reviewCount})</span>
            </div>

            <div className="mt-auto pt-3 flex items-center gap-1.5">
              <button className="flex-1 px-3 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all bg-[#1d8480] text-white hover:bg-[hsl(174,97%,27%)] shadow-sm hover:shadow-md active:scale-95">
                Chat Now
              </button>
              <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap border border-[#1d8480] text-[#1d8480] bg-white hover:bg-teal-50 transition-all active:scale-95">
                <Phone className="w-3 h-3" />
                Call Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {sellers.length > 1 && canPrev && (
        <button
          onClick={() => scrollBy(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-6 h-6 rounded-full flex items-center justify-center border border-gray-300 bg-white/90 hover:bg-white text-gray-600 shadow-sm transition-all z-10"
          aria-label="Previous"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}

      {sellers.length > 1 && canNext && (
        <button
          onClick={() => scrollBy(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-6 h-6 rounded-full flex items-center justify-center border border-gray-300 bg-white/90 hover:bg-white text-gray-600 shadow-sm transition-all z-10"
          aria-label="Next"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
