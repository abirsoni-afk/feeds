import { useRef, useState } from 'react';
import { Heart, ChevronRight, ChevronLeft } from 'lucide-react';

interface FavProduct {
  id: string;
  name: string;
  image: string;
  price: string | null;
  seller: string;
  location: string;
}

const products: FavProduct[] = [
  {
    id: 'fp1',
    name: 'News Print Paper 48 GSM',
    image: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: '₹42,000',
    seller: 'Rajendra Enterprises',
    location: 'Dharamsala, HP',
  },
  {
    id: 'fp2',
    name: 'TMT Steel Bars Fe-500D',
    image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: null,
    seller: 'Lekhraj Enterprises',
    location: 'Raipur, CG',
  },
  {
    id: 'fp3',
    name: 'ARM Cortex-M4 STM32F4',
    image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: '₹280',
    seller: 'TechVision Electronics',
    location: 'Noida, UP',
  },
  {
    id: 'fp4',
    name: 'Cotton Fabric (Plain Weave)',
    image: 'https://images.pexels.com/photos/3735184/pexels-photo-3735184.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: null,
    seller: 'Delhi Textile Hub',
    location: 'Delhi, NCR',
  },
  {
    id: 'fp5',
    name: 'HDPE Granules Natural',
    image: 'https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: '₹92,000',
    seller: 'GLK India Pvt Ltd',
    location: 'Surat, Gujarat',
  },
];

export default function FavouriteProductsWidget() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [atEnd, setAtEnd] = useState(false);
  const [atStart, setAtStart] = useState(true);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'right' ? 200 : -200, behavior: 'smooth' });
  };

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">

      <div className="relative">
        {/* Left arrow */}
        {!atStart && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* Scroll container */}
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-4 pt-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {products.map((p) => (
            <div
              key={p.id}
              className="flex-shrink-0 w-[160px] rounded-xl border border-gray-200 overflow-hidden flex flex-col"
            >
              {/* Image + badges */}
              <div className="relative">
                <img src={p.image} alt={p.name} className="w-full h-[120px] object-cover" />
                {/* Price badge */}
                <div className="absolute top-2 left-2 bg-gray-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {p.price ?? 'Ask Price'}
                </div>
                {/* Heart */}
                <button
                  onClick={() => setLiked((l) => ({ ...l, [p.id]: !l[p.id] }))}
                  className="absolute top-1.5 right-1.5 p-1"
                >
                  <Heart
                    className="w-4 h-4"
                    fill={liked[p.id] ? '#ef4444' : '#ef4444'}
                    stroke={liked[p.id] ? '#ef4444' : '#ef4444'}
                  />
                </button>
              </div>

              {/* Info */}
              <div className="flex flex-col flex-1 p-2.5 gap-0.5">
                <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-2">{p.name}</p>
                <p className="text-[10px] text-gray-500 leading-snug mt-0.5">{p.seller}</p>
                <p className="text-[10px] text-gray-400 leading-snug">{p.location}</p>
                <button className="mt-2 w-full py-1.5 bg-[#1d8480] hover:bg-[hsl(174,97%,27%)] text-white text-[10px] font-bold rounded-lg transition-colors">
                  Get Best Price
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right arrow */}
        {!atEnd && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
}
