import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const categories = [
  {
    name: 'TMT Steel Bars',
    image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    name: 'Electronic Components',
    image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    name: 'HDPE Granules',
    image: 'https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    name: 'Industrial Machinery',
    image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    name: 'Cotton Fabric',
    image: 'https://images.pexels.com/photos/3735184/pexels-photo-3735184.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    name: 'Auto Parts',
    image: 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

const SCROLL_AMOUNT = 160;

export default function CategorySuggestionsCard() {
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      ro.disconnect();
    };
  }, [updateArrows]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Section label — sits outside the widget box, same divider treatment as the feed's
          "Similar to Products You Viewed" label */}
      <div className="flex items-center gap-2 py-1">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#2e3192] flex-shrink-0">
          Categories You May Like
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <article className="mt-2 bg-white rounded-xl shadow-md overflow-hidden">
      {/* Scroll area with side arrows */}
      <div className="relative pb-4">
        {/* Left arrow */}
        {canLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full border border-[hsl(220,10%,84%)] bg-white hover:bg-gray-50 flex items-center justify-center shadow-md transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* Right arrow */}
        {canRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full border border-[hsl(220,10%,84%)] bg-white hover:bg-gray-50 flex items-center justify-center shadow-md transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* Cards */}
        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto px-4 scrollbar-hide"
        >
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="flex-shrink-0 w-36 rounded-xl border border-[hsl(220,15%,91%)] overflow-hidden bg-[hsl(220,20%,98%)] flex flex-col"
            >
              <div className="aspect-square bg-white overflow-hidden flex items-center justify-center">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="px-2.5 pt-2 pb-2.5 flex flex-col gap-2">
                <p className="text-[11px] font-semibold text-gray-800 leading-tight line-clamp-2 min-h-[2.4em]">
                  {cat.name}
                </p>
                <button
                  onClick={() => setSent((prev) => ({ ...prev, [cat.name]: true }))}
                  className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
                    sent[cat.name]
                      ? 'bg-emerald-100 text-emerald-700 cursor-default'
                      : 'bg-[#1d8480] text-white hover:bg-[hsl(174,97%,27%)] shadow-sm'
                  }`}
                >
                  {sent[cat.name] ? 'RFQ Posted!' : 'Post RFQ'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      </article>
    </div>
  );
}
