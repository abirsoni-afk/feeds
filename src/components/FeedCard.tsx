import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MapPin, Clock, TrendingUp,
  MessageSquare, MessageCircle, Heart, Users,
  ArrowDown, BadgeCheck, Sparkles, CheckCircle2,
  UserSearch, Hourglass, Trash2, AlertTriangle,
  ChevronLeft, ChevronRight, Upload, Shield, HeartHandshake, X, Phone
} from 'lucide-react';
import { FeedItem } from '../data/feedData';
import LocationTrustTicker from './LocationTrustTicker';
import SellerSuggestCarousel from './SellerSuggestCarousel';

interface FeedCardProps {
  item: FeedItem;
}

const typeConfig = {
  order_fulfilled: {
    label: 'Order Fulfilled',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-[hsl(220,14%,92%)]',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  new_listing: {
    label: 'Catalog Updated',
    icon: Sparkles,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    badge: 'bg-sky-100 text-sky-700',
  },
  price_drop: {
    label: 'Catalog Updated',
    icon: ArrowDown,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    badge: 'bg-sky-100 text-sky-700',
  },
  rfq_response: {
    label: 'Active Order',
    icon: MessageCircle,
    color: 'text-emerald-600',
    bg: 'bg-[hsl(220,14%,92%)]',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  new_seller: {
    label: 'New Seller',
    icon: BadgeCheck,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
  },
  trending_product: {
    label: 'Trending',
    icon: TrendingUp,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
  },
  seller_seeking_buyer: {
    label: 'Seeking Buyers',
    icon: UserSearch,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    badge: 'bg-sky-100 text-sky-700',
  },
  rfq_attention: {
    label: 'Active Order',
    icon: Users,
    color: 'text-emerald-600',
    bg: 'bg-[hsl(220,14%,92%)]',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  rfq_single_view: {
    label: 'Active Order',
    icon: Users,
    color: 'text-emerald-600',
    bg: 'bg-[hsl(220,14%,92%)]',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  favourite_seller: {
    label: 'Favourite Seller',
    icon: Heart,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-700',
  },
  bl_pending: {
    label: 'Active BL',
    icon: Hourglass,
    color: 'text-emerald-600',
    bg: 'bg-[hsl(220,14%,92%)]',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  bl_live: {
    label: 'BL Live',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-[hsl(220,14%,92%)]',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
  },
};

type Tier = 'urgent' | 'active' | 'passive';

function getTier(type: FeedItem['type']): Tier {
  if (type === 'rfq_response' || type === 'rfq_attention' || type === 'rfq_single_view') return 'urgent';
  if (type === 'favourite_seller' || type === 'price_drop' || type === 'order_fulfilled' || type === 'bl_pending' || type === 'bl_live') return 'active';
  return 'passive';
}

const tierStyles: Record<Tier, { article: string; bg: string; contentText: string; cta: string; ctaDone: string; ctaSecondary: string }> = {
  urgent: {
    article: '',
    bg: 'bg-white',
    contentText: 'text-gray-700',
    cta: 'bg-[#1d8480] text-white hover:bg-[hsl(174,97%,27%)] shadow-sm hover:shadow-md active:scale-95',
    ctaDone: 'bg-emerald-100 text-emerald-700 cursor-default',
    ctaSecondary: 'border border-[#1d8480] text-[#1d8480] hover:bg-teal-50 active:scale-95',
  },
  active: {
    article: '',
    bg: 'bg-white',
    contentText: 'text-gray-700',
    cta: 'bg-[#1d8480] text-white hover:bg-[hsl(174,97%,27%)] shadow-sm hover:shadow-md active:scale-95',
    ctaDone: 'bg-emerald-100 text-emerald-700 cursor-default',
    ctaSecondary: 'border border-[#1d8480] text-[#1d8480] hover:bg-teal-50 active:scale-95',
  },
  passive: {
    article: '',
    bg: 'bg-[hsl(220,20%,98%)]',
    contentText: 'text-gray-500',
    cta: 'border border-gray-300 text-gray-500 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-700 active:scale-95',
    ctaDone: 'border border-gray-200 text-gray-400 cursor-default',
    ctaSecondary: 'border border-gray-300 text-gray-500 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-700 active:scale-95',
  },
};

const blTypes = ['bl_pending', 'bl_live'] as const;
const rfqViewTypes = ['rfq_attention', 'rfq_single_view'] as const;

function isBL(type: FeedItem['type']) {
  return (blTypes as readonly string[]).includes(type);
}
function isRfqView(type: FeedItem['type']) {
  return (rfqViewTypes as readonly string[]).includes(type);
}


function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} viewBox="0 0 12 12" className="w-3 h-3" fill={i <= Math.round(rating) ? '#f59e0b' : '#e5e7eb'}>
          <path d="M6 1l1.3 2.6 2.9.4-2.1 2 .5 2.9L6 7.5l-2.6 1.4.5-2.9-2.1-2 2.9-.4z"/>
        </svg>
      ))}
      <span className="text-[10px] font-semibold text-gray-600 ml-0.5">{rating}({count})</span>
    </span>
  );
}

function MyCategoryCard({ item }: { item: FeedItem }) {
  const [enquirySent, setEnquirySent] = useState(false);
  const [favourited, setFavourited] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const hasTrustSeal = item.seller.badge === 'Gold' || item.seller.badge === 'Silver';
  const images = item.productImages && item.productImages.length > 0 ? item.productImages : [item.productImage];

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  const scrollBy = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 258, behavior: 'smooth' });
  };

  useEffect(() => {
    updateArrows();
  }, [images.length]);

  return (
    <article className="bg-white rounded-xl border border-gray-200/80 shadow-[0_-1px_0_rgba(0,0,0,0.04),0_4px_6px_-1px_rgba(0,0,0,0.1)] overflow-hidden w-full">
      <div className="px-4 pt-4 pb-1.5">
        {/* Row 1: Company name + trust badges + favourite */}
        <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm">{item.seller.company}</span>
        </div>

        <button
          onClick={() => setFavourited(!favourited)}
          className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 ${favourited ? 'text-rose-500' : 'text-gray-400'}`}
          title="Add to Favourites"
        >
          <Heart className={`w-4 h-4 ${favourited ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
        </div>

        {/* Line 2: single-line Instagram-style vertical ticker — Location, then GST/TrustSEAL/rating, looping */}
        <div className="mt-0">
          <LocationTrustTicker
            location={item.seller.location}
            hasGst={item.seller.isVerified}
            hasTrustSeal={hasTrustSeal}
            rating={item.seller.rating}
            reviewCount={item.seller.totalOrders}
          />
        </div>

      </div>

      {/* Image carousel — full width, arrows overlaid */}
      <div className="mt-0.5 relative">
        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className="flex gap-2 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-4"
        >
          {images.map((src, idx) => (
            <div
              key={idx}
              className="relative flex-shrink-0"
              style={{ width: '250px', height: '250px' }}
            >
              <img
                src={src}
                alt={`${item.productName} ${idx + 1}`}
                className="object-cover rounded-lg border border-[hsl(220,10%,88%)]"
                style={{ width: '250px', height: '250px', display: 'block' }}
              />
            </div>
          ))}
        </div>

        {images.length > 1 && canPrev && (
          <button
            onClick={() => scrollBy(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center border border-gray-300 bg-white/90 hover:bg-white text-gray-600 shadow-sm transition-all z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {images.length > 1 && canNext && (
          <button
            onClick={() => scrollBy(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center border border-gray-300 bg-white/90 hover:bg-white text-gray-600 shadow-sm transition-all z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Desktop only: product name + CTAs on the same line → price below, in an edge-to-edge grey box */}
      <div className="hidden lg:block mt-1.5 bg-gray-100 px-4 pt-2.5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm leading-snug text-gray-900 font-semibold tracking-tight line-clamp-2 flex-1 min-w-0">{item.productName}</p>

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

        {item.price && (
          <p className="mt-0 text-sm font-bold text-gray-900">
            {item.price}
            {item.priceUnit && (
              <span className="text-[11px] font-normal text-gray-500 ml-0.5">{item.priceUnit}</span>
            )}
          </p>
        )}
      </div>

      {/* Mobile (msite) only: original plain stacked layout — unaffected by the grey-box styling */}
      <div className="lg:hidden px-4 pt-1.5">
        <p className="text-sm leading-snug text-gray-900 font-semibold tracking-tight line-clamp-2">{item.productName}</p>

        {item.price && (
          <p className="mt-1 text-sm font-bold text-gray-900">
            {item.price}
            {item.priceUnit && (
              <span className="text-[11px] font-normal text-gray-500 ml-0.5">{item.priceUnit}</span>
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
          <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border border-[#1d8480] text-[#1d8480] hover:bg-teal-50 transition-all active:scale-95">
            <Phone className="w-3.5 h-3.5" />
            Call Now
          </button>
        </div>
      </div>

      <div className="lg:hidden pb-3" />
    </article>
  );
}

export default function FeedCard({ item }: FeedCardProps) {
  const [favourited, setFavourited] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [responded] = useState(false);
  const sellerCarouselRef = useRef<HTMLDivElement>(null);
  const [sellerCarouselHeight, setSellerCarouselHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = sellerCarouselRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height;
      if (h) setSellerCarouselHeight(h);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (item.feedSection === 'my-categories') {
    return <MyCategoryCard item={item} />;
  }

  const config = typeConfig[item.type];
  const tier = getTier(item.type);
  const ts = tierStyles[tier];
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const attentionState = item.unreadMessage
    ? 'unread'
    : isRfqView(item.type) && !responded
      ? 'unresponded'
      : null;

  return (
    <>
    <article
      className={`${ts.bg} rounded-xl border border-gray-200/80 shadow-[0_-1px_0_rgba(0,0,0,0.04),0_4px_6px_-1px_rgba(0,0,0,0.1)] overflow-hidden ${attentionState ? 'feed-card-attention' : ''}`}
      data-attention={attentionState ?? undefined}
    >
      {/* Card Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Seller Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              {isBL(item.type) ? (
                <>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">
                    {item.type === 'bl_pending'
                      ? 'Your requirement is being reviewed'
                      : 'Sellers are now responding to your requirement'}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{item.timeAgo}</span>
                  </div>
                </>
              ) : isRfqView(item.type) ? (
                <>
                  <p className="text-sm text-gray-900 leading-snug truncate">
                    {item.type === 'rfq_single_view' ? (
                      <>
                        <span className="font-semibold">{item.seller.company}</span>
                        <span className="text-gray-500 font-normal"> viewed your requirement for </span>
                        <span className="font-semibold text-gray-900">{item.productName}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">{item.buyersUnlocked?.[0] ?? item.seller.company}</span>
                        {item.totalUnlocked && item.totalUnlocked > 1 && (
                          <span className="text-gray-500"> &amp; {item.totalUnlocked - 1} others</span>
                        )}
                        <span className="text-gray-500 font-normal"> viewed your requirement for </span>
                        <span className="font-semibold text-gray-900">{item.productName}</span>
                      </>
                    )}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{item.timeAgo}</span>
                  </div>
                </>
              ) : item.type === 'rfq_response' && item.unreadMessage ? (
                <>
                  <p className="text-sm text-gray-900 leading-snug">
                    <span className="font-semibold">{item.seller.company}</span>
                    <span className="text-gray-500 font-normal"> replied to you</span>
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{item.seller.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{item.timeAgo}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{item.seller.company}</span>
                    {(item.seller.isVerified || item.seller.badge) && (
                      <span className="inline-flex items-center gap-1">
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-gray-600">
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                            <svg viewBox="0 0 10 10" className="w-2 h-2" fill="none">
                              <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          GST
                        </span>
                        {(item.seller.badge === 'Gold' || item.seller.badge === 'Silver') && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-gray-600">
                            <span className="w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                              <svg viewBox="0 0 10 10" className="w-2 h-2" fill="none">
                                <path d="M2 5l2 2 4-4" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </span>
                            TrustSEAL
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{item.seller.location}</span>
                    </div>
                    {item.feedSection !== 'my-categories' && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{item.timeAgo}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actions top-right */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {isBL(item.type) && (
              <button
                onClick={() => setShowCloseConfirm(true)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                title="Close Requirement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            {!isRfqView(item.type) && !isBL(item.type) && (
              <button
                onClick={() => setFavourited(!favourited)}
                className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${(favourited || item.isFavouriteSeller) ? 'text-rose-500' : 'text-gray-400'}`}
                title="Add to Favourites"
              >
                <Heart className={`w-4 h-4 ${(favourited || item.isFavouriteSeller) ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Content text */}
        {!isBL(item.type) && item.type !== 'rfq_single_view' && !(item.type === 'rfq_response' && item.unreadMessage) && item.content && (
        <p className={`text-sm mt-3 leading-relaxed ${ts.contentText}`}>
          {item.type === 'favourite_seller'
            ? `You shortlisted this seller for ${item.productName}.`
            : item.content}
        </p>
        )}

      </div>

      {/* Product section */}
      {isBL(item.type) ? (
      <div className="mx-4 mb-3 rounded-lg bg-[hsl(220,20%,96%)] px-3 py-2.5 flex items-start gap-3">
        <div className="w-16 h-16 aspect-square flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
          <img
            src={item.productImage}
            alt={item.productName}
            className="block w-full h-full object-cover object-center"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gray-900 leading-tight">
            {item.productName}
          </h4>
          {item.specs && item.specs.length > 0 ? (
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
              {item.specs.slice(0, 4).map((s) => (
                <div key={s.label} className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-500 shrink-0">{s.label}:</span>
                  <span className="text-[10px] font-semibold text-gray-800 truncate">{s.value}</span>
                </div>
              ))}
              {item.specs.length > 4 && (
                <div className="col-span-2 mt-0.5">
                  <span className="text-[10px] text-[#1d8480] font-semibold cursor-pointer hover:underline">
                    +{item.specs.length - 4} more specs
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-2 text-[10px] text-gray-400 italic">No specifications provided</p>
          )}
        </div>
      </div>
      ) : item.type === 'rfq_response' && !item.unreadMessage ? (
      <div className="mx-4 mb-1 flex flex-col sm:flex-row">
        <div className="w-full sm:w-[150px] h-[150px] flex-shrink-0">
          <img
            src={item.productImage}
            alt={item.productName}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="flex-1 px-0 sm:px-3 py-2.5 flex flex-col justify-start">
          <h4 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">
            {item.productName}
          </h4>
        </div>
      </div>
      ) : item.type === 'rfq_response' ? null : (item.type === 'rfq_attention' || item.type === 'rfq_single_view') ? (
      <div className="mx-4 mb-1 flex items-start gap-3">
        <div className="flex-shrink-0 flex flex-col">
          <img
            src={item.productImage}
            alt={item.productName}
            style={sellerCarouselHeight ? { height: sellerCarouselHeight, width: sellerCarouselHeight } : undefined}
            className="w-[150px] h-[150px] object-cover rounded-lg border border-gray-100"
          />
        </div>

        {/* LinkedIn "People you may know"-style seller strip, parallel to the product column */}
        <div ref={sellerCarouselRef} className="flex-1 min-w-0">
          <SellerSuggestCarousel
            sellers={
              item.connectedSellers && item.connectedSellers.length > 0
                ? item.connectedSellers
                : [{
                    id: item.seller.id,
                    company: item.seller.company,
                    location: item.seller.location,
                    price: item.price,
                    priceUnit: item.priceUnit,
                    hasGst: item.seller.isVerified,
                    hasTrustSeal: item.seller.isVerified,
                    memberSince: undefined,
                    rating: item.seller.rating,
                    reviewCount: item.seller.totalOrders,
                  }]
            }
          />
        </div>
      </div>
      ) : (
      <div className="mx-4 mb-1 flex flex-col sm:flex-row">
        <div className="w-full h-[120px] sm:w-[150px] sm:h-[150px] flex-shrink-0">
          <img
            src={item.productImage}
            alt={item.productName}
            className="w-full h-[120px] sm:w-full sm:h-full object-cover rounded-lg"
          />
        </div>
        <div className="flex-1 px-3 py-2.5 flex flex-col justify-between min-h-[120px] sm:min-h-[150px]">
          <div>
            <h4 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">
              {item.productName}
            </h4>
            {(item.type === 'new_listing' || item.type === 'price_drop') && item.price && (
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-sm font-bold text-gray-900">{item.price}</span>
                <span className="text-[10px] text-gray-500">{item.priceUnit}</span>
              </div>
            )}
            {(item.type === 'new_listing' || item.type === 'price_drop') && (
              <div className="mt-1">
                <StarRating rating={item.seller.rating} count={item.seller.totalOrders} />
              </div>
            )}
            {item.type === 'favourite_seller' && (
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">Check latest price &amp; availability</p>
            )}
            {item.specs && item.specs.length > 0 ? (
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                {item.specs.slice(0, 4).map((s) => (
                  <div key={s.label} className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-500 shrink-0">{s.label}:</span>
                    <span className="text-[10px] font-semibold text-gray-800 truncate">{s.value}</span>
                  </div>
                ))}
                {item.specs.length > 4 && (
                  <div className="col-span-2 mt-0.5">
                    <span className="text-[10px] text-[#1d8480] font-semibold cursor-pointer hover:underline">
                      +{item.specs.length - 4} more specs
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-2 text-[10px] text-gray-400 italic">No specifications provided</p>
            )}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 sm:mt-0 sm:justify-end">
            {item.type === 'favourite_seller' ? (
              <button className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${ts.cta}`}>
                Chat Now
              </button>
            ) : (
              <button
                onClick={() => setEnquirySent(true)}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  enquirySent ? ts.ctaDone : ts.cta
                }`}
              >
                {enquirySent ? 'Enquiry Sent!' : 'Send Enquiry'}
              </button>
            )}
          </div>
        </div>
      </div>
      )}

      <div className="px-4 pt-2 pb-3">

        {/* Reply thread */}
        {item.unreadMessage && (
          <div className="rounded-xl overflow-hidden mb-3">
            <div className="px-3 py-2.5 bg-gray-50 flex items-end justify-between gap-3">
              <p className="text-xs text-gray-700 leading-snug italic flex-1">{item.unreadMessage}</p>
              <button className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${ts.cta}`}>
                Chat Now
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Requirement closure confirmation */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowCloseConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-[340px] mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Confirm Requirement Closure</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Connected sellers will be notified and no new matches will be made.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-2 justify-end">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="px-5 py-2 rounded-lg text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                No, Keep Open
              </button>
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="px-5 py-2 rounded-lg text-xs font-bold text-green-600 border border-green-600 bg-transparent hover:bg-green-50 active:scale-95 transition-all"
              >
                Yes, Close
              </button>
            </div>
          </div>
        </div>
      )}
      {(isRfqView(item.type) || (item.type === 'rfq_response' && item.unreadMessage)) && (
        <div className="flex justify-between items-center py-3 px-4 border-t border-dashed border-gray-200">
          <button
            onClick={() => {
              if (item.type === 'rfq_attention' && item.connectedSellers && item.connectedSellers.length > 1) {
                setShowUploadModal(true);
              }
            }}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-700 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            Invoice
          </button>
          <button
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-700 transition-all"
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            Get Assistance
          </button>
          <button
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-700 transition-all"
          >
            <Shield className="w-3.5 h-3.5" />
            Verify Seller
          </button>
        </div>
      )}
    </article>

    {showUploadModal && item.connectedSellers && item.connectedSellers.length > 1 && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
        onClick={() => setShowUploadModal(false)}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Upload Invoice</h3>
              <p className="text-xs text-gray-500 mt-0.5">Select the seller you purchased from</p>
            </div>
            <button
              onClick={() => setShowUploadModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {item.connectedSellers.map((seller) => (
              <div
                key={seller.id}
                className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{seller.company}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{seller.location}</p>
                </div>
                <button className="ml-3 inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-[#1d8480] hover:text-white hover:border-[#1d8480] transition-all flex-shrink-0">
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
