import { useState } from 'react';
import { Heart, Phone } from 'lucide-react';
import LocationTrustTicker from './LocationTrustTicker';

interface RecommendedProduct {
  id: string;
  name: string;
  company: string;
  location: string;
  price: string;
  rating: number;
  reviewCount: number;
  image: string;
  hasGst: boolean;
  hasTrustSeal: boolean;
  timeAgo: string;
  avatar: string;
  category: string;
}

export const recommendedProducts: RecommendedProduct[] = [
  {
    id: 'r1',
    name: 'Fresh Natural Mango',
    company: 'Maa Tara Fruits Company',
    location: 'Shimla, Himachal Pradesh',
    price: '₹40',
    rating: 3.9,
    reviewCount: 1107,
    image: 'https://images.pexels.com/photos/918643/pexels-photo-918643.jpeg?auto=compress&cs=tinysrgb&w=600',
    hasGst: true,
    hasTrustSeal: true,
    timeAgo: '2 hours ago',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100',
    category: 'Fresh Produce',
  },
  {
    id: 'r2',
    name: 'Basmati Rice Premium Grade',
    company: 'Agro Fresh Suppliers',
    location: 'Amritsar, Punjab',
    price: '₹85',
    rating: 4.3,
    reviewCount: 842,
    image: 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=600',
    hasGst: true,
    hasTrustSeal: true,
    timeAgo: '4 hours ago',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
    category: 'Food Grains',
  },
  {
    id: 'r3',
    name: 'Organic Turmeric Powder',
    company: 'Spice Garden Exports',
    location: 'Salem, Tamil Nadu',
    price: '₹120',
    rating: 4.6,
    reviewCount: 534,
    image: 'https://images.pexels.com/photos/4198936/pexels-photo-4198936.jpeg?auto=compress&cs=tinysrgb&w=600',
    hasGst: true,
    hasTrustSeal: false,
    timeAgo: '6 hours ago',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
    category: 'Spices & Herbs',
  },
  {
    id: 'r4',
    name: 'Cotton Seed Oil (Refined)',
    company: 'Bharat Oil Mills',
    location: 'Rajkot, Gujarat',
    price: '₹155',
    rating: 4.1,
    reviewCount: 310,
    image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=600',
    hasGst: true,
    hasTrustSeal: true,
    timeAgo: '8 hours ago',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100',
    category: 'Edible Oils',
  },
  {
    id: 'r5',
    name: 'Red Onion (Export Quality)',
    company: 'Nashik Fresh Traders',
    location: 'Nashik, Maharashtra',
    price: '₹28',
    rating: 4.4,
    reviewCount: 2201,
    image: 'https://images.pexels.com/photos/4197447/pexels-photo-4197447.jpeg?auto=compress&cs=tinysrgb&w=600',
    hasGst: false,
    hasTrustSeal: true,
    timeAgo: '10 hours ago',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    category: 'Vegetables',
  },
  {
    id: 'r6',
    name: 'Chana Dal (Split Chickpea)',
    company: 'Madhya Bharat Dal Mills',
    location: 'Indore, Madhya Pradesh',
    price: '₹95',
    rating: 4.2,
    reviewCount: 678,
    image: 'https://images.pexels.com/photos/5945600/pexels-photo-5945600.jpeg?auto=compress&cs=tinysrgb&w=600',
    hasGst: true,
    hasTrustSeal: false,
    timeAgo: '12 hours ago',
    avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100',
    category: 'Pulses & Lentils',
  },
];


function RecommendedProductPost({ product }: { product: RecommendedProduct }) {
  const [favourited, setFavourited] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);

  return (
    <article className="bg-white rounded-xl border border-gray-200/80 shadow-[0_-1px_0_rgba(0,0,0,0.04),0_4px_6px_-1px_rgba(0,0,0,0.1)] overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="px-4 pt-4 pb-1.5 lg:pt-3 lg:pb-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{product.company}</span>
          </div>
          <button
            onClick={() => setFavourited((v) => !v)}
            className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 ${favourited ? 'text-rose-500' : 'text-gray-400'}`}
          >
            <Heart className={`w-4 h-4 ${favourited ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        <div className="mt-0">
          <LocationTrustTicker
            location={product.location}
            hasGst={product.hasGst}
            hasTrustSeal={product.hasTrustSeal}
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
        </div>
      </div>

      {/* Photo — centred cube, same treatment on every breakpoint, matching the multi-photo card */}
      <div className="mt-0.5 lg:mt-0 flex justify-center px-4">
        <div className="relative w-[250px] h-[250px] lg:w-[380px] lg:h-[380px]">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg border border-[hsl(220,10%,88%)] block"
          />
        </div>
      </div>

      {/* Desktop only: product name + CTAs on the same line → price below, in an edge-to-edge grey box */}
      <div className="hidden lg:block mt-1 bg-gray-100 px-4 pt-2 pb-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm leading-snug text-gray-900 font-semibold tracking-tight line-clamp-2 flex-1 min-w-0">{product.name}</p>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setEnquirySent(true)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                enquirySent
                  ? 'bg-emerald-100 text-emerald-700 cursor-default'
                  : 'bg-[#1d8480] text-white hover:bg-[hsl(174,97%,27%)] shadow-sm hover:shadow-md'
              }`}
            >
              {enquirySent ? 'Enquiry Sent!' : 'Get Best Price'}
            </button>
            <button className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap border border-[#1d8480] text-[#1d8480] bg-white hover:bg-teal-50 transition-all active:scale-95">
              <Phone className="w-3.5 h-3.5" />
              Call Now
            </button>
          </div>
        </div>

        <p className="mt-0 text-sm font-bold text-gray-900">
          {product.price}
          <span className="text-[11px] font-normal text-gray-500 ml-0.5">per kg</span>
        </p>
      </div>

      {/* Mobile (msite) only: original plain stacked layout — unaffected by the grey-box styling */}
      <div className="lg:hidden px-4 pt-1.5 pb-3">
        <p className="text-sm leading-snug text-gray-900 font-semibold tracking-tight line-clamp-2">{product.name}</p>

        <p className="mt-1 text-sm font-bold text-gray-900">
          {product.price}
          <span className="text-[11px] font-normal text-gray-500 ml-0.5">per kg</span>
        </p>

        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => setEnquirySent(true)}
            className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${
              enquirySent
                ? 'bg-emerald-100 text-emerald-700 cursor-default'
                : 'bg-[#1d8480] text-white hover:bg-[hsl(174,97%,27%)] shadow-sm hover:shadow-md'
            }`}
          >
            {enquirySent ? 'Enquiry Sent!' : 'Get Best Price'}
          </button>
          <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border border-[#1d8480] text-[#1d8480] hover:bg-teal-50 transition-all active:scale-95">
            <Phone className="w-3.5 h-3.5" />
            Call Now
          </button>
        </div>
      </div>
    </article>
  );
}

export default function RecommendationCardsPost() {
  return (
    <>
      {recommendedProducts.map((product) => (
        <RecommendedProductPost key={product.id} product={product} />
      ))}
    </>
  );
}
