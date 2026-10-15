import {
  LayoutGrid, UserRound, MessageSquare, Crown, BadgeCheck, ShieldCheck,
  IndianRupee, Truck, Gauge, LifeBuoy, Pencil, MapPin, Calendar,
  Store, HelpCircle, Globe, User, ChevronDown, Info, Contact,
  Building2, SlidersHorizontal, Ticket, ChevronRight,
} from 'lucide-react';

interface ProfilePageProps {
  onBack: () => void;
}

const navItems = [
  { icon: LayoutGrid, label: 'Dashboard' },
  { icon: UserRound, label: 'My Profile', badge: '47%', active: true },
  { icon: MessageSquare, label: 'Messages' },
  { icon: Crown, label: 'Verified Business Buyer' },
  { icon: ShieldCheck, label: 'Seller Verification', isNew: true },
  { icon: BadgeCheck, label: 'Payment Safety', isNew: true },
  { icon: IndianRupee, label: 'Loans' },
  { icon: Truck, label: 'Ship With IM' },
  { icon: Gauge, label: 'Credit Score' },
];

const milestones = [
  { label: 'Name', done: true },
  { label: 'Company', done: true },
  { label: 'Email', done: true },
  { label: 'Phone', done: true },
  { label: '', done: false },
];

const detailTiles = [
  { icon: Contact, title: 'Primary Details', note: 'Missing alternative mobile' },
  { icon: MapPin, title: 'Address Details', note: 'Missing street' },
  { icon: Building2, title: 'Business Details', note: 'Missing company website' },
  { icon: SlidersHorizontal, title: 'Account Settings', note: 'Manage Account', neutral: true },
  { icon: HelpCircle, title: 'Help', note: 'Get support & assistance', neutral: true },
  { icon: Ticket, title: 'Raise a ticket', note: 'Initiate a support request', neutral: true },
];

export default function ProfilePage({ onBack }: ProfilePageProps) {
  return (
    <div className="min-h-screen bg-[hsl(220,20%,97%)] font-sans">
      {/* ── Top nav ── */}
      <header className="h-[55px] bg-[#2e3192] flex items-center justify-between px-4 md:px-6">
        <button type="button" onClick={onBack} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">m</span>
          </div>
          <span className="text-white font-semibold text-base hidden sm:inline">indiamart</span>
        </button>

        <div className="flex items-center gap-1 md:gap-2">
          <button className="hidden sm:flex flex-col items-center justify-center px-2.5 py-1 hover:bg-white/10 rounded-lg transition-colors">
            <Store className="w-4 h-4 text-white mb-0.5" />
            <span className="text-white text-[10px] font-medium">Sell</span>
          </button>
          <div className="relative">
            <button className="flex flex-col items-center justify-center px-2.5 py-1 hover:bg-white/10 rounded-lg transition-colors">
              <MessageSquare className="w-4 h-4 text-white mb-0.5" />
              <span className="text-white text-[10px] font-medium">Messages</span>
            </button>
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">1</span>
            </span>
          </div>
          <button className="hidden sm:flex flex-col items-center justify-center px-2.5 py-1 hover:bg-white/10 rounded-lg transition-colors">
            <HelpCircle className="w-4 h-4 text-white mb-0.5" />
            <span className="text-white text-[10px] font-medium">Help</span>
          </button>
          <button className="hidden md:flex flex-col items-center justify-center px-2.5 py-1 hover:bg-white/10 rounded-lg transition-colors">
            <Globe className="w-4 h-4 text-white mb-0.5" />
            <span className="text-white text-[10px] font-medium">Exporters</span>
          </button>
          <button className="flex items-center gap-1 px-2.5 py-1 hover:bg-white/10 rounded-lg transition-colors">
            <User className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Hi Aaan</span>
            <ChevronDown className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* ── Left nav ── */}
        <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col bg-white border-r border-slate-200 min-h-[calc(100vh-55px)] px-4 py-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-full bg-[#2e3192] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-base">A</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 leading-tight">Aaan</p>
              <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                New Delhi
                <Pencil className="w-3 h-3 flex-shrink-0 text-slate-400" />
              </button>
              <button className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 mt-0.5">
                <Crown className="w-3 h-3 flex-shrink-0" />
                Get Verified Business Buyer
              </button>
            </div>
          </div>

          <nav className="space-y-0.5">
            {navItems.map((item) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                  item.active
                    ? 'bg-[hsl(174,45%,95%)] text-[#1d8480] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 min-w-0 text-left truncate">{item.label}</span>
                {item.badge && (
                  <span className="flex-shrink-0 rounded-full bg-[#f8d9ad] px-1.5 py-0.5 text-[10px] font-bold text-[#b56a12]">
                    {item.badge}
                  </span>
                )}
                {item.isNew && (
                  <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wide text-emerald-600">
                    NEW
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-4 border-t border-slate-100">
            <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors">
              <LifeBuoy className="w-4 h-4 flex-shrink-0" />
              Help and support
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 p-4 md:p-6">
          <div className="max-w-6xl space-y-4">
            {/* Row 1 — Profile card + Verified Buyer Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Profile card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-full bg-[#2e3192] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xl">A</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base font-bold text-slate-900">Aaan</h2>
                      <Pencil className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    </div>
                    <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      New Delhi, Delhi
                    </p>
                    <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      7 Months
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Profile Strength
                    </span>
                    <span className="text-sm font-bold text-amber-600">47%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '47%' }} />
                  </div>
                </div>
              </div>

              {/* Verified Buyer Progress card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="flex items-center gap-1.5 text-base font-bold text-slate-900">
                    <BadgeCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Verified Buyer Progress
                  </h2>
                  <span className="text-xs font-semibold text-slate-500 flex-shrink-0">4/5 milestones</span>
                </div>

                <div className="flex items-center">
                  {milestones.map((m, idx) => (
                    <div key={idx} className="flex items-center flex-1 last:flex-initial">
                      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                        <span
                          className={`flex items-center justify-center rounded-full flex-shrink-0 ${
                            m.done ? 'w-7 h-7 bg-[#2e3192]' : 'w-3.5 h-3.5 bg-white border-2 border-[#2e3192]'
                          }`}
                        >
                          {m.done && (
                            <svg viewBox="0 0 10 10" className="w-3 h-3" fill="none">
                              <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        {m.label && <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">{m.label}</span>}
                      </div>
                      {idx < milestones.length - 1 && (
                        <span className={`h-0.5 flex-1 mx-1 ${m.done ? 'bg-[#2e3192]' : 'bg-slate-200'}`} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-5 gap-3">
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Add GST
                  </button>
                  <button className="flex-shrink-0 px-5 py-2.5 rounded-lg bg-[#1d8480] hover:bg-[hsl(174,97%,27%)] text-white text-sm font-semibold transition-colors">
                    Complete Verification
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2 — detail tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {detailTiles.map((tile) => (
                <button
                  key={tile.title}
                  className="flex items-center gap-3 bg-white rounded-xl shadow-sm border border-slate-100 p-4 text-left hover:border-[#1d8480] hover:shadow-md transition-all"
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-[hsl(220,20%,96%)] text-slate-500 flex-shrink-0">
                    <tile.icon className="w-4.5 h-4.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-900">{tile.title}</span>
                    <span className={`block text-xs mt-0.5 truncate ${tile.neutral ? 'text-slate-400' : 'text-amber-600'}`}>
                      {tile.note}
                    </span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
