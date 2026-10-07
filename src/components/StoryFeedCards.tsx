import { useMemo } from 'react';
import FeedCard from './FeedCard';
import { topFoldListingResponse } from '../data/feedListingResponse';
import { parseTopFoldStories, timeSince } from '../utils/topFoldStories';
import { FeedItem } from '../data/feedData';

// New-user persona has no activity to personalise a feed from, so instead of
// the stories rail it sees the same seller-post content (fresh listings /
// factory photos / stock updates from the Seller Feed Listing API) rendered
// as ordinary feed post cards — single-photo or multi-photo, exactly like
// MyCategoryCard renders for any other persona's "my-categories" items.
export default function StoryFeedCards() {
  const items = useMemo<FeedItem[]>(() => {
    const groups = parseTopFoldStories(topFoldListingResponse);
    return groups.map((group) => {
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
        productImages: images.length > 1 ? images : undefined,
        productCategory: first.mcatName ?? 'General',
        tags: first.mcatName ? [first.mcatName] : [],
        likes: 0,
        enquiries: 0,
        feedSection: 'my-categories',
      };
    });
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </div>
  );
}
