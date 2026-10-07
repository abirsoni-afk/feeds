// Turns a raw POST /feed/listing response into the shape the "top fold stories"
// row and its full-screen viewer actually render. See the field-by-field notes
// inline below — nothing here renders a field the spec didn't ask for.
import { FeedListingPost, FeedListingResponse } from '../data/feedListingResponse';

export interface TopFoldStory {
  feedPostId: number;
  sellerId: number;
  companyName: string;
  catalogUrl: string;
  sellerPnsNumber: string | null;
  cityName: string | null;
  stateName: string | null;
  createdAt: string;
  mcatId: number | null;
  mcatName: string | null;
  overlayText: string;
  caption: string | null;
  postTypeLabel: string;
  image1000: string;
  image500: string;
}

export interface TopFoldStoryGroup {
  sellerId: number;
  companyName: string;
  coverImage: string;
  stories: TopFoldStory[];
}

const POST_TYPE_LABELS: Record<string, string> = {
  NewOffer: 'New offer',
  FreshStock: 'Fresh stock',
  FactoryPhoto: 'Factory photo',
  ManufacturingUpdate: 'Manufacturing update',
};

function postTypeLabel(postTypeName: string | null | undefined): string {
  if (!postTypeName) return 'Update';
  return POST_TYPE_LABELS[postTypeName] ?? 'Update';
}

// "stainless steel vacuum insulated coffee mug" -> "Stainless Steel Vacuum Insulated Coffee Mug"
function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function overlayTextFor(post: FeedListingPost): string {
  if (post.ProductName && post.ProductName.trim()) return toTitleCase(post.ProductName.trim());
  if (post.McatName && post.McatName.trim()) return post.McatName.trim();
  return '';
}

// "2026-10-07T16:18:34.190938Z" -> "2h ago" (relative to whenever this renders)
export function timeSince(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function toStory(post: FeedListingPost): TopFoldStory {
  return {
    feedPostId: post.FeedPostId,
    sellerId: post.SellerId,
    companyName: post.CompanyName,
    catalogUrl: post.CatalogUrl,
    sellerPnsNumber: post.SellerPnsNumber,
    cityName: post.CityName,
    stateName: post.StateName,
    createdAt: post.CreatedAt,
    mcatId: post.McatId,
    mcatName: post.McatName,
    overlayText: overlayTextFor(post),
    caption: post.Caption && post.Caption.trim() ? post.Caption.trim() : null,
    postTypeLabel: postTypeLabel(post.PostTypeName),
    image1000: post.ImageVariants['1000x1000'] ?? post.ImageVariants.Original ?? post.ImageVariants['500x500'] ?? '',
    image500: post.ImageVariants['500x500'] ?? post.ImageVariants['1000x1000'] ?? post.ImageVariants.Original ?? '',
  };
}

// Only render when Status === "Success"; a failure (Reason explains why) or an
// empty Posts object both just mean no stories to show — never an error state.
export function parseTopFoldStories(response: FeedListingResponse): TopFoldStoryGroup[] {
  if (response.Status !== 'Success' || !response.Data) return [];

  const posts = response.Data.Posts ?? {};
  const ordered = Object.keys(posts)
    .sort((a, b) => Number(a) - Number(b))
    .map(key => posts[key])
    .filter(Boolean);

  // Group by SellerId, preserving feed order — a seller's posts become one
  // story set (classic "stories" grouping) instead of one card per post.
  const groups: TopFoldStoryGroup[] = [];
  const groupIndexBySeller = new Map<number, number>();

  for (const post of ordered) {
    const story = toStory(post);
    // No detected product/category name — nothing meaningful to show as the
    // overlay, so skip this post entirely rather than render a blank story.
    if (!story.overlayText) continue;

    const existingIdx = groupIndexBySeller.get(story.sellerId);
    if (existingIdx !== undefined) {
      groups[existingIdx].stories.push(story);
    } else {
      groupIndexBySeller.set(story.sellerId, groups.length);
      groups.push({
        sellerId: story.sellerId,
        companyName: story.companyName,
        coverImage: story.image500,
        stories: [story],
      });
    }
  }

  return groups;
}
