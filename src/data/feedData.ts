export type FeedFilter = 'all' | 'favourites' | 'my-categories' | 'new-sellers' | 'trending';

export interface Seller {
  id: string;
  name: string;
  company: string;
  location: string;
  avatar: string;
  coverImage: string;
  categories: string[];
  rating: number;
  totalOrders: number;
  isFavourite: boolean;
  isVerified: boolean;
  responseTime: string;
  badge?: 'Gold' | 'Silver' | 'Trusted';
}

export interface FeedItem {
  id: string;
  type: 'order_fulfilled' | 'new_listing' | 'price_drop' | 'new_seller' | 'rfq_response' | 'trending_product' | 'seller_seeking_buyer' | 'rfq_attention' | 'rfq_single_view' | 'favourite_seller' | 'bl_pending' | 'bl_live';
  seller: Seller;
  timestamp: string;
  timeAgo: string;
  content: string;
  productName: string;
  productImage: string;
  productImages?: string[];
  productCategory: string;
  price?: string;
  priceUnit?: string;
  moq?: string;
  buyerLocation?: string;
  orderQty?: string;
  tags: string[];
  likes: number;
  enquiries: number;
  isSponsored?: boolean;
  isFavouriteSeller?: boolean;
  feedSection: 'favourite' | 'my-categories' | 'trending' | 'new' | 'active-orders';
  // rfq_attention specific
  buyersUnlocked?: string[];
  totalUnlocked?: number;
  specs?: { label: string; value: string }[];
  unreadMessage?: string;
  connectedSellers?: {
    id: string;
    company: string;
    location: string;
    price: string;
    priceUnit: string;
    hasGst: boolean;
    memberSince: string;
    rating: number;
    reviewCount: number;
  }[];
}

export const sellers: Seller[] = [
  {
    id: 's1',
    name: 'Rahul Jindal',
    company: 'Jindal Steel & Power Ltd.',
    location: 'Hisar, Haryana',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
    coverImage: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400',
    categories: ['Steel', 'Iron', 'Metal Products', 'Construction Materials'],
    rating: 4.8,
    totalOrders: 2847,
    isFavourite: true,
    isVerified: true,
    responseTime: '< 2 hrs',
    badge: 'Gold',
  },
  {
    id: 's2',
    name: 'Priya Mehta',
    company: 'TechVision Electronics',
    location: 'Noida, Uttar Pradesh',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    coverImage: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400',
    categories: ['Microprocessors', 'Electronic Components', 'Semiconductors', 'PCB'],
    rating: 4.6,
    totalOrders: 1203,
    isFavourite: true,
    isVerified: true,
    responseTime: '< 4 hrs',
    badge: 'Silver',
  },
  {
    id: 's3',
    name: 'Amit Sharma',
    company: 'GLK India Pvt Ltd',
    location: 'Surat, Gujarat',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
    coverImage: 'https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=400',
    categories: ['Plastic Raw Material', 'HDPE', 'PVC Pipes', 'Industrial Plastics'],
    rating: 4.4,
    totalOrders: 876,
    isFavourite: false,
    isVerified: true,
    responseTime: '< 6 hrs',
    badge: 'Trusted',
  },
  {
    id: 's4',
    name: 'Sunita Agarwal',
    company: 'Delhi Textile Hub',
    location: 'Delhi, NCR',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    coverImage: 'https://images.pexels.com/photos/3735184/pexels-photo-3735184.jpeg?auto=compress&cs=tinysrgb&w=400',
    categories: ['Cotton Fabric', 'Textile', 'Yarn', 'Industrial Fabric'],
    rating: 4.5,
    totalOrders: 1567,
    isFavourite: true,
    isVerified: true,
    responseTime: '< 3 hrs',
    badge: 'Gold',
  },
  {
    id: 's5',
    name: 'Vikram Patel',
    company: 'AutoParts Express',
    location: 'Pune, Maharashtra',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100',
    coverImage: 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=400',
    categories: ['Auto Parts', 'Engine Components', 'Bearings', 'Industrial Machinery'],
    rating: 4.7,
    totalOrders: 2100,
    isFavourite: false,
    isVerified: true,
    responseTime: '< 2 hrs',
    badge: 'Gold',
  },
  {
    id: 's8',
    name: 'Rajendra Kumar',
    company: 'Rajendra Enterprises',
    location: 'Dharamsala, HP',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100',
    coverImage: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=400',
    categories: ['Newsprint', 'Paper', 'Printing Paper', 'Packaging'],
    rating: 4.6,
    totalOrders: 789,
    isFavourite: true,
    isVerified: true,
    responseTime: '< 2 hrs',
    badge: 'Gold',
  },
  {
    id: 's7',
    name: 'Lekhraj Agarwal',
    company: 'Lekhraj Enterprises',
    location: 'Raipur, Chhattisgarh',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
    coverImage: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400',
    categories: ['Steel', 'TMT Bars', 'MS Pipes', 'Structural Steel'],
    rating: 4.5,
    totalOrders: 432,
    isFavourite: false,
    isVerified: true,
    responseTime: '< 3 hrs',
    badge: 'Trusted',
  },
  {
    id: 's6',
    name: 'Neha Gupta',
    company: 'Chemico Pharma Supplies',
    location: 'Hyderabad, Telangana',
    avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100',
    coverImage: 'https://images.pexels.com/photos/256262/pexels-photo-256262.jpeg?auto=compress&cs=tinysrgb&w=400',
    categories: ['Pharmaceutical Raw Material', 'Chemicals', 'Lab Equipment'],
    rating: 4.3,
    totalOrders: 654,
    isFavourite: false,
    isVerified: false,
    responseTime: '< 8 hrs',
  },
];

export const feedItems: FeedItem[] = [
  {
    id: 'f12',
    type: 'bl_pending',
    seller: sellers[0],
    timestamp: '2026-05-27T06:00:00',
    timeAgo: '4 hours ago',
    content: 'IndiaMART has received your requirement for TMT Steel Bars. We are finding the best sellers for you.',
    productName: 'TMT Steel Bars Fe-500D',
    productImage: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=600',
    productCategory: 'Steel & Iron',
    price: '₹55,000',
    priceUnit: 'per MT',
    moq: '5 MT',
    tags: ['TMT Bars', 'Steel', 'BL', 'Pending'],
    likes: 0,
    enquiries: 0,
    isFavouriteSeller: false,
    feedSection: 'active-orders',
    specs: [
      { label: 'Grade', value: 'Fe-500D' },
      { label: 'Standard', value: 'IS 1786' },
      { label: 'Qty Required', value: '10 MT' },
      { label: 'Delivery', value: 'Within 7 days' },
    ],
  },
  {
    id: 'f14',
    type: 'bl_live',
    seller: sellers[0],
    timestamp: '2026-05-27T05:00:00',
    timeAgo: '6 hours ago',
    content: 'IndiaMART has received your requirement for TMT Steel Bars. We are finding the best sellers for you.',
    productName: 'TMT Steel Bars Fe-500D',
    productImage: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=600',
    productCategory: 'Steel & Iron',
    price: '₹55,000',
    priceUnit: 'per MT',
    moq: '5 MT',
    tags: ['TMT Bars', 'Steel', 'BL', 'Live'],
    likes: 0,
    enquiries: 0,
    isFavouriteSeller: false,
    feedSection: 'active-orders',
    specs: [
      { label: 'Grade', value: 'Fe-500D' },
      { label: 'Standard', value: 'IS 1786' },
      { label: 'Qty Required', value: '10 MT' },
      { label: 'Delivery', value: 'Within 7 days' },
    ],
  },
  {
    id: 'f10',
    type: 'rfq_attention',
    seller: sellers[0],
    timestamp: '2026-05-27T07:30:00',
    timeAgo: '2 hours ago',
    content: '',
    productName: 'TMT Steel Bars Fe-500D',
    productImage: 'https://5.imimg.com/data5/SELLER/Default/2025/6/517555788/QW/BE/NG/141978447/fdgxfh-500x500.jpg',
    productCategory: 'Steel & Iron',
    price: '₹55,000',
    priceUnit: 'per MT',
    moq: '5 MT',
    tags: ['TMT Bars', 'Steel', 'RFQ', 'Quotes'],
    likes: 0,
    enquiries: 3,
    isFavouriteSeller: true,
    feedSection: 'active-orders',
    buyersUnlocked: ['Jindal Steel & Power', 'SW Steel India', 'Tata Steel Ltd.'],
    totalUnlocked: 3,
    specs: [
      { label: 'Grade', value: 'Fe-500D' },
      { label: 'Standard', value: 'IS 1786' },
      { label: 'Qty Required', value: '10 MT' },
      { label: 'Delivery', value: 'Within 7 days' },
    ],
    connectedSellers: [
      {
        id: 'cs1',
        company: 'Jindal Steel & Power',
        location: 'Hisar, Haryana',
        price: '₹55,000',
        priceUnit: 'per MT',
        hasGst: true,
        memberSince: '2018',
        rating: 4.7,
        reviewCount: 128,
      },
      {
        id: 'cs2',
        company: 'SW Steel India',
        location: 'Mumbai, Maharashtra',
        price: '₹53,200',
        priceUnit: 'per MT',
        hasGst: true,
        memberSince: '2020',
        rating: 4.3,
        reviewCount: 86,
      },
      {
        id: 'cs3',
        company: 'Tata Steel Ltd.',
        location: 'Jamshedpur, Jharkhand',
        price: '₹56,500',
        priceUnit: 'per MT',
        hasGst: true,
        memberSince: '2015',
        rating: 4.9,
        reviewCount: 214,
      },
      {
        id: 'cs4',
        company: 'Vizag Steel Works',
        location: 'Visakhapatnam, AP',
        price: '₹54,800',
        priceUnit: 'per MT',
        hasGst: false,
        memberSince: '2021',
        rating: 4.1,
        reviewCount: 52,
      },
    ],
  },
  {
    id: 'f15',
    type: 'rfq_single_view',
    seller: sellers.find((s) => s.id === 's7')!,
    timestamp: '2026-05-27T06:45:00',
    timeAgo: '3 hours ago',
    content: 'Continue the discussion.',
    productName: 'TMT Steel Bars Fe-500D',
    productImage: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=600',
    productCategory: 'Steel & Iron',
    price: '₹54,500',
    priceUnit: 'per MT',
    moq: '5 MT',
    tags: ['TMT Bars', 'Steel', 'RFQ', 'Quotes'],
    likes: 0,
    enquiries: 1,
    isFavouriteSeller: false,
    feedSection: 'active-orders',
    buyersUnlocked: ['Lekhraj Enterprises'],
    totalUnlocked: 1,
    specs: [
      { label: 'Grade', value: 'Fe-500D' },
      { label: 'Standard', value: 'IS 1786' },
      { label: 'Qty Required', value: '10 MT' },
      { label: 'Delivery', value: 'Within 7 days' },
    ],
  },

  {
    id: 'f11',
    type: 'rfq_response',
    seller: sellers.find((s) => s.id === 's7')!,
    timestamp: '2026-05-27T08:45:00',
    timeAgo: '1 hour ago',
    content: 'Lekhraj Enterprises received your TMT Steel Bars Fe-500D requirement.',
    productName: 'TMT Steel Bars Fe-500D',
    productImage: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=600',
    productCategory: 'Steel & Iron',
    price: '₹54,500',
    priceUnit: 'per MT',
    moq: '5 MT',
    tags: ['TMT Bars', 'Steel', 'Quote Received'],
    likes: 0,
    enquiries: 0,
    isFavouriteSeller: false,
    feedSection: 'active-orders',
    unreadMessage: 'We can supply Fe-500D TMT Bars at ₹54,500/MT. Ready stock available. Can deliver within 5 days to your location.',
    specs: [
      { label: 'Grade', value: 'Fe-500D' },
      { label: 'Price', value: '₹54,500/MT' },
      { label: 'Delivery', value: '5 days' },
      { label: 'Stock', value: 'Ready' },
    ],
  },
  {
    id: 'f1',
    type: 'favourite_seller',
    seller: sellers.find((s) => s.id === 's8')!,
    timestamp: '2026-05-27T07:00:00',
    timeAgo: '1 hour ago',
    content: 'A seller you shortlisted earlier for News Print Paper.',
    productName: 'News Print Paper',
    productImage: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=600',
    productCategory: 'Paper & Printing',
    price: '₹42,000',
    priceUnit: 'per MT',
    moq: '10 MT',
    tags: ['Newsprint', 'Paper', 'Printing', 'Bulk Orders'],
    likes: 18,
    enquiries: 7,
    isFavouriteSeller: true,
    feedSection: 'favourite',
    specs: [
      { label: 'Type', value: 'Newsprint' },
      { label: 'GSM', value: '45–52 GSM' },
      { label: 'Width', value: '680–860 mm' },
      { label: 'Brightness', value: '57–60%' },
    ],
  },
  {
    id: 'f2',
    type: 'new_listing',
    seller: sellers[1],
    timestamp: '2026-05-25T09:15:00',
    timeAgo: '3 hours ago',
    content: 'TechVision added a new listing / ARM Cortex-M4 · ₹280/piece · MOQ 100 pcs',
    productName: 'ARM Cortex-M4 Microprocessor STM32F4',
    productImage: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=600',
    productImages: [
      'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=600',
    ],
    productCategory: 'Electronic Components',
    price: '₹280',
    priceUnit: 'per piece',
    moq: '100 pcs',
    tags: ['Microprocessor', 'ARM', 'Embedded', 'IoT', 'Electronics'],
    likes: 28,
    enquiries: 19,
    isFavouriteSeller: true,
    feedSection: 'my-categories',
    specs: [
      { label: 'Core', value: 'ARM Cortex-M4' },
      { label: 'Speed', value: '168 MHz' },
      { label: 'Flash', value: '1 MB' },
      { label: 'Package', value: 'LQFP-144' },
    ],
  },
  {
    id: 'f3',
    type: 'price_drop',
    seller: sellers[2],
    timestamp: '2026-05-25T08:00:00',
    timeAgo: '5 hours ago',
    content: 'Price revised for HDPE Granules · GLK India Pvt Ltd · Save ₹7,360 per MT vs last week.',
    productName: 'HDPE Granules (High Density Polyethylene)',
    productImage: 'https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=600',
    productImages: [
      'https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1624895/pexels-photo-1624895.jpeg?auto=compress&cs=tinysrgb&w=600',
    ],
    productCategory: 'Plastic Raw Material',
    price: '₹92,000',
    priceUnit: 'per MT',
    moq: '500 kg',
    tags: ['HDPE', 'Plastic', 'Granules', 'Price Drop'],
    likes: 45,
    enquiries: 31,
    isFavouriteSeller: false,
    feedSection: 'my-categories',
    specs: [
      { label: 'Grade', value: 'HD-PE' },
      { label: 'MFI', value: '0.3 g/10 min' },
      { label: 'Density', value: '0.955 g/cc' },
      { label: 'Form', value: 'Natural Granules' },
    ],
  },
];

export const myCategories = [
  'Microprocessors',
  'Electronic Components',
  'Steel & Iron',
  'Industrial Machinery',
  'Plastic Raw Material',
];

export const recentRFQs = [
  { product: 'ARM Cortex Microcontrollers', qty: '500 pcs', date: 'Today', responses: 5 },
  { product: 'TMT Steel Bars Fe500', qty: '20 MT', date: 'Yesterday', responses: 3 },
  { product: 'HDPE Granules', qty: '1 MT', date: '17/07/26', responses: 2 },
];

export const marketInsights = [
  { title: 'Steel prices up 3% this week', category: 'Steel & Iron', timeAgo: '6 hrs ago', readers: '2,341' },
  { title: 'Semiconductor shortage easing — prices expected to drop', category: 'Electronics', timeAgo: '12 hrs ago', readers: '5,678' },
  { title: 'GST update: Input credit for raw material buyers', category: 'Policy', timeAgo: '1 day ago', readers: '8,934' },
  { title: 'Top plastic polymer suppliers to follow in 2026', category: 'Plastics', timeAgo: '2 days ago', readers: '3,120' },
];
