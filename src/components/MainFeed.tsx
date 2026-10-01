import FeedCard from './FeedCard';
import FavouriteProductsWidget from './FavouriteProductsWidget';
import CategorySuggestionsCard from './CategorySuggestionsCard';
import RecommendationCardsPost from './RecommendationCardsPost';
import CtaPanel from './CtaPanel';
import StoriesRow from './StoriesRow';
import { FeedFilter, feedItems, FeedItem } from '../data/feedData';
import { Persona } from './PersonaFloater';

interface MainFeedProps {
  activeFilter: FeedFilter;
  onRfqVisibilityChange?: (visible: boolean) => void;
  persona?: Persona;
}


// New users have no BL / order / RFQ / favourite-seller history yet
function applyPersonaFilter(persona: Persona | undefined, items: FeedItem[]): FeedItem[] {
  if (persona !== 'new-user') return items;
  return items.filter(
    (i) =>
      i.feedSection !== 'active-orders' &&
      i.feedSection !== 'favourite' &&
      i.feedSection !== 'my-categories' &&
      i.type !== 'favourite_seller'
  );
}

function getFilteredItems(filter: FeedFilter, items: FeedItem[]): FeedItem[] {
  switch (filter) {
    case 'favourites':
      return items.filter((i) => i.isFavouriteSeller || i.feedSection === 'favourite' || i.feedSection === 'active-orders');
    case 'my-categories':
      return items.filter((i) => i.feedSection === 'my-categories' || i.type === 'new_listing' || i.type === 'price_drop');
    case 'trending':
      return items.filter((i) => i.feedSection === 'trending' || i.type === 'trending_product');
    case 'new-sellers':
      return items.filter((i) => i.feedSection === 'new' || i.type === 'new_seller');
    default:
      return items;
  }
}

const sectionLabels: Record<string, { label: string; color: string }> = {
  'active-orders': { label: 'Active Orders', color: 'text-emerald-600' },
  favourite: { label: 'Favourite Sellers', color: 'text-amber-600' },
  'my-categories': { label: 'Similar to Products You Viewed', color: 'text-[#2e3192]' },
  trending: { label: 'Trending Now', color: 'text-[#1d8480]' },
  new: { label: 'New Sellers', color: 'text-emerald-600' },
};

export default function MainFeed({ activeFilter, persona }: MainFeedProps) {
  const displayItems = applyPersonaFilter(persona, getFilteredItems(activeFilter, feedItems));

  // Group items by section for 'all' view
  const grouped = activeFilter === 'all';

  return (
    <main className="flex-1 min-w-0 space-y-3">
      {/* First-fold CTA panel — desktop-only; msite's equivalent (MobileProfileBar) renders above this column */}
      <div className="hidden lg:block space-y-3">
        <CtaPanel variant="desktop" />
        {/* B2B stories rail — trending categories, new sellers, price drops; msite gets its own
            copy right below MobileProfileBar's CTA bar instead */}
        <StoriesRow />
      </div>

      {/* Feed items */}
      {displayItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <p className="text-gray-500 text-sm">No activity in this feed yet.</p>
          <p className="text-xs text-gray-400 mt-1">Add more favourite sellers or post new RFQs to see activity here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {grouped ? (
            // For 'all' feed, show section dividers
            (() => {
              let lastSection = '';
              return displayItems.map((item) => {
                const isActiveOrders = item.feedSection === 'active-orders';
                const showSectionDivider = item.feedSection !== lastSection;
                lastSection = item.feedSection;

                const secCfg = sectionLabels[item.feedSection];

                return (
                  <div key={item.id}>
                    {/* Section divider — only on first entry of a section */}
                    {showSectionDivider && secCfg && !isActiveOrders && (
                      <div className="flex items-center gap-2 py-1">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${secCfg.color} flex-shrink-0`}>
                          {secCfg.label}
                        </span>
                        <div className="h-px flex-1 bg-gray-200" />
                      </div>
                    )}
                    {item.type === 'favourite_seller'
                      ? <FavouriteProductsWidget />
                      : <FeedCard item={item} />}
                  </div>
                );
              });
            })()
          ) : (
            displayItems.map((item) => <FeedCard key={item.id} item={item} />)
          )}
        </div>
      )}

      {/* Recommendation cards + category suggestions — always shown at bottom of feed */}
      {activeFilter === 'all' && (
        <>
          {persona !== 'new-user' && <RecommendationCardsPost />}
          <CategorySuggestionsCard />
        </>
      )}
    </main>
  );
}
