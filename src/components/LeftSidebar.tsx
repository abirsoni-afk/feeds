import {
  Building2, MapPin, Settings,
  UserRound, MessageSquare, Crown, BadgeCheck, ShieldCheck,
  Landmark, Truck, History, ChevronRight, PackageSearch
} from 'lucide-react';
import { recentRFQs } from '../data/feedData';
import { Persona } from './PersonaFloater';

const utilityGroups = [
  {
    label: '',
    items: [
      { icon: UserRound, label: 'My Profile', badge: '79%' },
      { icon: Crown, label: 'Verified Business Buyer' },
      { icon: BadgeCheck, label: 'Seller Verification', isNew: true },
      { icon: ShieldCheck, label: 'Payment Safety', isNew: true },
    ],
  },
  {
    label: '',
    grid: true,
    items: [
      { icon: MessageSquare, label: 'Messages' },
      { icon: History, label: 'Past Orders' },
      { icon: Landmark, label: 'Loans' },
      { icon: Truck, label: 'Ship With IM' },
    ],
  },
];

interface LeftSidebarProps {
  persona?: Persona;
}

export default function LeftSidebar({ persona }: LeftSidebarProps) {
  const hasOrders = persona !== 'new-user';
  return (
    <aside className="w-full flex-shrink-0 space-y-3">
      {/* Buyer Profile Card */}
      <div className="bg-white rounded-xl overflow-hidden shadow-md">
        <div className="px-4 pt-4 pb-4">
          <div className="relative">
            <button className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm leading-tight">Arjun Verma</h3>
            </div>
            <p className="text-gray-500 text-xs mt-0.5">Senior Purchase Manager</p>
            <div className="flex items-center gap-1 mt-1">
              <Building2 className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600">Nexus Manufacturing Pvt Ltd</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">Noida, Uttar Pradesh</span>
            </div>
            {/* Profile completion bar */}
            <div className="mt-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-gray-500">Complete Profile · 79%</span>
                <button className="text-[10px] text-[#1d8480] font-semibold hover:underline">
                  Edit Profile
                </button>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#1d8480] rounded-full" style={{ width: '79%' }} />
              </div>
            </div>
          </div>

          {/* Buyer workspace shortcuts */}
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-4">
            {utilityGroups.map((group) => (
              <div key={group.label || 'business-actions'}>
                {group.label && (
                  <p className="mb-2 px-1 text-[9px] font-bold uppercase tracking-[0.12em] text-gray-400">
                    {group.label}
                  </p>
                )}
                <div className={group.grid ? 'grid grid-cols-2 gap-1.5' : 'space-y-1.5'}>
                  {group.items.map((item) => (
                    <button
                      key={item.label}
                      className={group.grid
                        ? "relative flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 rounded-lg bg-white border border-gray-200 shadow-sm hover:border-[#1d8480] hover:shadow-md hover:-translate-y-0.5 transition-all group"
                        : "relative flex w-full items-center justify-start gap-2.5 py-2 px-2.5 rounded-lg bg-white border border-gray-200 shadow-sm hover:border-[#1d8480] hover:shadow-md hover:translate-x-0.5 transition-all group"}
                    >
                      <span className={group.grid
                        ? "flex items-center justify-center w-8 h-8 rounded-lg bg-[hsl(174,45%,95%)] text-[#1d8480] group-hover:bg-[#1d8480] group-hover:text-white transition-colors"
                        : "flex items-center justify-center w-7 h-7 rounded-md bg-[hsl(174,45%,95%)] text-[#1d8480] group-hover:bg-[#1d8480] group-hover:text-white transition-colors"}>
                        <item.icon className={group.grid ? "w-4 h-4 shrink-0" : "w-4 h-4 shrink-0"} />
                      </span>
                      <span className={group.grid
                        ? "text-[10px] font-semibold text-gray-600 leading-tight text-center group-hover:text-[#1d8480]"
                        : "text-[11px] font-semibold text-gray-700 leading-tight whitespace-nowrap group-hover:text-[#1d8480]"}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-[#f8d9ad] px-1.5 py-0.5 text-[9px] font-bold text-[#b56a12]">
                          {item.badge}
                        </span>
                      )}
                      {item.isNew && (
                        <span className="ml-auto rounded-full bg-[hsl(174,45%,95%)] px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide text-[#1d8480]">
                          New
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* My Orders */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <h4 className="text-sm font-bold text-gray-900 mb-3">My Orders</h4>
        {hasOrders ? (
          <>
            <div className="divide-y divide-gray-50">
              {recentRFQs.map((rfq, i) => (
                <div key={i} className="py-2.5 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-gray-900 truncate">{rfq.product}</p>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{rfq.date}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">
                    {rfq.responses} suppliers connected
                  </p>
                </div>
              ))}
            </div>
            <button className="mt-2 w-full text-[10px] text-[#1d8480] font-semibold hover:underline flex items-center justify-center gap-0.5 pt-1">
              View more <ChevronRight className="w-3 h-3" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-6">
            <div className="w-11 h-11 rounded-full bg-gray-50 flex items-center justify-center mb-2.5">
              <PackageSearch className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-xs font-semibold text-gray-500">No orders yet</p>
          </div>
        )}
      </div>
    </aside>
  );
}
