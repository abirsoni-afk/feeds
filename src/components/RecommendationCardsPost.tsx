import { useState } from 'react';
import { Heart } from 'lucide-react';
import LocationTrustTicker from './LocationTrustTicker';
import CallNowButton from './CallNowButton';

export interface RecommendedProduct {
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
  askPrice?: boolean;
  hideUnit?: boolean;
}

export const recommendedProducts: RecommendedProduct[] = [
  {
    id: 'r1',
    name: 'Diesel Generator CPCB 4+ Compliance',
    company: 'Geeteck Powers LLP',
    location: 'Greater Noida',
    price: '₹40',
    rating: 3,
    reviewCount: 3,
    image: 'https://5.imimg.com/data5/SELLER/Default/2026/6/617855462/TN/QN/UF/80782645/diesel-generator-cpcb-4-compliance-250x250.webp',
    hasGst: true,
    hasTrustSeal: true,
    timeAgo: '2 hours ago',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100',
    category: 'Generators & Gensets',
    askPrice: true,
  },
  {
    id: 'r3',
    name: 'Baudouin Diesel Generator',
    company: 'X.Press Genearator Service',
    location: 'Noida',
    price: '₹1,00,000',
    hideUnit: true,
    rating: 4.1,
    reviewCount: 8,
    image: 'https://5.imimg.com/data5/SELLER/Default/2024/12/477121359/VN/GQ/IJ/84552369/baudouin-diesel-generator-250x250.webp',
    hasGst: true,
    hasTrustSeal: true,
    timeAgo: '6 hours ago',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
    category: 'Generators & Gensets',
  },
  {
    id: 'r4',
    name: '30 KVA Diesel Generator',
    company: 'Integrated Genset (India) Pvt. Ltd.',
    location: 'Noida',
    price: '₹4,95,000',
    hideUnit: true,
    rating: 4.1,
    reviewCount: 20,
    image: 'https://5.imimg.com/data5/SELLER/Default/2023/4/302986471/BS/HF/PB/2244884/125-kva-koel-green-diesel-generator-500x500.jpeg',
    hasGst: true,
    hasTrustSeal: true,
    timeAgo: '8 hours ago',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100',
    category: 'Generators & Gensets',
  },
];


export function RecommendedProductPost({ product, hideImageBorder }: { product: RecommendedProduct; hideImageBorder?: boolean }) {
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
            className={`w-full h-full object-cover rounded-lg block ${hideImageBorder ? '' : 'border border-[hsl(220,10%,88%)]'}`}
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
            <CallNowButton variant="desktop" />
          </div>
        </div>

        {product.askPrice ? (
          <button className="mt-0 text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
            Ask Price
          </button>
        ) : (
          <p className="mt-0 text-sm font-bold text-gray-900">
            {product.price}
            {!product.hideUnit && (
              <span className="text-[11px] font-normal text-gray-500 ml-0.5">per kg</span>
            )}
          </p>
        )}
      </div>

      {/* Mobile (msite) only: original plain stacked layout — unaffected by the grey-box styling */}
      <div className="lg:hidden px-4 pt-1.5 pb-3">
        <p className="text-sm leading-snug text-gray-900 font-semibold tracking-tight line-clamp-2">{product.name}</p>

        {product.askPrice ? (
          <button className="mt-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
            Ask Price
          </button>
        ) : (
          <p className="mt-1 text-sm font-bold text-gray-900">
            {product.price}
            {!product.hideUnit && (
              <span className="text-[11px] font-normal text-gray-500 ml-0.5">per kg</span>
            )}
          </p>
        )}

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
          <CallNowButton variant="mobile" />
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
