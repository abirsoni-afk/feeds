import { useRef, useState } from 'react';
import { MapPin, BadgeCheck, ShieldCheck, Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Seller {
  id: string;
  company: string;
  location: string;
  price: string;
  priceUnit: string;
  hasGst: boolean;
  memberSince: string;
  rating?: number;
  reviewCount?: number;
  hasTrustSeal?: boolean;
}

interface Props {
  sellers: Seller[];
  cta: string;
  ctaSecondary: string;
}

export default function ConnectedSellersCarousel({ sellers, cta }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / sellers.length;
    const newIdx = Math.max(0, Math.min(sellers.length - 1, activeIdx + (dir === 'left' ? -1 : 1)));
    el.scrollTo({ left: newIdx * cardWidth, behavior: 'smooth' });
    setActiveIdx(newIdx);
  };

  const canLeft = activeIdx > 0;
  const canRight = activeIdx < sellers.length - 1;

  return (
    <div className="px-4 pt-3 pb-3 border-t border-gray-100">
      <div className="relative">
        {canLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-3 h-3 text-gray-600" />
          </button>
        )}
        {canRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-3 h-3 text-gray-600" />
          </button>
        )}
        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        >
        {sellers.map((s) => (
          <div
            key={s.id}
            className="snap-start shrink-0 w-[185px] rounded-xl border border-gray-200 bg-white p-3 flex flex-col gap-1.5"
          >
            {/* Line 1 — Company */}
            <p className="text-xs font-bold text-gray-900 truncate leading-tight">{s.company}</p>

            {/* Line 2 — Location (fixed-height) */}
            <div className="flex items-center gap-1 min-h-[14px]">
              <MapPin className="w-2.5 h-2.5 text-gray-400 shrink-0" />
              <span className="text-[10px] text-gray-500 truncate">{s.location}</span>
            </div>

            {/* Line 3 — Price */}
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-gray-900">{s.price}</span>
              <span className="text-[10px] text-gray-500">{s.priceUnit}</span>
            </div>

            {/* Line 4 — GST (fixed-height, blank when missing) */}
            <div className="flex items-center gap-1 min-h-[14px]">
              {s.hasGst ? (
                <>
                  <BadgeCheck className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                  <span className="text-[10px] text-gray-600">GST</span>
                </>
              ) : null}
            </div>

            {/* Line 4b — Payment Protected / TrustSEAL (fixed-height, blank when missing) */}
            <div className="flex items-center gap-1 min-h-[14px]">
              {s.hasTrustSeal !== false ? (
                <>
                  <ShieldCheck className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                  <span className="text-[10px] text-gray-600">Payment Protected</span>
                </>
              ) : null}
            </div>

            {/* Line 5 — Member since (fixed-height) */}
            <p className="text-[10px] text-gray-500 min-h-[14px]">Member since {s.memberSince}</p>

            {/* Line 6 — Rating (fixed-height, blank when missing) */}
            <div className="flex items-center gap-1 min-h-[14px]">
              {typeof s.rating === 'number' ? (
                <>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-2.5 h-2.5 ${star <= Math.round(s.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
                    />
                  ))}
                  <span className="text-[10px] font-semibold text-gray-700 ml-0.5">{s.rating}</span>
                  <span className="text-[9px] text-gray-400">({s.reviewCount})</span>
                </>
              ) : null}
            </div>

            {/* CTA */}
            <button className={`mt-1 w-full px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${cta}`}>
              Continue with Seller
            </button>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
