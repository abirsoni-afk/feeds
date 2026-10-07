import { useMemo } from 'react';
import FeedCard from './FeedCard';
import { RecommendedProductPost, RecommendedProduct } from './RecommendationCardsPost';
import { topFoldListingResponse } from '../data/feedListingResponse';
import { parseTopFoldStories, timeSince, TopFoldStoryGroup } from '../utils/topFoldStories';
import { FeedItem } from '../data/feedData';

// New-user persona has no activity to personalise a feed from, so instead of
// the stories rail it sees the same seller-post content (fresh listings /
// factory photos / stock updates from the Seller Feed Listing API) rendered
// as ordinary feed post cards — a seller with one post uses the standard
// single-photo card (RecommendedProductPost — no price data here, so it
// reads "Ask Price"), a seller with several posts uses the standard
// multi-photo carousel card (MyCategoryCard, via FeedCard), exactly like
// every other persona's feed.
function groupToFeedItem(group: TopFoldStoryGroup): FeedItem {
  const first = group.stories[0];
  const images = group.stories.map((s) => s.image500);
  const location = [first.cityName, first.stateName].filter(Boolean).join(', ');

  return {
    id: `story-feed-${group.sellerId}`,
    type: 'new_listing',
    seller: {
      id: `story-seller-${group.sellerId}`,
      name: group.companyName,
      company: group.companyName,
      location: location || 'India',
      avatar: group.coverImage,
      coverImage: group.coverImage,
      categories: first.mcatName ? [first.mcatName] : [],
      rating: 4.2,
      totalOrders: 10,
      isFavourite: false,
      isVerified: true,
      responseTime: '< 4 hrs',
    },
    timestamp: first.createdAt,
    timeAgo: timeSince(first.createdAt),
    content: first.caption ?? `${group.companyName} shared an update on ${first.overlayText}.`,
    productName: first.overlayText || group.companyName,
    productImage: first.image500,
    productImages: images,
    productCategory: first.mcatName ?? 'General',
    tags: first.mcatName ? [first.mcatName] : [],
    likes: 0,
    enquiries: 0,
    feedSection: 'my-categories',
  };
}

function groupToRecommendedProduct(group: TopFoldStoryGroup): RecommendedProduct {
  const first = group.stories[0];
  const location = [first.cityName, first.stateName].filter(Boolean).join(', ');

  return {
    id: `story-single-${group.sellerId}`,
    name: first.overlayText || group.companyName,
    company: group.companyName,
    location: location || 'India',
    price: '',
    rating: 4.2,
    reviewCount: 10,
    image: first.image1000 || first.image500,
    hasGst: true,
    hasTrustSeal: true,
    timeAgo: timeSince(first.createdAt),
    avatar: group.coverImage,
    category: first.mcatName ?? 'General',
    askPrice: true,
  };
}

export default function StoryFeedCards() {
  const groups = useMemo(() => parseTopFoldStories(topFoldListingResponse), []);

  if (groups.length === 0) return null;

  return (
    <div className="space-y-3">
      {groups.map((group) =>
        group.stories.length > 1 ? (
          <FeedCard key={group.sellerId} item={groupToFeedItem(group)} />
        ) : (
          <RecommendedProductPost
            key={group.sellerId}
            product={groupToRecommendedProduct(group)}
            hideImageBorder
          />
        )
      )}
    </div>
  );
}
