import { useState, useRef, useEffect } from 'react';
import {
  MapPin, ChevronRight, ChevronLeft,
  Sparkles, CheckCircle2,
  Send, Phone, PhoneIncoming, PhoneOutgoing, Star, ShieldCheck, Users, MessageSquare,
  BadgeCheck, Banknote, UserSearch
} from 'lucide-react';
import { sellers } from '../data/feedData';
import { Persona } from './PersonaFloater';

const mockMessages = [
  {
    id: 'm1',
    name: 'Ramesh Steels Ltd',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=60',
    preview: 'We can offer ₹72,000/MT for the full order quantity you mentioned.',
    time: '2m',
    unread: 3,
    online: true,
  },
  {
    id: 'm2',
    name: 'Gujarat Polymers',
    avatar: 'https://images.pexels.com/photos/1181391/pexels-photo-1181391.jpeg?auto=compress&cs=tinysrgb&w=60',
    preview: 'Please share your complete spec sheet for HDPE granules.',
    time: '18m',
    unread: 1,
    online: true,
  },
  {
    id: 'm3',
    name: 'Apex Electronics',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=60',
    preview: 'Shipment dispatched. Tracking ID: DHL9283746.',
    time: '1h',
    unread: 0,
    online: false,
  },
  {
    id: 'm4',
    name: 'Mumbai Packaging Co.',
    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=60',
    preview: 'Revised quote attached. Validity 7 days.',
    time: '3h',
    unread: 0,
    online: false,
  },
];

const mockCalls = [
  { id: 'c1', name: 'Ramesh Steels Ltd', direction: 'outgoing' as const, date: 'Today' },
  { id: 'c2', name: 'Gujarat Polymers', direction: 'incoming' as const, date: 'Today' },
  { id: 'c3', name: 'Apex Electronics', direction: 'outgoing' as const, date: 'Yesterday' },
  { id: 'c4', name: 'Mumbai Packaging Co.', direction: 'incoming' as const, date: '23/07/26' },
];

// Each row is 44px (py-2.5 = 20px + avatar 8px + 2×border = ~44px). 4 rows = 176px. View more = 28px.
// Keep both views the same height to prevent layout shift.
const MSG_LIST_HEIGHT = 132;

interface RightSidebarProps {
  persona?: Persona;
}

export default function RightSidebar({ persona }: RightSidebarProps) {
  const hasMessages = persona !== 'new-user';
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [sellersLoaded, setSellersLoaded] = useState(false);
  const [cardVisible, setCardVisible] = useState(true);
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right');
  const [msgTab, setMsgTab] = useState<'messages' | 'calls'>('messages');
  const [verifyExpanded, setVerifyExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const verifyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setSellersLoaded(true), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (verifyExpanded && verifyRef.current) {
      const t = setTimeout(() => {
        verifyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 80);
      return () => clearTimeout(t);
    }
  }, [verifyExpanded]);

  const navigate = (dir: 'left' | 'right') => {
    setSlideDir(dir);
    setCardVisible(false);
    setTimeout(() => {
      setSliderIndex((i) =>
        dir === 'right' ? (i + 1) % total : (i - 1 + total) % total
      );
      setCardVisible(true);
    }, 180);
  };

  const prev = () => navigate('left');
  const next = () => navigate('right');

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setUploadedFile(url);
  };

  const suggestedSellers = sellers.slice(0, 5);
  const total = suggestedSellers.length;

  return (
    <aside className="w-full flex-shrink-0 space-y-3">
      {/* Messages / Call Logs Widget */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-gray-900">
            {msgTab === 'messages' ? 'Messages' : 'Call Logs'}
          </h4>
          {/* Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setMsgTab('messages')}
              className={`flex items-center justify-center w-7 h-6 rounded-md transition-all ${
                msgTab === 'messages'
                  ? 'bg-white shadow-sm text-[#2e3192]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMsgTab('calls')}
              className={`flex items-center justify-center w-7 h-6 rounded-md transition-all ${
                msgTab === 'calls'
                  ? 'bg-white shadow-sm text-[#2e3192]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Fixed-height container prevents layout shift when switching tabs */}
        <div style={{ height: MSG_LIST_HEIGHT }} className="overflow-hidden">
          {msgTab === 'messages' ? (
            !hasMessages ? (
              <div className="flex flex-col items-center justify-center text-center h-full">
                <div className="w-11 h-11 rounded-full bg-gray-50 flex items-center justify-center mb-2.5">
                  <MessageSquare className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-xs font-semibold text-gray-500">No messages yet</p>
              </div>
            ) : (
            <div className="divide-y divide-gray-50">
              {mockMessages.slice(0, 3).map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setActiveMessage(activeMessage === msg.id ? null : msg.id)}
                  className={`w-full flex items-start gap-2.5 py-2.5 hover:bg-gray-50 transition-colors text-left ${activeMessage === msg.id ? 'bg-[hsl(239,40%,92%)]' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs truncate ${msg.unread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {msg.name}
                      </p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{msg.time}</span>
                    </div>
                    <p className={`text-[10px] truncate mt-0.5 ${msg.unread > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                      {msg.preview}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            )
          ) : (
            <div className="divide-y divide-gray-50">
              {mockCalls.map((call) => (
                <div key={call.id} className="py-2.5 hover:bg-gray-50 transition-colors cursor-pointer">
                  <p className="text-xs font-medium text-gray-800 truncate">{call.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {call.direction === 'incoming' ? (
                      <PhoneIncoming className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <PhoneOutgoing className="w-3 h-3 text-[#1d8480] flex-shrink-0" />
                    )}
                    <span className="text-[10px] text-gray-400">{call.date}</span>
                    <span className="text-[10px] text-gray-300">·</span>
                    <span className="text-[10px] text-gray-500 capitalize">{call.direction}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View more — only in messages view */}
        {msgTab === 'messages' && hasMessages && (
          <button className="mt-2 w-full text-[10px] text-[#1d8480] font-semibold hover:underline flex items-center justify-center gap-0.5 pt-1">
            View more <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* More Sellers for You */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#2e3192]" />
          <h4 className="text-sm font-bold text-gray-900">More Sellers for You</h4>
        </div>

        {/* Fixed height container — loading skeleton matches card dimensions to prevent layout shift */}
        <div style={{ minHeight: 300 }} className="relative">
          {!sellersLoaded ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="relative flex items-center justify-center w-14 h-14">
                <Sparkles className="w-7 h-7 text-[#2e3192] animate-[sparkle-pulse_1.6s_ease-in-out_infinite]" />
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-[#1d8480]"
                    style={{
                      animation: `sparkle-orbit 1.6s ease-in-out infinite`,
                      animationDelay: `${i * 0.4}s`,
                      top: '50%',
                      left: '50%',
                      transformOrigin: '0 0',
                      transform: `rotate(${i * 90}deg) translateX(22px) translateY(-50%)`,
                    }}
                  />
                ))}
              </div>
              <p className="text-xs font-semibold text-gray-500 tracking-wide">Finding sellers for you…</p>
            </div>
          ) : (
            <div
              className="rounded-xl overflow-hidden shadow-md bg-white"
              style={{
                opacity: cardVisible ? 1 : 0,
                transform: cardVisible
                  ? 'translateX(0)'
                  : slideDir === 'right' ? 'translateX(12px)' : 'translateX(-12px)',
                transition: 'opacity 180ms ease, transform 180ms ease',
              }}
            >
              <div className="relative" style={{ height: 140 }}>
                <img
                  src={suggestedSellers[sliderIndex].coverImage}
                  alt={suggestedSellers[sliderIndex].company}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-gray-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {suggestedSellers[sliderIndex].badge === 'Gold' ? '₹ 55,000/MT' :
                   suggestedSellers[sliderIndex].badge === 'Silver' ? '₹ 280/pc' :
                   suggestedSellers[sliderIndex].badge === 'Trusted' ? '₹ 92,000/MT' :
                   '₹ 42,000/MT'}
                </div>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white hover:bg-gray-50 text-gray-700 rounded-full flex items-center justify-center transition-colors shadow-md border border-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white hover:bg-gray-50 text-gray-700 rounded-full flex items-center justify-center transition-colors shadow-md border border-gray-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="px-3 pt-2.5 pb-3">
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  {suggestedSellers[sliderIndex].company}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-500">
                    {suggestedSellers[sliderIndex].location.split(',')[0]}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {suggestedSellers[sliderIndex].isVerified && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-gray-600">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 10 10" className="w-2 h-2" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      GST
                    </span>
                  )}
                  {suggestedSellers[sliderIndex].badge && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-gray-600">
                      <span className="w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 text-[8px]">🔒</span>
                      TrustSEAL
                    </span>
                  )}
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-gray-600">
                    <ShieldCheck className="w-3 h-3 text-sky-500" />
                    Payment Protected
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] text-gray-500">
                      {suggestedSellers[sliderIndex].totalOrders > 2000 ? '10 yrs' :
                       suggestedSellers[sliderIndex].totalOrders > 1000 ? '7 yrs' : '5 yrs'}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map((star) => (
                      <Star
                        key={star}
                        className={`w-2.5 h-2.5 ${star <= Math.round(suggestedSellers[sliderIndex].rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                      />
                    ))}
                    <span className="text-[10px] font-semibold text-gray-700 ml-0.5">
                      {suggestedSellers[sliderIndex].rating.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      ({suggestedSellers[sliderIndex].totalOrders > 1000
                        ? Math.floor(suggestedSellers[sliderIndex].totalOrders / 10)
                        : suggestedSellers[sliderIndex].totalOrders})
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2.5">
                  <button className="flex-1 flex items-center justify-center gap-1.5 bg-[#1d8480] hover:bg-[hsl(174,97%,27%)] text-white text-xs font-bold py-2 rounded-lg transition-colors active:scale-95 shadow-sm">
                    <Send className="w-3 h-3" />
                    Send Enquiry
                  </button>
                  <button className="w-9 h-9 flex items-center justify-center border border-[hsl(220,10%,84%)] rounded-lg hover:bg-gray-50 text-gray-500 transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <button className="mt-3 w-full text-xs text-[#1d8480] font-semibold hover:underline flex items-center justify-center gap-1">
          Discover more sellers <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Seller Verification & Payment Safety Widget */}
      <div className="bg-white rounded-xl shadow-md p-4 overflow-hidden">
        {/* Teaser — always visible */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1d8480]" />
            <span className="text-[10px] font-bold tracking-widest text-[#1d8480] uppercase">New on IndiaMART</span>
          </div>
          <h4 className="text-sm font-bold text-gray-900 mb-1 leading-snug">Seller Verification and Payment Safety</h4>
          {!verifyExpanded && (
            <button
              onClick={() => setVerifyExpanded(true)}
              className="flex items-center gap-1 text-xs font-semibold text-[#1d8480]"
            >
              See what we verify <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Expanded details — animates top to bottom */}
        <div
          ref={verifyRef}
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: verifyExpanded ? 400 : 0, opacity: verifyExpanded ? 1 : 0, marginTop: verifyExpanded ? 16 : 0 }}
        >
          <p className="text-[11px] text-gray-400 mb-4">Here is what we verify for you</p>

          <ul className="space-y-3 mb-5">
            <li className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 13" className="w-5 h-5 flex-shrink-0">
                <g stroke="none" strokeWidth="1" fill="none">
                  <g transform="translate(-19,-873)">
                    <g transform="translate(19,873)">
                      <rect fill="#F0C92C" x="0" y="11" width="14" height="2"/>
                      <circle fill="#F0C92C" cx="7" cy="6" r="6"/>
                      <polyline stroke="#E53E3E" strokeLinecap="round" points="4 5.71428571 5.71428571 8.28571429 10 4"/>
                    </g>
                  </g>
                </g>
              </svg>
              <span className="text-xs text-gray-800 font-medium">TrustSEAL verification</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-[#1d8480] flex items-center justify-center">
                <Users className="w-2.5 h-2.5 text-[#1d8480]" />
              </span>
              <span className="text-xs text-gray-800 font-medium">Your connection to this seller</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-[#1d8480] flex items-center justify-center">
                <UserSearch className="w-2.5 h-2.5 text-[#1d8480]" />
              </span>
              <span className="text-xs text-gray-800 font-medium">Complete seller background</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-[#1d8480] flex items-center justify-center">
                <Banknote className="w-2.5 h-2.5 text-[#1d8480]" />
              </span>
              <span className="text-xs text-gray-800 font-medium">Verified bank account</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-[#1d8480] flex items-center justify-center">
                <ShieldCheck className="w-2.5 h-2.5 text-[#1d8480]" />
              </span>
              <span className="text-xs text-gray-800 font-medium">Up to ₹5L payment protection*</span>
            </li>
          </ul>

          <button className="w-full py-2.5 rounded-xl bg-[#1d6b5f] hover:bg-[#175a50] text-white text-xs font-bold tracking-wide active:scale-95 transition-all shadow-sm">
            Verify this seller
          </button>

          <button
            className="mt-3 flex items-center gap-1 text-[10px] text-[#1d8480] font-semibold"
          >
            Learn more about payment protection <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Photo RFQ Widget */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <h4 className="text-sm font-bold text-gray-900 mb-3">Post RFQ via Photo</h4>

        {uploadedFile ? (
          <div className="rounded-xl overflow-hidden shadow-md relative">
            <img src={uploadedFile} alt="Uploaded product" className="w-full h-32 object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center">
                <CheckCircle2 className="w-8 h-8 text-white mx-auto mb-1" />
                <p className="text-white text-xs font-semibold">Photo uploaded!</p>
              </div>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            className={`rounded-xl border border-dashed transition-colors duration-200 flex flex-col items-center justify-center gap-3 py-6 px-4 cursor-pointer ${
              dragOver
                ? 'border-[#1d8480] bg-[hsl(174,45%,95%)]'
                : 'border-[hsl(220,12%,76%)]'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            {/* Plus icon in rounded square */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${dragOver ? 'bg-[hsl(174,45%,88%)]' : 'bg-[hsl(174,30%,93%)]'}`}>
              <span className={`text-3xl font-light leading-none transition-colors ${dragOver ? 'text-[#1d8480]' : 'text-[#1d8480]'}`}>+</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs font-bold text-gray-700 text-center">Upload Product Image</p>
              <p className="text-[11px] text-gray-400 text-center leading-snug">
                Drag &amp; drop your file here or click<br />to browse
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="mt-1 px-8 py-2.5 rounded-xl bg-[#1d8480] hover:bg-[hsl(174,97%,27%)] text-white text-sm font-bold shadow-sm active:scale-95 transition-all"
            >
              Upload
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {uploadedFile ? (
          <div className="mt-3 flex gap-2">
            <button className="flex-1 py-2 rounded-lg bg-[#1d8480] hover:bg-[hsl(174,97%,27%)] text-white text-xs font-bold transition-all active:scale-95 shadow-sm">
              Post RFQ
            </button>
            <button
              onClick={() => setUploadedFile(null)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              Retake
            </button>
          </div>
        ) : null}
      </div>

      {/* Footer links */}
      <div className="px-1 pb-4">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {['About', 'Help', 'Privacy', 'Terms', 'Advertise'].map((link) => (
            <button key={link} className="text-[10px] text-gray-400 hover:text-gray-600 hover:underline">
              {link}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-2">IndiaMART InterMESH Ltd © 2026</p>
      </div>
    </aside>
  );
}
