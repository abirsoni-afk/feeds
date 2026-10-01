import { useEffect, useState } from 'react';
import { MapPin, Star } from 'lucide-react';

function TickerCircleTick({ color }: { color: string }) {
  return (
    <span className={`w-3.5 h-3.5 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
      <svg viewBox="0 0 10 10" className="w-2 h-2" fill="none">
        <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

interface LocationTrustTickerProps {
  location: string;
  hasGst: boolean;
  hasTrustSeal: boolean;
  rating: number;
  reviewCount: number;
}

// Instagram-style single-line vertical ticker shared across product cards: cycles
// between Location and GST/TrustSEAL/rating on one line, sliding upward with a
// fade, pausing 3s on each, looping forever. Slot 2 duplicates slot 0's content
// so the loop can reset silently without ever reversing direction.
export default function LocationTrustTicker({ location, hasGst, hasTrustSeal, rating, reviewCount }: LocationTrustTickerProps) {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerAnimated, setTickerAnimated] = useState(true);
  const PAUSE_MS = 3000;
  const TRANSITION_MS = 500;

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const advance = (next: number, animate: boolean) => {
      timeoutId = setTimeout(() => {
        setTickerAnimated(animate);
        setTickerIndex(next);
        if (next === 2) {
          advance(0, false);
        } else {
          advance(next + 1, true);
        }
      }, next === 0 && !animate ? TRANSITION_MS : PAUSE_MS);
    };

    advance(1, true);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="relative h-4 overflow-hidden">
      {[0, 1, 2].map(slot => {
        const offset = (slot - tickerIndex) * 100;
        const active = slot === tickerIndex;
        return (
          <div
            key={slot}
            className={`absolute inset-0 flex items-center ${tickerAnimated ? 'transition-all duration-500 ease-in-out' : ''}`}
            style={{ transform: `translateY(${offset}%)`, opacity: active ? 1 : 0 }}
          >
            {slot === 1 ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                {hasGst && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-gray-600">
                    <TickerCircleTick color="bg-emerald-500" />
                    GST
                  </span>
                )}
                {hasTrustSeal && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-gray-600">
                    <TickerCircleTick color="bg-amber-400" />
                    TrustSEAL
                  </span>
                )}
                <span className="inline-flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-[11px] font-semibold text-gray-700">{rating}</span>
                  <span className="text-[11px] text-gray-400">({reviewCount.toLocaleString()})</span>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-500">{location}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
