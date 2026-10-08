import { useState, useEffect, useRef } from 'react';
import {
  X, MapPin, ChevronDown, ChevronUp, Heart, Star, Sparkles, ArrowLeft,
  ShieldCheck, ShieldQuestion, ChevronLeft, ChevronRight, Loader2, Check, User, Send,
  Phone, SearchX, Search, SlidersHorizontal, Trophy, Info, Clock, TrendingUp,
  ThumbsUp, ThumbsDown,
} from 'lucide-react';
import FindingBestMatchLoader, { EVAL_STAGE_COUNT } from './FindingBestMatchLoader';
import { fetchMcatId } from '../utils/mcat';
import { fetchSpecs } from '../utils/specs';
import {
  createCuratedSearchJob,
  fetchCuratedSearchStatus,
  CuratedSeller,
  SpecAnswer,
} from '../utils/curatedSearch';

interface SearchModalProps {
  query: string;
  city: string;
  onClose: () => void;
  /** Whether the search that opened this modal was launched in AI Mode — msite
   * shows its own labeled toggle here (desktop toggles this before opening). */
  aiMode?: boolean;
}

interface SellerCard {
  id: number;
  name: string;
  city: string;
  spec: string;
  price: string;
  priceUnit: string;
  rating: number;
  reviews: number;
  years: number;
  hasGST: boolean;
  hasTrustSEAL: boolean;
  hasPayProtected: boolean;
  image: string;
  isBestMatch?: boolean;
  askPrice?: boolean;
  phone?: string;
  distance: number;
  // One real signal (responsiveness / demand) backing why this seller is a strong pick
  matchHighlight?: string;
}

interface FilterSection {
  id: string;
  label: string;
  type: 'pill' | 'checkbox' | 'quantity';
  options: string[];
  singleSelect?: boolean;
}

const SELLERS: SellerCard[] = [
  { id: 1,  name: 'Powergen India Ltd',   city: 'Delhi',     spec: '25 kVA',   price: '₹1,85,000',  priceUnit: '/unit', rating: 4.8, reviews: 214, years: 12, hasGST: true,  hasTrustSEAL: true,  hasPayProtected: true,  image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 98101 23456', distance: 722, matchHighlight: 'Replies within 2 hrs' },
  { id: 2,  name: 'APC Generators',       city: 'Mumbai',    spec: '62.5 kVA', price: '₹3,20,000',  priceUnit: '/unit', rating: 4.5, reviews: 98,  years: 7,  hasGST: true,  hasTrustSEAL: false, hasPayProtected: true,  image: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 70517 46251', distance: 44, matchHighlight: '18 buyers served in 6m' },
  { id: 3,  name: 'Kirloskar Power',      city: 'Pune',      spec: '125 kVA',  price: '₹5,60,000',  priceUnit: '/unit', rating: 4.9, reviews: 512, years: 20, hasGST: true,  hasTrustSEAL: true,  hasPayProtected: true,  image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400', askPrice: true, phone: '+91 91234 56789', distance: 0, matchHighlight: '63 buyers served in 6m' },
  { id: 4,  name: 'Greaves Cotton',       city: 'Ahmedabad', spec: '15 kVA',   price: '₹98,000',    priceUnit: '/unit', rating: 4.2, reviews: 67,  years: 5,  hasGST: true,  hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 80456 78901', distance: 25, matchHighlight: 'High demand in this category' },
  { id: 5,  name: 'Cummins Diesel',       city: 'Bangalore', spec: '250 kVA',  price: '₹9,80,000',  priceUnit: '/unit', rating: 4.7, reviews: 341, years: 15, hasGST: true,  hasTrustSEAL: true,  hasPayProtected: true,  image: 'https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 99887 65432', distance: 45, matchHighlight: 'Replies within 3 hrs' },
  { id: 6,  name: 'Sudhir Gensets',       city: 'Chennai',   spec: '40 kVA',   price: '₹2,15,000',  priceUnit: '/unit', rating: 4.4, reviews: 155, years: 9,  hasGST: true,  hasTrustSEAL: true,  hasPayProtected: false, image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 77654 32109', distance: 18, matchHighlight: '67 buyers served in 6m' },
  { id: 7,  name: 'Escorts Genset',       city: 'Jaipur',    spec: '30 kVA',   price: '₹1,65,000',  priceUnit: '/unit', rating: 4.1, reviews: 43,  years: 4,  hasGST: false, hasTrustSEAL: false, hasPayProtected: true,  image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400', askPrice: true, phone: '+91 88123 45678', distance: 32, matchHighlight: 'Replies within 4 hrs' },
  { id: 8,  name: 'Mahindra Powerol',     city: 'Hyderabad', spec: '75 kVA',   price: '₹3,90,000',  priceUnit: '/unit', rating: 4.6, reviews: 289, years: 11, hasGST: true,  hasTrustSEAL: true,  hasPayProtected: true,  image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 93456 78012', distance: 15, matchHighlight: 'High demand in this category' },
  { id: 9,  name: 'Honda Generators',     city: 'Kolkata',   spec: '5 kVA',    price: '₹42,000',    priceUnit: '/unit', rating: 4.3, reviews: 78,  years: 6,  hasGST: true,  hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862632/pexels-photo-3862632.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 76543 21098', distance: 28, matchHighlight: 'Replies within 2 hrs' },
  { id: 10, name: 'KOEL by Kirloskar',    city: 'Nagpur',    spec: '100 kVA',  price: '₹4,75,000',  priceUnit: '/unit', rating: 4.8, reviews: 402, years: 18, hasGST: true,  hasTrustSEAL: true,  hasPayProtected: true,  image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400', askPrice: true, phone: '+91 98765 43210', distance: 6, matchHighlight: 'Replies within 1 hr' },
  { id: 11, name: 'Briggs & Stratton',    city: 'Surat',     spec: '7.5 kVA',  price: '₹58,000',    priceUnit: '/unit', rating: 4.0, reviews: 29,  years: 3,  hasGST: true,  hasTrustSEAL: false, hasPayProtected: true,  image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 84321 09876', distance: 22, matchHighlight: '6 buyers served in 6m' },
  { id: 12, name: 'Jakson Generators',    city: 'Lucknow',   spec: '500 kVA',  price: '₹22,50,000', priceUnit: '/unit', rating: 4.5, reviews: 167, years: 14, hasGST: true,  hasTrustSEAL: true,  hasPayProtected: true,  image: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 92109 87654', distance: 38, matchHighlight: 'Replies within 3 hrs' },
  { id: 13, name: 'Powerline Systems', city: 'Delhi', spec: '5 kVA', price: '₹40,000', priceUnit: '/unit', rating: 3.6, reviews: 15, years: 1, hasGST: false, hasTrustSEAL: true, hasPayProtected: true, image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9000 10000', distance: 3, matchHighlight: 'Replies within 1 hrs' },
  { id: 14, name: 'Sterling Gensets', city: 'Mumbai', spec: '7.5 kVA', price: '₹55,731', priceUnit: '/unit', rating: 4.9, reviews: 22, years: 4, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9731 10019', distance: 14, matchHighlight: '82 buyers served in 6m' },
  { id: 15, name: 'Vertex Power Solutions', city: 'Pune', spec: '15 kVA', price: '₹71,462', priceUnit: '/unit', rating: 4.8, reviews: 29, years: 7, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9462 10038', distance: 25, matchHighlight: 'High demand in this category' },
  { id: 16, name: 'Ashoka Diesels', city: 'Ahmedabad', spec: '25 kVA', price: '₹87,193', priceUnit: '/unit', rating: 4.7, reviews: 36, years: 10, hasGST: true, hasTrustSEAL: true, hasPayProtected: false, image: 'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9193 10057', distance: 36, matchHighlight: 'Replies within 4 hrs' },
  { id: 17, name: 'Bharat Power Corp', city: 'Bangalore', spec: '30 kVA', price: '₹102,924', priceUnit: '/unit', rating: 4.6, reviews: 43, years: 13, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9824 10076', distance: 47, matchHighlight: '76 buyers served in 6m' },
  { id: 18, name: 'Unity Generators', city: 'Chennai', spec: '40 kVA', price: '₹118,655', priceUnit: '/unit', rating: 4.5, reviews: 50, years: 16, hasGST: false, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9555 10095', distance: 58, matchHighlight: 'High demand in this category' },
  { id: 19, name: 'Prime Energy Systems', city: 'Jaipur', spec: '62.5 kVA', price: '₹134,386', priceUnit: '/unit', rating: 4.4, reviews: 57, years: 19, hasGST: true, hasTrustSEAL: true, hasPayProtected: true, image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9286 10114', distance: 69, matchHighlight: 'Replies within 4 hrs' },
  { id: 20, name: 'National Power Works', city: 'Hyderabad', spec: '75 kVA', price: '₹150,117', priceUnit: '/unit', rating: 4.3, reviews: 64, years: 22, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862632/pexels-photo-3862632.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9917 10133', distance: 80, matchHighlight: '59 buyers served in 6m' },
  { id: 21, name: 'Global Gensets India', city: 'Kolkata', spec: '100 kVA', price: '₹165,848', priceUnit: '/unit', rating: 4.2, reviews: 71, years: 3, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9648 10152', distance: 91, matchHighlight: 'High demand in this category' },
  { id: 22, name: 'Shakti Power Ltd', city: 'Nagpur', spec: '125 kVA', price: '₹181,579', priceUnit: '/unit', rating: 4.1, reviews: 78, years: 6, hasGST: true, hasTrustSEAL: true, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9379 10171', distance: 102, matchHighlight: 'Replies within 2 hrs' },
  { id: 23, name: 'Sunrise Diesel Co', city: 'Surat', spec: '250 kVA', price: '₹197,310', priceUnit: '/unit', rating: 4.0, reviews: 85, years: 9, hasGST: false, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9000 10190', distance: 113, matchHighlight: '83 buyers served in 6m' },
  { id: 24, name: 'Metro Power Solutions', city: 'Lucknow', spec: '500 kVA', price: '₹213,041', priceUnit: '/unit', rating: 3.9, reviews: 92, years: 12, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9731 10209', distance: 124, matchHighlight: 'High demand in this category' },
  { id: 25, name: 'Vishwakarma Gensets', city: 'Indore', spec: '5 kVA', price: '₹228,772', priceUnit: '/unit', rating: 3.8, reviews: 99, years: 15, hasGST: true, hasTrustSEAL: true, hasPayProtected: true, image: 'https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9462 10228', distance: 135, matchHighlight: 'Replies within 1 hrs' },
  { id: 26, name: 'Trident Power Systems', city: 'Bhopal', spec: '7.5 kVA', price: '₹244,503', priceUnit: '/unit', rating: 3.7, reviews: 106, years: 18, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9193 10247', distance: 146, matchHighlight: '62 buyers served in 6m' },
  { id: 27, name: 'Om Generators', city: 'Coimbatore', spec: '15 kVA', price: '₹260,234', priceUnit: '/unit', rating: 3.6, reviews: 113, years: 21, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9824 10266', distance: 157, matchHighlight: 'High demand in this category' },
  { id: 28, name: 'Everest Power Co', city: 'Kanpur', spec: '25 kVA', price: '₹275,965', priceUnit: '/unit', rating: 4.9, reviews: 120, years: 2, hasGST: false, hasTrustSEAL: true, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862632/pexels-photo-3862632.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9555 10285', distance: 168, matchHighlight: 'Replies within 3 hrs' },
  { id: 29, name: 'Dynamic Diesel Works', city: 'Patna', spec: '30 kVA', price: '₹291,696', priceUnit: '/unit', rating: 4.8, reviews: 127, years: 5, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9286 10304', distance: 179, matchHighlight: '61 buyers served in 6m' },
  { id: 30, name: 'Reliable Gensets', city: 'Vadodara', spec: '40 kVA', price: '₹307,427', priceUnit: '/unit', rating: 4.7, reviews: 134, years: 8, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9917 10323', distance: 190, matchHighlight: 'High demand in this category' },
  { id: 31, name: 'Pinnacle Power India', city: 'Ludhiana', spec: '62.5 kVA', price: '₹323,158', priceUnit: '/unit', rating: 4.6, reviews: 141, years: 11, hasGST: true, hasTrustSEAL: true, hasPayProtected: true, image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9648 10342', distance: 201, matchHighlight: 'Replies within 3 hrs' },
  { id: 32, name: 'Apex Generator Corp', city: 'Rajkot', spec: '75 kVA', price: '₹338,889', priceUnit: '/unit', rating: 4.5, reviews: 148, years: 14, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9379 10361', distance: 212, matchHighlight: '71 buyers served in 6m' },
  { id: 33, name: 'Sigma Power Systems', city: 'Varanasi', spec: '100 kVA', price: '₹354,620', priceUnit: '/unit', rating: 4.4, reviews: 155, years: 17, hasGST: false, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9000 10380', distance: 223, matchHighlight: 'High demand in this category' },
  { id: 34, name: 'Modern Diesel Traders', city: 'Agra', spec: '125 kVA', price: '₹370,351', priceUnit: '/unit', rating: 4.3, reviews: 162, years: 20, hasGST: true, hasTrustSEAL: true, hasPayProtected: false, image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9731 10399', distance: 234, matchHighlight: 'Replies within 2 hrs' },
  { id: 35, name: 'Precision Gensets', city: 'Nashik', spec: '250 kVA', price: '₹386,082', priceUnit: '/unit', rating: 4.2, reviews: 169, years: 1, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9462 10418', distance: 245, matchHighlight: '22 buyers served in 6m' },
  { id: 36, name: 'Capital Power Solutions', city: 'Faridabad', spec: '500 kVA', price: '₹401,813', priceUnit: '/unit', rating: 4.1, reviews: 176, years: 4, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862632/pexels-photo-3862632.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9193 10437', distance: 256, matchHighlight: 'High demand in this category' },
  { id: 37, name: 'Elite Generator Co', city: 'Meerut', spec: '5 kVA', price: '₹417,544', priceUnit: '/unit', rating: 4.0, reviews: 183, years: 7, hasGST: true, hasTrustSEAL: true, hasPayProtected: true, image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9824 10456', distance: 267, matchHighlight: 'Replies within 4 hrs' },
  { id: 38, name: 'Rajdhani Power Works', city: 'Visakhapatnam', spec: '7.5 kVA', price: '₹433,275', priceUnit: '/unit', rating: 3.9, reviews: 190, years: 10, hasGST: false, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9555 10475', distance: 278, matchHighlight: '58 buyers served in 6m' },
  { id: 39, name: 'Fortune Gensets', city: 'Guwahati', spec: '15 kVA', price: '₹449,006', priceUnit: '/unit', rating: 3.8, reviews: 197, years: 13, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9286 10494', distance: 289, matchHighlight: 'High demand in this category' },
  { id: 40, name: 'Speedway Diesels', city: 'Chandigarh', spec: '25 kVA', price: '₹464,737', priceUnit: '/unit', rating: 3.7, reviews: 204, years: 16, hasGST: true, hasTrustSEAL: true, hasPayProtected: false, image: 'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9917 10513', distance: 300, matchHighlight: 'Replies within 1 hrs' },
  { id: 41, name: 'Alpha Power Systems', city: 'Amritsar', spec: '30 kVA', price: '₹480,468', priceUnit: '/unit', rating: 3.6, reviews: 211, years: 19, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9648 10532', distance: 311, matchHighlight: '6 buyers served in 6m' },
  { id: 42, name: 'Om Shakti Generators', city: 'Jodhpur', spec: '40 kVA', price: '₹496,199', priceUnit: '/unit', rating: 4.9, reviews: 218, years: 22, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9379 10551', distance: 322, matchHighlight: 'High demand in this category' },
  { id: 43, name: 'Blue Star Gensets', city: 'Delhi', spec: '62.5 kVA', price: '₹511,930', priceUnit: '/unit', rating: 4.8, reviews: 225, years: 3, hasGST: false, hasTrustSEAL: true, hasPayProtected: true, image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9000 10570', distance: 333, matchHighlight: 'Replies within 1 hrs' },
  { id: 44, name: 'Continental Power Co', city: 'Mumbai', spec: '75 kVA', price: '₹527,661', priceUnit: '/unit', rating: 4.7, reviews: 232, years: 6, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862632/pexels-photo-3862632.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9731 10589', distance: 344, matchHighlight: '74 buyers served in 6m' },
  { id: 45, name: 'Krishna Diesel Works', city: 'Pune', spec: '100 kVA', price: '₹543,392', priceUnit: '/unit', rating: 4.6, reviews: 239, years: 9, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9462 10608', distance: 355, matchHighlight: 'High demand in this category' },
  { id: 46, name: 'Silverline Power Systems', city: 'Ahmedabad', spec: '125 kVA', price: '₹559,123', priceUnit: '/unit', rating: 4.5, reviews: 246, years: 12, hasGST: true, hasTrustSEAL: true, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9193 10627', distance: 366, matchHighlight: 'Replies within 4 hrs' },
  { id: 47, name: 'Delta Gensets', city: 'Bangalore', spec: '250 kVA', price: '₹574,854', priceUnit: '/unit', rating: 4.4, reviews: 253, years: 15, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9824 10646', distance: 377, matchHighlight: '23 buyers served in 6m' },
  { id: 48, name: 'Powerline Systems Pvt Ltd', city: 'Chennai', spec: '500 kVA', price: '₹590,585', priceUnit: '/unit', rating: 4.3, reviews: 260, years: 18, hasGST: false, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9555 10665', distance: 388, matchHighlight: 'High demand in this category' },
  { id: 49, name: 'Sterling Gensets Pvt Ltd', city: 'Jaipur', spec: '5 kVA', price: '₹606,316', priceUnit: '/unit', rating: 4.2, reviews: 267, years: 21, hasGST: true, hasTrustSEAL: true, hasPayProtected: true, image: 'https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9286 10684', distance: 399, matchHighlight: 'Replies within 4 hrs' },
  { id: 50, name: 'Vertex Power Solutions Pvt Ltd', city: 'Hyderabad', spec: '7.5 kVA', price: '₹622,047', priceUnit: '/unit', rating: 4.1, reviews: 274, years: 2, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9917 10703', distance: 410, matchHighlight: '10 buyers served in 6m' },
  { id: 51, name: 'Ashoka Diesels Pvt Ltd', city: 'Kolkata', spec: '15 kVA', price: '₹637,778', priceUnit: '/unit', rating: 4.0, reviews: 281, years: 5, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9648 10722', distance: 421, matchHighlight: 'High demand in this category' },
  { id: 52, name: 'Bharat Power Corp Pvt Ltd', city: 'Nagpur', spec: '25 kVA', price: '₹653,509', priceUnit: '/unit', rating: 3.9, reviews: 288, years: 8, hasGST: true, hasTrustSEAL: true, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862632/pexels-photo-3862632.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9379 10741', distance: 432, matchHighlight: 'Replies within 2 hrs' },
  { id: 53, name: 'Unity Generators Pvt Ltd', city: 'Surat', spec: '30 kVA', price: '₹669,240', priceUnit: '/unit', rating: 3.8, reviews: 295, years: 11, hasGST: false, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9000 10760', distance: 443, matchHighlight: '72 buyers served in 6m' },
  { id: 54, name: 'Prime Energy Systems Pvt Ltd', city: 'Lucknow', spec: '40 kVA', price: '₹684,971', priceUnit: '/unit', rating: 3.7, reviews: 302, years: 14, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9731 10779', distance: 454, matchHighlight: 'High demand in this category' },
  { id: 55, name: 'National Power Works Pvt Ltd', city: 'Indore', spec: '62.5 kVA', price: '₹700,702', priceUnit: '/unit', rating: 3.6, reviews: 309, years: 17, hasGST: true, hasTrustSEAL: true, hasPayProtected: true, image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9462 10798', distance: 465, matchHighlight: 'Replies within 1 hrs' },
  { id: 56, name: 'Global Gensets India Pvt Ltd', city: 'Bhopal', spec: '75 kVA', price: '₹716,433', priceUnit: '/unit', rating: 4.9, reviews: 316, years: 20, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9193 10817', distance: 476, matchHighlight: '2 buyers served in 6m' },
  { id: 57, name: 'Shakti Power Ltd Pvt Ltd', city: 'Coimbatore', spec: '100 kVA', price: '₹732,164', priceUnit: '/unit', rating: 4.8, reviews: 323, years: 1, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9824 10836', distance: 487, matchHighlight: 'High demand in this category' },
  { id: 58, name: 'Sunrise Diesel Co Pvt Ltd', city: 'Kanpur', spec: '125 kVA', price: '₹747,895', priceUnit: '/unit', rating: 4.7, reviews: 330, years: 4, hasGST: false, hasTrustSEAL: true, hasPayProtected: false, image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9555 10855', distance: 498, matchHighlight: 'Replies within 3 hrs' },
  { id: 59, name: 'Metro Power Solutions Pvt Ltd', city: 'Patna', spec: '250 kVA', price: '₹763,626', priceUnit: '/unit', rating: 4.6, reviews: 337, years: 7, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9286 10874', distance: 509, matchHighlight: '29 buyers served in 6m' },
  { id: 60, name: 'Vishwakarma Gensets Pvt Ltd', city: 'Vadodara', spec: '500 kVA', price: '₹779,357', priceUnit: '/unit', rating: 4.5, reviews: 344, years: 10, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862632/pexels-photo-3862632.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9917 10893', distance: 520, matchHighlight: 'High demand in this category' },
  { id: 61, name: 'Trident Power Systems Pvt Ltd', city: 'Ludhiana', spec: '5 kVA', price: '₹795,088', priceUnit: '/unit', rating: 4.4, reviews: 351, years: 13, hasGST: true, hasTrustSEAL: true, hasPayProtected: true, image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9648 10912', distance: 531, matchHighlight: 'Replies within 3 hrs' },
  { id: 62, name: 'Om Generators Pvt Ltd', city: 'Rajkot', spec: '7.5 kVA', price: '₹810,819', priceUnit: '/unit', rating: 4.3, reviews: 358, years: 16, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9379 10931', distance: 542, matchHighlight: '50 buyers served in 6m' },
  { id: 63, name: 'Everest Power Co Pvt Ltd', city: 'Varanasi', spec: '15 kVA', price: '₹826,550', priceUnit: '/unit', rating: 4.2, reviews: 365, years: 19, hasGST: false, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9000 10950', distance: 553, matchHighlight: 'High demand in this category' },
  { id: 64, name: 'Dynamic Diesel Works Pvt Ltd', city: 'Agra', spec: '25 kVA', price: '₹842,281', priceUnit: '/unit', rating: 4.1, reviews: 372, years: 22, hasGST: true, hasTrustSEAL: true, hasPayProtected: false, image: 'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9731 10969', distance: 564, matchHighlight: 'Replies within 2 hrs' },
  { id: 65, name: 'Reliable Gensets Pvt Ltd', city: 'Nashik', spec: '30 kVA', price: '₹858,012', priceUnit: '/unit', rating: 4.0, reviews: 379, years: 3, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9462 10988', distance: 575, matchHighlight: '82 buyers served in 6m' },
  { id: 66, name: 'Pinnacle Power India Pvt Ltd', city: 'Faridabad', spec: '40 kVA', price: '₹873,743', priceUnit: '/unit', rating: 3.9, reviews: 386, years: 6, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9193 11007', distance: 586, matchHighlight: 'High demand in this category' },
  { id: 67, name: 'Apex Generator Corp Pvt Ltd', city: 'Meerut', spec: '62.5 kVA', price: '₹889,474', priceUnit: '/unit', rating: 3.8, reviews: 393, years: 9, hasGST: true, hasTrustSEAL: true, hasPayProtected: true, image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9824 11026', distance: 597, matchHighlight: 'Replies within 4 hrs' },
  { id: 68, name: 'Sigma Power Systems Pvt Ltd', city: 'Visakhapatnam', spec: '75 kVA', price: '₹905,205', priceUnit: '/unit', rating: 3.7, reviews: 400, years: 12, hasGST: false, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862632/pexels-photo-3862632.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9555 11045', distance: 608, matchHighlight: '44 buyers served in 6m' },
  { id: 69, name: 'Modern Diesel Traders Pvt Ltd', city: 'Guwahati', spec: '100 kVA', price: '₹920,936', priceUnit: '/unit', rating: 3.6, reviews: 407, years: 15, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9286 11064', distance: 619, matchHighlight: 'High demand in this category' },
  { id: 70, name: 'Precision Gensets Pvt Ltd', city: 'Chandigarh', spec: '125 kVA', price: '₹936,667', priceUnit: '/unit', rating: 4.9, reviews: 414, years: 18, hasGST: true, hasTrustSEAL: true, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9917 11083', distance: 630, matchHighlight: 'Replies within 1 hrs' },
  { id: 71, name: 'Capital Power Solutions Pvt Ltd', city: 'Amritsar', spec: '250 kVA', price: '₹952,398', priceUnit: '/unit', rating: 4.8, reviews: 421, years: 21, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9648 11102', distance: 641, matchHighlight: '51 buyers served in 6m' },
  { id: 72, name: 'Elite Generator Co Pvt Ltd', city: 'Jodhpur', spec: '500 kVA', price: '₹968,129', priceUnit: '/unit', rating: 4.7, reviews: 428, years: 2, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9379 11121', distance: 652, matchHighlight: 'High demand in this category' },
  { id: 73, name: 'Rajdhani Power Works Pvt Ltd', city: 'Delhi', spec: '5 kVA', price: '₹983,860', priceUnit: '/unit', rating: 4.6, reviews: 435, years: 5, hasGST: false, hasTrustSEAL: true, hasPayProtected: true, image: 'https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9000 11140', distance: 663, matchHighlight: 'Replies within 1 hrs' },
  { id: 74, name: 'Fortune Gensets Pvt Ltd', city: 'Mumbai', spec: '7.5 kVA', price: '₹999,591', priceUnit: '/unit', rating: 4.5, reviews: 442, years: 8, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9731 11159', distance: 674, matchHighlight: '39 buyers served in 6m' },
  { id: 75, name: 'Speedway Diesels Pvt Ltd', city: 'Pune', spec: '15 kVA', price: '₹1,015,322', priceUnit: '/unit', rating: 4.4, reviews: 449, years: 11, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9462 11178', distance: 685, matchHighlight: 'High demand in this category' },
  { id: 76, name: 'Alpha Power Systems Pvt Ltd', city: 'Ahmedabad', spec: '25 kVA', price: '₹1,031,053', priceUnit: '/unit', rating: 4.3, reviews: 456, years: 14, hasGST: true, hasTrustSEAL: true, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862632/pexels-photo-3862632.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9193 11197', distance: 696, matchHighlight: 'Replies within 4 hrs' },
  { id: 77, name: 'Om Shakti Generators Pvt Ltd', city: 'Bangalore', spec: '30 kVA', price: '₹1,046,784', priceUnit: '/unit', rating: 4.2, reviews: 463, years: 17, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9824 11216', distance: 707, matchHighlight: '77 buyers served in 6m' },
  { id: 78, name: 'Blue Star Gensets Pvt Ltd', city: 'Chennai', spec: '40 kVA', price: '₹1,062,515', priceUnit: '/unit', rating: 4.1, reviews: 470, years: 20, hasGST: false, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9555 11235', distance: 718, matchHighlight: 'High demand in this category' },
  { id: 79, name: 'Continental Power Co Pvt Ltd', city: 'Jaipur', spec: '62.5 kVA', price: '₹1,078,246', priceUnit: '/unit', rating: 4.0, reviews: 477, years: 1, hasGST: true, hasTrustSEAL: true, hasPayProtected: true, image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9286 11254', distance: 729, matchHighlight: 'Replies within 4 hrs' },
  { id: 80, name: 'Krishna Diesel Works Pvt Ltd', city: 'Hyderabad', spec: '75 kVA', price: '₹1,093,977', priceUnit: '/unit', rating: 3.9, reviews: 484, years: 4, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9917 11273', distance: 740, matchHighlight: '45 buyers served in 6m' },
  { id: 81, name: 'Silverline Power Systems Pvt Ltd', city: 'Kolkata', spec: '100 kVA', price: '₹1,109,708', priceUnit: '/unit', rating: 3.8, reviews: 491, years: 7, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9648 11292', distance: 751, matchHighlight: 'High demand in this category' },
  { id: 82, name: 'Delta Gensets Pvt Ltd', city: 'Nagpur', spec: '125 kVA', price: '₹1,125,439', priceUnit: '/unit', rating: 3.7, reviews: 18, years: 10, hasGST: true, hasTrustSEAL: true, hasPayProtected: false, image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9379 11311', distance: 762, matchHighlight: 'Replies within 2 hrs' },
  { id: 83, name: 'Powerline Systems Industries', city: 'Surat', spec: '250 kVA', price: '₹1,141,170', priceUnit: '/unit', rating: 3.6, reviews: 25, years: 13, hasGST: false, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9000 11330', distance: 773, matchHighlight: '39 buyers served in 6m' },
  { id: 84, name: 'Sterling Gensets Industries', city: 'Lucknow', spec: '500 kVA', price: '₹1,156,901', priceUnit: '/unit', rating: 4.9, reviews: 32, years: 16, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862632/pexels-photo-3862632.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9731 11349', distance: 4, matchHighlight: 'High demand in this category' },
  { id: 85, name: 'Vertex Power Solutions Industries', city: 'Indore', spec: '5 kVA', price: '₹1,172,632', priceUnit: '/unit', rating: 4.8, reviews: 39, years: 19, hasGST: true, hasTrustSEAL: true, hasPayProtected: true, image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9462 11368', distance: 15, matchHighlight: 'Replies within 1 hrs' },
  { id: 86, name: 'Ashoka Diesels Industries', city: 'Bhopal', spec: '7.5 kVA', price: '₹1,188,363', priceUnit: '/unit', rating: 4.7, reviews: 46, years: 22, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9193 11387', distance: 26, matchHighlight: '56 buyers served in 6m' },
  { id: 87, name: 'Bharat Power Corp Industries', city: 'Coimbatore', spec: '15 kVA', price: '₹1,204,094', priceUnit: '/unit', rating: 4.6, reviews: 53, years: 3, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9824 11406', distance: 37, matchHighlight: 'High demand in this category' },
  { id: 88, name: 'Unity Generators Industries', city: 'Kanpur', spec: '25 kVA', price: '₹1,219,825', priceUnit: '/unit', rating: 4.5, reviews: 60, years: 6, hasGST: false, hasTrustSEAL: true, hasPayProtected: false, image: 'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9555 11425', distance: 48, matchHighlight: 'Replies within 3 hrs' },
  { id: 89, name: 'Prime Energy Systems Industries', city: 'Patna', spec: '30 kVA', price: '₹1,235,556', priceUnit: '/unit', rating: 4.4, reviews: 67, years: 9, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9286 11444', distance: 59, matchHighlight: '32 buyers served in 6m' },
  { id: 90, name: 'National Power Works Industries', city: 'Vadodara', spec: '40 kVA', price: '₹1,251,287', priceUnit: '/unit', rating: 4.3, reviews: 74, years: 12, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9917 11463', distance: 70, matchHighlight: 'High demand in this category' },
  { id: 91, name: 'Global Gensets India Industries', city: 'Ludhiana', spec: '62.5 kVA', price: '₹1,267,018', priceUnit: '/unit', rating: 4.2, reviews: 81, years: 15, hasGST: true, hasTrustSEAL: true, hasPayProtected: true, image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9648 11482', distance: 81, matchHighlight: 'Replies within 3 hrs' },
  { id: 92, name: 'Shakti Power Ltd Industries', city: 'Rajkot', spec: '75 kVA', price: '₹1,282,749', priceUnit: '/unit', rating: 4.1, reviews: 88, years: 18, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862632/pexels-photo-3862632.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9379 11501', distance: 92, matchHighlight: '82 buyers served in 6m' },
  { id: 93, name: 'Sunrise Diesel Co Industries', city: 'Varanasi', spec: '100 kVA', price: '₹1,298,480', priceUnit: '/unit', rating: 4.0, reviews: 95, years: 21, hasGST: false, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9000 11520', distance: 103, matchHighlight: 'High demand in this category' },
  { id: 94, name: 'Metro Power Solutions Industries', city: 'Agra', spec: '125 kVA', price: '₹1,314,211', priceUnit: '/unit', rating: 3.9, reviews: 102, years: 2, hasGST: true, hasTrustSEAL: true, hasPayProtected: false, image: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9731 11539', distance: 114, matchHighlight: 'Replies within 2 hrs' },
  { id: 95, name: 'Vishwakarma Gensets Industries', city: 'Nashik', spec: '250 kVA', price: '₹1,329,942', priceUnit: '/unit', rating: 3.8, reviews: 109, years: 5, hasGST: true, hasTrustSEAL: false, hasPayProtected: true, image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9462 11558', distance: 125, matchHighlight: '68 buyers served in 6m' },
  { id: 96, name: 'Trident Power Systems Industries', city: 'Faridabad', spec: '500 kVA', price: '₹1,345,673', priceUnit: '/unit', rating: 3.7, reviews: 116, years: 8, hasGST: true, hasTrustSEAL: false, hasPayProtected: false, image: 'https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=400', phone: '+91 9193 11577', distance: 136, matchHighlight: 'High demand in this category' },
];

function highlightIcon(text: string) {
  if (text.startsWith('Replies')) return Clock;
  if (text.includes('requirements')) return MapPin;
  return TrendingUp;
}

// "N buyers served in 6m" — below 5 is too thin a signal to show (blank line instead);
// above 100 is capped and shown as "100+"; the unit is spelled out in full.
function formatMatchHighlight(text: string): string | null {
  const match = text.match(/^(\d+) buyers served in 6m$/);
  if (!match) return text;
  const count = parseInt(match[1], 10);
  if (count < 5) return null;
  if (count > 100) return '100+ buyers served in 6 months';
  return `${count} buyers served in 6 months`;
}

// Maps SpecGroup[] (from the real ISQ specs API) into the same FilterSection
// shape the left panel already knows how to render — so the whole pill/
// quantity UI, activeFilters logic, and stale-results comparison all keep
// working unmodified against real, per-product specs instead of the
// hardcoded generator ones.
function mapSpecGroupsToFilterSections(
  groups: Awaited<ReturnType<typeof fetchSpecs>>
): { sections: FilterSection[]; unitOptions: string[] } {
  const quantitySection: FilterSection = {
    id: 'quantity',
    label: 'Quantity',
    type: 'quantity',
    singleSelect: true,
    options: [],
  };
  // A "Unit"/"Quantity Unit" spec group is the same thing the quantity field's
  // own unit chips already ask for — fold its options into that one control
  // instead of showing it again as a separate spec section below.
  const isUnitGroup = (label: string) => /unit/i.test(label.trim());
  const unitGroup = groups.find(g => g.options.length > 0 && isUnitGroup(g.label));
  const pillSections: FilterSection[] = groups
    .filter(g => g.options.length > 0 && !isUnitGroup(g.label))
    .map(g => ({
      id: g.id,
      label: g.label,
      type: 'pill',
      singleSelect: true,
      options: g.options.map(o => o.label),
    }));
  return {
    sections: [quantitySection, ...pillSections],
    unitOptions: unitGroup ? unitGroup.options.map(o => o.label) : QUANTITY_UNITS,
  };
}

// p2_breakdown sometimes comes back as a JSON string instead of an object,
// and bl_mcat_6m itself can arrive as a numeric string — so parse/coerce
// defensively rather than assuming the API always hands back clean types.
function extractBlMcat6m(s: CuratedSeller): number | null {
  let breakdown: unknown = s.p2_breakdown;
  if (typeof breakdown === 'string') {
    try {
      breakdown = JSON.parse(breakdown);
    } catch {
      breakdown = null;
    }
  }
  const raw =
    (breakdown && typeof breakdown === 'object'
      ? (breakdown as Record<string, unknown>).bl_mcat_6m
      : undefined) ?? (s as unknown as Record<string, unknown>).bl_mcat_6m;
  if (typeof raw === 'number' && !Number.isNaN(raw)) return raw;
  if (typeof raw === 'string' && raw.trim() !== '' && !Number.isNaN(Number(raw))) return Number(raw);
  return null;
}

// Maps real curated-search results (from the windmill job/status APIs) into
// the SellerCard shape the results grid already renders — so cards stay
// API-powered once Find Best Match is clicked, instead of reusing the
// hardcoded SELLERS demo list.
function mapCuratedSellersToCards(list: CuratedSeller[]): SellerCard[] {
  return list.map((s, idx) => {
    const custTypeWt = Number(s.CustTypeWt);
    const rating = typeof s.supplier_rating === 'number'
      ? s.supplier_rating
      : typeof s.rating === 'number' ? s.rating : 0;
    const reviews = typeof s.rating_count === 'number'
      ? s.rating_count
      : typeof s.rating_count === 'string' ? (parseInt(s.rating_count, 10) || 0) : 0;
    const yearsMatch = typeof s.memberSince === 'string' ? s.memberSince.match(/(\d+)\s*yrs?/i) : null;
    return {
      id: idx + 1,
      name: s.companyname ?? s.title ?? s.original_title ?? 'Seller',
      city: s.city ?? '',
      spec: '',
      price: s.price_formatted ?? 'Ask for price',
      priceUnit: '',
      rating,
      reviews,
      years: yearsMatch ? parseInt(yearsMatch[1], 10) : (s.vintage_years ?? 0),
      hasGST: !!s.gst_verified && s.gst_verified !== '0',
      hasTrustSEAL: !Number.isNaN(custTypeWt) && custTypeWt >= 199,
      hasPayProtected: !!s.trustseal,
      image: s.image || 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400',
      askPrice: !s.price_formatted,
      phone: undefined,
      distance: s.dist_km ?? 0,
      matchHighlight: (() => {
        const blMcat6m = extractBlMcat6m(s);
        return blMcat6m !== null ? `${blMcat6m} buyers served in 6m` : s.boost_reason;
      })(),
    };
  });
}

const QUANTITY_UNITS = ['Piece', 'Dozen', 'Box'];

const DEFAULT_FILTER_SECTIONS: FilterSection[] = [
  {
    id: 'quantity',
    label: 'Quantity',
    type: 'quantity',
    singleSelect: true,
    options: [],
  },
  {
    id: 'power',
    label: 'Power (kVA)',
    type: 'pill',
    singleSelect: true,
    options: ['15 kVA', '25 kVA', '5 kVA', '62.5 kVA', '125 kVA', '250 kVA'],
  },
  {
    id: 'phase',
    label: 'Phase',
    type: 'pill',
    singleSelect: true,
    options: ['Three Phase', 'Single Phase'],
  },
  {
    id: 'gentype',
    label: 'Generator Type',
    type: 'pill',
    singleSelect: true,
    options: ['Silent', 'Non-Silent', 'Open', 'Portable'],
  },
];



const INDIAN_CITIES = [
  'Agra','Ahmedabad','Ajmer','Aligarh','Allahabad','Amritsar','Aurangabad',
  'Bangalore','Bareilly','Bhopal','Bhubaneswar','Chandigarh','Chennai','Coimbatore',
  'Dehradun','Delhi','Dharamsala','Faridabad','Ghaziabad','Gurgaon','Guwahati',
  'Hyderabad','Indore','Jabalpur','Jaipur','Jalandhar','Jammu','Jodhpur',
  'Kanpur','Kochi','Kolkata','Kota','Lucknow','Ludhiana','Madurai','Mangalore',
  'Meerut','Mumbai','Mysore','Nagpur','Nanded','Namakkal','Nagaland','Nasik',
  'Navi Mumbai','Noida','Patna','Pune','Raipur','Rajkot','Ranchi',
  'Surat','Thane','Thiruvananthapuram','Vadodara','Varanasi','Vijayawada','Visakhapatnam',
];

// All section IDs expanded by default
const ALL_GROUP_IDS = DEFAULT_FILTER_SECTIONS.map(s => s.id);

// Tap-to-search shortcuts for the empty state — tier-2/3 buyers often browse
// by category rather than typing a precise product name.
const RECENT_SEARCHES = ['Packaging Machine', 'LED Lights'];

export default function SearchModal({ query, city, onClose }: SearchModalProps) {
  // Editable on screen 1 — lets the buyer type a product/service name here when
  // the modal was opened with no query (e.g. from the Advanced Search action).
  const [searchQuery, setSearchQuery] = useState(query);
  // Only updates when the buyer hits Enter or clicks the search button —
  // typing alone should not trigger the mcat/specs lookup or flip screens.
  const [submittedQuery, setSubmittedQuery] = useState(query);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [openGroups, setOpenGroups] = useState<string[]>(ALL_GROUP_IDS);
  const [specSections, setSpecSections] = useState<FilterSection[]>(DEFAULT_FILTER_SECTIONS);
  const [specsLoading, setSpecsLoading] = useState(false);
  const [specsError, setSpecsError] = useState<string | null>(null);
  const [mcatId, setMcatId] = useState('');
  const [curatedError, setCuratedError] = useState<string | null>(null);
const [localOnly, setLocalOnly] = useState(false);
  const [selectedCity, setSelectedCity] = useState(city || 'Dharamsala');
  const [cityOpen, setCityOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState('');
  const cityInputRef = useRef<HTMLInputElement>(null);
  const [favourites, setFavourites] = useState<number[]>([]);
  const [isFinding, setIsFinding] = useState(false);
  const [evalStage, setEvalStage] = useState(-1);
  const [evalDone, setEvalDone] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [topPicks, setTopPicks] = useState<SellerCard[]>([]);
  const [quantityValue, setQuantityValue] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('Piece');
  const [quantityUnits, setQuantityUnits] = useState<string[]>(QUANTITY_UNITS);
  const [bestMatchId, setBestMatchId] = useState<number | null>(null);
  // Specs (and city) the current results were actually matched against — lets us tell
  // when the visible cards are stale relative to what's selected now.
  const [matchedFilters, setMatchedFilters] = useState<string[]>([]);
  const [matchedCity, setMatchedCity] = useState<string>('');
  const [showNearby, setShowNearby] = useState(false);
  const [sellers, setSellers] = useState<SellerCard[]>(SELLERS);
  const [visibleCount, setVisibleCount] = useState(9);
  const [priceRequestedIds, setPriceRequestedIds] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [filterShake, setFilterShake] = useState(false);
  const [showFilterOverlay, setShowFilterOverlay] = useState(false);
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasActiveFilters = activeFilters.length > 0;
  const hasQuery = submittedQuery.trim().length > 0;
  const runSearch = (term: string) => { setSearchQuery(term); setSubmittedQuery(term); };
  const handleSubmitSearch = () => runSearch(searchQuery);
  const resultsAreStale = bestMatchId !== null && (
    activeFilters.length !== matchedFilters.length ||
    activeFilters.some(f => !matchedFilters.includes(f)) ||
    selectedCity !== matchedCity
  );


  // On the results screen, show every spec category except Quantity —
  // including ones the user never picked a value for — so the full
  // match context stays visible, not just the filters that were set.
  const resultSpecChips = specSections.filter(s => s.id !== 'quantity').map(section => {
    const value = activeFilters.find(f => section.options.includes(f));
    return { section, value: value ?? null };
  });

  const [nearbySellers, setNearbySellers] = useState<SellerCard[]>([]);
  const displayedSellers = sellers.slice(0, visibleCount);
  const hasMoreSellers = visibleCount < sellers.length;
  const noResults = bestMatchId !== null && !isFinding && displayedSellers.length === 0;

  // Curated slider — 4 cards per group
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Resolve the typed query to a real mcat, then fetch its real ISQ specs
  // for the left panel — falling back to the generic demo sections if
  // resolution fails or the query is empty.
  useEffect(() => {
    const controller = new AbortController();
    const trimmed = submittedQuery.trim();
    if (!trimmed) {
      setSpecSections(DEFAULT_FILTER_SECTIONS);
      setQuantityUnits(QUANTITY_UNITS);
      setQuantityUnit(QUANTITY_UNITS[0]);
      return;
    }
    setSpecsLoading(true);
    setSpecsError(null);
    (async () => {
      try {
        const mcat = await fetchMcatId(trimmed, controller.signal);
        if (!mcat) {
          console.warn('[AdvanceSearch] mcat resolution returned no match for query:', trimmed);
          setSpecSections(DEFAULT_FILTER_SECTIONS);
          setQuantityUnits(QUANTITY_UNITS);
          setQuantityUnit(QUANTITY_UNITS[0]);
          setSpecsError('no-mcat');
          return;
        }
        setMcatId(mcat.mcatid);
        const groups = await fetchSpecs(mcat.mcatid, controller.signal);
        if (groups.length > 0) {
          const { sections, unitOptions } = mapSpecGroupsToFilterSections(groups);
          setSpecSections(sections);
          setQuantityUnits(unitOptions);
          setQuantityUnit(unitOptions[0]);
        } else {
          console.warn('[AdvanceSearch] no ISQ spec groups returned for mcatid:', mcat.mcatid);
          setSpecSections(DEFAULT_FILTER_SECTIONS);
          setQuantityUnits(QUANTITY_UNITS);
          setQuantityUnit(QUANTITY_UNITS[0]);
          setSpecsError('no-specs');
        }
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') return;
        console.error('[AdvanceSearch] mcat/specs fetch failed — likely blocked by network/CORS:', err);
        setSpecSections(DEFAULT_FILTER_SECTIONS);
        setQuantityUnits(QUANTITY_UNITS);
        setQuantityUnit(QUANTITY_UNITS[0]);
        setSpecsError('fetch-failed');
      } finally {
        setSpecsLoading(false);
      }
    })();
    return () => { controller.abort(); };
  }, [submittedQuery]);

  useEffect(() => {
    if (cityOpen) {
      setCityQuery('');
      setTimeout(() => cityInputRef.current?.focus(), 0);
    }
  }, [cityOpen]);

  const citySuggestions = cityQuery.trim().length > 0
    ? INDIAN_CITIES.filter(c => c.toLowerCase().includes(cityQuery.toLowerCase())).slice(0, 8)
    : INDIAN_CITIES.slice(0, 8);

  function toggleFilter(filter: string, section?: FilterSection) {
    setActiveFilters(prev => {
      if (prev.includes(filter)) return prev.filter(f => f !== filter);
      if (section?.singleSelect) {
        return [...prev.filter(f => !section.options.includes(f)), filter];
      }
      return [...prev, filter];
    });
  }

  function toggleGroup(id: string) {
    setOpenGroups(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  }

  function removeFilter(filter: string) {
    setActiveFilters(prev => prev.filter(f => f !== filter));
  }

  function handleBackToSearch() {
    setTopPicks([]);
    setNearbySellers([]);
    setBestMatchId(null);
    setMatchedFilters([]);
    setMatchedCity('');
    setSellers(SELLERS);
    setVisibleCount(9);
    setCityOpen(false);
    setShowNearby(false);
  }

  // From the results screen, take the buyer all the way back to the
  // "What are you looking for?" screen (not just back to refine/specs).
  function handleBackToQuery() {
    handleBackToSearch();
    setSearchQuery('');
    setSubmittedQuery('');
  }

  // Real job-creation + polling flow: submits the buyer's actual keyword,
  // resolved mcat, city, quantity and selected specs to the windmill API,
  // then polls on a 5s/10s/20s... backoff (stopping on `completed: true`)
  // and renders whatever ranked sellers came back — no more static demo data.
  async function handleFindBestMatch() {
    if (!hasActiveFilters) {
      setFilterShake(true);
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
      shakeTimer.current = setTimeout(() => setFilterShake(false), 600);
      return;
    }
    const filtersForThisRun = activeFilters;
    const cityForThisRun = selectedCity;
    setIsFinding(true);
    setEvalStage(0);
    setEvalDone([]);
    setProgress(4);
    setCityOpen(false);
    setCuratedError(null);
    // Buyer already told us they only want nearby sellers — land them on the
    // Nearest tab instead of Best Match, so the curated screen matches that intent.
    setShowNearby(localOnly);

    const specifications: SpecAnswer[] = specSections
      .filter(section => section.id !== 'quantity')
      .map(section => {
        const value = activeFilters.find(f => section.options.includes(f));
        return value ? { question: section.label, answer: value } : null;
      })
      .filter((s): s is SpecAnswer => s !== null);

    const LOADER_MS = 22200;
    const STAGE_MS = LOADER_MS / EVAL_STAGE_COUNT;
    const loaderStart = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - loaderStart;
      setProgress(Math.min(94, Math.round((elapsed / LOADER_MS) * 94)));
      const stageIdx = Math.min(EVAL_STAGE_COUNT - 1, Math.floor(elapsed / STAGE_MS));
      setEvalDone(Array.from({ length: stageIdx }, (_, i) => i));
      setEvalStage(stageIdx);
    }, 200);

    let jobId: string | null = null;
    try {
      jobId = await createCuratedSearchJob({
        offer_id: '',
        keyword: submittedQuery,
        mcat_id: mcatId,
        mcat_name: submittedQuery,
        buyer_city_id: '1',
        buyer_city: cityForThisRun,
        city_id: '70751',
        city_match: 'exact',
        quantity: quantityValue,
        quantity_unit: quantityUnit,
        specifications,
      });
    } catch (err) {
      console.error('[AdvanceSearch] createCuratedSearchJob threw — likely blocked by network/CORS:', err);
    }

    if (!jobId) {
      console.warn('[AdvanceSearch] createCuratedSearchJob returned no job id — check Network tab for the windmill request.');
    }

    let finalSellers: CuratedSeller[] = [];
    let pollTimedOut = false;
    let pollErrored = !jobId;

    if (jobId) {
      const POLL_DELAYS_MS = [5000, 10000, 20000];
      const MAX_ATTEMPTS = 10;
      let attempt = 0;
      for (; attempt < MAX_ATTEMPTS; attempt++) {
        const delay = POLL_DELAYS_MS[Math.min(attempt, POLL_DELAYS_MS.length - 1)];
        await new Promise<void>(resolve => {
          timerRef.current = setTimeout(resolve, delay);
        });
        try {
          const result = await fetchCuratedSearchStatus(jobId);
          if (result.status === 'done') {
            finalSellers = result.sellers;
            break;
          }
          if (result.status === 'error') {
            pollErrored = true;
            break;
          }
        } catch (err) {
          console.error('[AdvanceSearch] fetchCuratedSearchStatus threw:', err);
          pollErrored = true;
          break;
        }
      }
      if (attempt === MAX_ATTEMPTS && finalSellers.length === 0) pollTimedOut = true;
    }

    if (finalSellers.length === 0) {
      setCuratedError(pollErrored ? 'failed' : pollTimedOut ? 'timeout' : 'empty');
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setEvalDone(Array.from({ length: EVAL_STAGE_COUNT }, (_, i) => i));
    setProgress(100);

    timerRef.current = setTimeout(() => {
      // Top Picks: ranked by the API's own `rank` attribute (falling back to
      // final_rank / rank_position when rank is absent), not raw API order.
      const rankedByRank = [...finalSellers].sort((a, b) => {
        const rankA = a.rank ?? a.final_rank ?? a.rank_position ?? Number.MAX_SAFE_INTEGER;
        const rankB = b.rank ?? b.final_rank ?? b.rank_position ?? Number.MAX_SAFE_INTEGER;
        return rankA - rankB;
      });
      // Nearby Sellers: ranked by distance (dist_km) from the same response.
      const rankedByDistance = [...finalSellers].sort((a, b) => (a.dist_km ?? 0) - (b.dist_km ?? 0));

      const mapped = mapCuratedSellersToCards(rankedByRank);
      if (mapped.length > 0) {
        mapped[0] = { ...mapped[0], isBestMatch: true };
      }
      const mappedNearby = mapCuratedSellersToCards(rankedByDistance);

      setSellers(mapped);
      setTopPicks(mapped);
      setNearbySellers(mappedNearby);
      setBestMatchId(mapped[0]?.id ?? null);
      setMatchedFilters(filtersForThisRun);
      setMatchedCity(cityForThisRun);
      setVisibleCount(9);
      setCityOpen(false);
      setIsFinding(false);
      setEvalStage(-1);
      setEvalDone([]);
      setProgress(0);
    }, 800);
  }

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Full-screen grey backdrop covers everything including header */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal positioned below header — full-bleed on msite, centered card on desktop */}
      {/* Popup is now allowed to extend over the page header — just a small
          symmetric margin all round instead of reserving space below it. */}
      <div
        className="absolute inset-0 flex justify-center items-center px-0 md:px-3 py-0 md:py-3"
        style={{ minHeight: 0 }}
      >
      <div
        className={`relative bg-white flex flex-col overflow-hidden w-full h-full rounded-none md:rounded-xl shadow-2xl ${
          !hasQuery && bestMatchId === null
            ? 'max-w-none md:max-w-[820px] md:h-auto'
            : topPicks.length > 0
            ? 'max-w-none md:max-w-[1080px] md:h-auto md:max-h-[calc(100vh-24px)]'
            : 'max-w-none md:max-w-[1000px] md:h-[92vh] md:max-h-[calc(100vh-24px)]'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        {(hasQuery || bestMatchId !== null) && (
        <div className="flex-shrink-0 flex flex-col gap-0 px-4 pt-2.5 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3 pb-2.5">
            {(bestMatchId !== null || hasQuery) && (
              <button
                type="button"
                onClick={bestMatchId === null ? handleBackToQuery : topPicks.length > 0 ? handleBackToQuery : handleBackToSearch}
                aria-label={bestMatchId === null ? 'Back to Search' : topPicks.length > 0 ? 'Back to Search' : 'Back to Refine'}
                title={bestMatchId === null ? 'Back to Search' : topPicks.length > 0 ? 'Back to Search' : 'Back to Refine'}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
            )}
            <div className="flex-1 min-w-0 overflow-hidden">
              {bestMatchId === null && hasQuery && (
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate capitalize">
                    {submittedQuery}
                  </p>
                  {!isFinding && (
                    <p className="md:hidden text-[11px] text-slate-400 truncate">
                      Refine your requirement
                    </p>
                  )}
                </div>
              )}
              {bestMatchId !== null && hasQuery && (
                <p className="text-sm font-bold text-slate-900 truncate capitalize">
                  {submittedQuery}
                </p>
              )}
            </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* City + nearby-only toggle — on the header's right corner on desktop; msite keeps them
                inline in the body instead (refine panel, curated results, loader), where there's more room. */}
            <div className="hidden md:flex items-center gap-2">
              <LocationRow
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                cityOpen={cityOpen}
                setCityOpen={setCityOpen}
                cityQuery={cityQuery}
                setCityQuery={setCityQuery}
                citySuggestions={citySuggestions}
                cityInputRef={cityInputRef}
                localOnly={localOnly}
                setLocalOnly={setLocalOnly}
              />
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          </div>

        </div>
        )}

        {/* Stale-results strip — specs changed since this match ran. Msite shows this inline in the
            curated body instead (after the spec chips), so it doesn't compete with the header. */}
        {resultsAreStale && !isFinding && (
          <div className="hidden md:flex flex-shrink-0 items-center gap-3 px-4 py-1.5 bg-amber-50 border-b border-amber-100">
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-800 min-w-0">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">See sellers matching your updated requirement</span>
            </span>
            <button
              type="button"
              onClick={handleFindBestMatch}
              className="flex-shrink-0 flex items-center gap-1.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3.5 py-1.5 shadow-sm transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Find Best Match
            </button>
          </div>
        )}

        {/* ── Body ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden relative" style={{ minHeight: topPicks.length > 0 ? 'auto' : undefined }}>
          {!hasQuery && bestMatchId === null ? (
            <div className="flex-1 flex flex-col overflow-y-auto px-6 py-8">
              <div className="relative flex items-center justify-between mb-4">
                <p className="hidden md:flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  What are you looking for?
                </p>
                {/* City — mobile only, centered on the popup's own top border (no pill chrome) instead of floating over the search bar below */}
                <div className="absolute left-1/2 -translate-x-1/2 md:hidden z-30">
                  <button
                    type="button"
                    onClick={() => setCityOpen(o => !o)}
                    className="flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-700 font-medium text-sm truncate max-w-[120px]">{selectedCity}</span>
                    {cityOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
                  </button>
                  {cityOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setCityOpen(false)} />
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-52 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden text-left">
                        <div className="p-2 border-b border-slate-100 flex items-center gap-1.5">
                          <input
                            type="text"
                            value={cityQuery}
                            onChange={e => setCityQuery(e.target.value)}
                            placeholder="Search city..."
                            className="flex-1 min-w-0 text-xs px-2.5 py-1.5 rounded-lg border border-teal-400 outline-none focus:ring-2 focus:ring-teal-100 placeholder-slate-400"
                          />
                          <button
                            type="button"
                            onClick={() => setCityOpen(false)}
                            aria-label="Close"
                            title="Close"
                            className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="max-h-52 overflow-y-auto py-1">
                          {citySuggestions.map(c => (
                            <button
                              key={c}
                              onClick={() => { setSelectedCity(c); setCityOpen(false); }}
                              className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                                c === selectedCity
                                  ? 'bg-teal-50 text-teal-700 font-medium'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                          {citySuggestions.length === 0 && (
                            <p className="px-3 py-2 text-xs text-slate-400">No cities found</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0 ml-auto md:ml-0"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div className="w-full max-w-3xl">

                {/* City + keyword — rectangular bar mimicking Header.tsx's desktop search bar */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-2.5">
                  {/* City — desktop only here; mobile has its own pill in the top row above */}
                  <div className="relative hidden md:block flex-shrink-0 w-[280px]">
                    <button
                      type="button"
                      onClick={() => setCityOpen(o => !o)}
                      className="flex items-center gap-1.5 w-full pl-2.5 pr-2 bg-white hover:bg-slate-50 transition-all duration-150 rounded-lg border border-slate-200 h-[38px]"
                    >
                      <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="currentColor" />
                      <span className="text-slate-700 font-medium flex-1 text-left text-sm truncate">{selectedCity}</span>
                      {cityOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
                    </button>
                    {cityOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setCityOpen(false)} />
                        <div className="absolute left-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden text-left">
                          <div className="p-2 border-b border-slate-100 flex items-center gap-1.5">
                            <input
                              type="text"
                              value={cityQuery}
                              onChange={e => setCityQuery(e.target.value)}
                              placeholder="Search city..."
                              className="flex-1 min-w-0 text-xs px-2.5 py-1.5 rounded-lg border border-teal-400 outline-none focus:ring-2 focus:ring-teal-100 placeholder-slate-400"
                            />
                            <button
                              type="button"
                              onClick={() => setCityOpen(false)}
                              aria-label="Close"
                              title="Close"
                              className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="max-h-52 overflow-y-auto py-1">
                            {citySuggestions.map(c => (
                              <button
                                key={c}
                                onClick={() => { setSelectedCity(c); setCityOpen(false); }}
                                className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                                  c === selectedCity
                                    ? 'bg-teal-50 text-teal-700 font-medium'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                            {citySuggestions.length === 0 && (
                              <p className="px-3 py-2 text-xs text-slate-400">No cities found</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <div className="relative z-10 flex items-center bg-white rounded-lg h-[38px] pl-3 overflow-hidden transition-all duration-300 border border-slate-200">
                      <input
                        type="text"
                        autoFocus
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSubmitSearch(); }}
                        placeholder="Search product or service"
                        className="flex-1 min-w-0 h-full border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleSubmitSearch}
                        aria-label="Search"
                        className="flex items-center justify-center w-10 h-full bg-teal-600 hover:bg-teal-700 text-white transition-all duration-150 flex-shrink-0"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent searches — minimal single line, tap to reuse */}
                <p className="mt-5 text-xs text-slate-500">
                  <span className="font-medium text-slate-600">Recent:</span>{' '}
                  {RECENT_SEARCHES.map((term, i) => (
                    <span key={term}>
                      <button
                        type="button"
                        onClick={() => runSearch(term)}
                        className="text-slate-600 hover:text-teal-700 transition-colors"
                      >
                        {term}
                      </button>
                      {i < RECENT_SEARCHES.length - 1 && <span className="text-slate-300"> · </span>}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          ) : (
            <>
          {/* Best Match Loading Overlay — full modal solid white, covers spec panel + results */}
          {isFinding && (
            <FindingBestMatchLoader
              evalStage={evalStage}
              evalDone={evalDone}
              progress={progress}
              specLabels={activeFilters.length > 0 ? activeFilters : [submittedQuery]}
              locationName={selectedCity}
              activeFilters={activeFilters}
            />
          )}
          {/* ── Left Filter Panel — full width on msite, fixed rail on desktop ── */}
          {topPicks.length === 0 && <div
            className="flex-shrink-0 flex flex-col overflow-hidden w-full md:w-[300px] border-slate-200 md:border-r bg-white md:bg-[#fafafa]"
          >
            {/* Why this panel matters — sets expectations up front */}
            {/* Location — city + nearby-only toggle, inline on the refine (spec) screen */}
            <div className="md:hidden">
              <div className="mx-3 mt-3 mb-3 px-0.5">
                <LocationRow
                  selectedCity={selectedCity}
                  setSelectedCity={setSelectedCity}
                  cityOpen={cityOpen}
                  setCityOpen={setCityOpen}
                  cityQuery={cityQuery}
                  setCityQuery={setCityQuery}
                  citySuggestions={citySuggestions}
                  cityInputRef={cityInputRef}
                  localOnly={localOnly}
                  setLocalOnly={setLocalOnly}
                />
              </div>
              <div className="flex-shrink-0 mx-3 mb-1 border-t border-slate-200" />
            </div>

            {/* Desktop — the header just holds the product name; this heading gives filters their own context */}
            <p className="hidden md:block flex-shrink-0 mx-3 mt-3 mb-1 px-0.5 text-xs font-semibold text-slate-700">
              Refine your requirement
            </p>

            <SpecFilterList
              specsLoading={specsLoading}
              specsError={specsError}
              specSections={specSections}
              openGroups={openGroups}
              toggleGroup={toggleGroup}
              activeFilters={activeFilters}
              toggleFilter={toggleFilter}
              quantityValue={quantityValue}
              setQuantityValue={setQuantityValue}
              quantityUnit={quantityUnit}
              setQuantityUnit={setQuantityUnit}
              quantityUnits={quantityUnits}
              filterShake={filterShake}
            />

            {/* Pinned bottom: CTA buttons */}
            <div className="flex-shrink-0 px-3 pb-3 pt-2 border-t border-slate-200 space-y-2 relative">
              <button
                onClick={hasActiveFilters ? handleFindBestMatch : () => setCityOpen(false)}
                disabled={isFinding}
                className="w-full py-2.5 text-white text-sm font-semibold rounded-lg transition-all duration-300 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 overflow-hidden"
              >
                <span key={hasActiveFilters ? 'fbm' : 'search'} className="animate-cta-swap inline-flex items-center justify-center gap-1.5">
                  {hasActiveFilters && <Sparkles className="w-3.5 h-3.5" />}
                  {hasActiveFilters ? 'Find Best Match' : 'Search'}
                </span>
              </button>
            </div>
          </div>}

          {/* ── Right Results Zone — hidden on msite for the initial browse grid; the curated results screen (topPicks) always shows */}
          <div
            className={`flex-1 flex-col min-w-0 relative ${topPicks.length === 0 ? 'hidden md:flex' : 'flex'}`}
            style={{ height: '100%' }}
          >

            {/* Zone 1 — Curated Top Picks (4 cards with slider) */}
            {topPicks.length > 0 && (
              <ResultsCarousel
                topPicks={topPicks}
                nearbySellers={nearbySellers}
                showNearby={showNearby}
                setShowNearby={setShowNearby}
                bestMatchId={bestMatchId}
                priceRequestedIds={priceRequestedIds}
                setPriceRequestedIds={setPriceRequestedIds}
                quantityValue={quantityValue}
                quantityUnit={quantityUnit}
                quantityUnits={quantityUnits}
                setQuantityValue={setQuantityValue}
                setQuantityUnit={setQuantityUnit}
                resultSpecChips={resultSpecChips}
                onToggleFilter={toggleFilter}
                onRemoveFilter={removeFilter}
                isFinding={isFinding}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                cityOpen={cityOpen}
                setCityOpen={setCityOpen}
                cityQuery={cityQuery}
                setCityQuery={setCityQuery}
                citySuggestions={citySuggestions}
                cityInputRef={cityInputRef}
                localOnly={localOnly}
                setLocalOnly={setLocalOnly}
                resultsAreStale={resultsAreStale}
                onFindBestMatch={handleFindBestMatch}
                onOpenFilters={() => setShowFilterOverlay(true)}
              />
            )}

            {/* Zone 2 — Card grid or empty state */}
            {topPicks.length === 0 && (noResults ? (
              <div className="flex flex-col items-center justify-center gap-4 px-6 text-center" style={{ flex: 1, minHeight: 0 }}>
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <SearchX className="w-7 h-7 text-slate-400" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm font-semibold text-slate-800">
                    {curatedError ? "Couldn't fetch matching sellers" : "No suppliers found"}
                  </p>
                  {curatedError && (
                    <p className="text-xs text-slate-500 max-w-xs">
                      {curatedError === 'failed' && "The matching service couldn't be reached. Check the browser console/network tab for the failed request."}
                      {curatedError === 'timeout' && "The matching service took too long to respond."}
                      {curatedError === 'empty' && "The matching service returned no sellers for this search."}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative" style={{ flex: 1, minHeight: 0 }}>
              <div className="results-scroll px-4 pt-3 pb-3 bg-white overflow-y-auto h-full" style={{ boxSizing: 'border-box', backgroundColor: '#ffffff', isolation: 'isolate' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gridAutoRows: 'min-content',
                    gap: '12px',
                  }}
                >
                  {displayedSellers.map(seller => (
                    <div key={seller.id} style={{ minWidth: 0, minHeight: 0 }}>
                      <SellerCardItem
                        seller={seller}
                        isFavourite={favourites.includes(seller.id)}
                        isBestMatch={seller.id === bestMatchId && !!seller.isBestMatch}
                        priceRequested={priceRequestedIds.includes(seller.id)}
                        onAskPrice={() => setPriceRequestedIds(prev => prev.includes(seller.id) ? prev : [...prev, seller.id])}
                        onToggleFavourite={() => setFavourites(prev =>
                          prev.includes(seller.id) ? prev.filter(id => id !== seller.id) : [...prev, seller.id]
                        )}
                      />
                    </div>
                  ))}
                </div>

                {hasMoreSellers && (
                  <div className="flex justify-center pt-4 pb-1">
                    <button
                      type="button"
                      onClick={() => setVisibleCount(c => Math.min(sellers.length, c + 9))}
                      className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors"
                    >
                      Show more
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              {/* Bottom fade — subtle cue that the grid continues below the fold */}
              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-10"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 100%)' }}
              />
              </div>
            ))}

          </div>
            </>
          )}
        </div>

        {/* Mobile filter overlay — opened from the "more filters" chip on the curated screen so buyers
            can reach specs that aren't already shown as a selected chip. Same picker UI as screen 1. */}
        {showFilterOverlay && bestMatchId !== null && (
          <div className="absolute inset-0 z-40 md:hidden flex flex-col bg-white">
            <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
              <p className="text-sm font-bold text-slate-900 truncate capitalize">{submittedQuery}</p>
              <button
                onClick={() => setShowFilterOverlay(false)}
                aria-label="Close filters"
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="mx-3 mt-3 mb-3 px-0.5 flex-shrink-0">
              <LocationRow
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                cityOpen={cityOpen}
                setCityOpen={setCityOpen}
                cityQuery={cityQuery}
                setCityQuery={setCityQuery}
                citySuggestions={citySuggestions}
                cityInputRef={cityInputRef}
                localOnly={localOnly}
                setLocalOnly={setLocalOnly}
              />
            </div>

            <div className="flex-shrink-0 mx-3 mb-1 border-t border-slate-200" />

            <SpecFilterList
              specsLoading={specsLoading}
              specsError={specsError}
              specSections={specSections}
              openGroups={openGroups}
              toggleGroup={toggleGroup}
              activeFilters={activeFilters}
              toggleFilter={toggleFilter}
              quantityValue={quantityValue}
              setQuantityValue={setQuantityValue}
              quantityUnit={quantityUnit}
              setQuantityUnit={setQuantityUnit}
              quantityUnits={quantityUnits}
            />

            <div className="flex-shrink-0 px-3 pb-3 pt-2 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowFilterOverlay(false);
                  handleFindBestMatch();
                }}
                className="w-full py-2.5 text-white text-sm font-semibold rounded-lg transition-all duration-300 bg-teal-600 hover:bg-teal-700 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Find Best Match
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

interface SellerCardItemProps {
  seller: SellerCard;
  isFavourite: boolean;
  isBestMatch: boolean;
  onToggleFavourite: () => void;
  priceRequested?: boolean;
  onAskPrice?: () => void;
  variant?: 'default' | 'curated';
}


// Compact quantity control for the curated results header — lets the buyer set
// (or correct) the quantity + unit without leaving the results screen, since
// this is required data the seller/AI matching needs but isn't just another spec.
interface QuantityChipProps {
  value: string;
  unit: string;
  units: string[];
  onValueChange: (v: string) => void;
  onUnitChange: (u: string) => void;
  locked?: boolean;
}

function QuantityChip({ value, unit, units, onValueChange, onUnitChange, locked = false }: QuantityChipProps) {
  const [open, setOpen] = useState(false);
  const chipRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const hasValue = value.trim().length > 0;

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (
        (chipRef.current && chipRef.current.contains(t)) ||
        (dropdownRef.current && dropdownRef.current.contains(t))
      ) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Fixed-position the dropdown against the viewport, same trick as FilterDropdownChip —
  // this chip sits inside an overflow-x-auto/overflow-y-hidden strip, so an absolutely
  // positioned panel would get clipped instead of showing below the chip.
  useEffect(() => {
    if (open && chipRef.current) {
      const rect = chipRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        zIndex: 10000,
      });
    }
  }, [open]);

  return (
    <>
      <div
        ref={chipRef}
        className={`relative flex-shrink-0 flex items-center gap-1 rounded-full pl-2.5 pr-1.5 py-1 shadow-sm transition-colors ${
          locked
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : hasValue
            ? `border bg-teal-50 text-teal-700 ${open ? 'border-teal-500' : 'border-teal-400'}`
            : `border border-dashed ${open ? 'border-teal-400 text-teal-600 bg-teal-50' : 'border-slate-300 text-slate-400 bg-slate-50'}`
        }`}
      >
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={e => onValueChange(e.target.value)}
          placeholder="Qty"
          disabled={locked}
          className={`w-9 text-xs font-medium bg-transparent outline-none placeholder-slate-400 ${
            locked ? 'text-slate-400 cursor-not-allowed' : hasValue ? 'text-teal-700' : 'text-slate-700'
          }`}
        />
        <span className={`w-px h-3.5 flex-shrink-0 ${hasValue && !locked ? 'bg-teal-200' : 'bg-slate-200'}`} />
        <button
          type="button"
          onClick={() => !locked && setOpen(o => !o)}
          disabled={locked}
          className={`flex items-center gap-0.5 text-xs font-medium ${
            locked ? 'text-slate-400 cursor-not-allowed' : hasValue ? 'text-teal-700' : 'text-slate-600 hover:text-teal-600'
          }`}
        >
          {unit}
          <ChevronDown className={`w-2.5 h-2.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open && (
        <div ref={dropdownRef} style={dropdownStyle} className="w-28 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden text-left">
          {units.map(u => (
            <button
              key={u}
              type="button"
              onClick={() => { onUnitChange(u); setOpen(false); }}
              className={`w-full text-left px-2.5 py-1.5 text-xs transition-colors ${
                u === unit ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

interface FilterDropdownChipProps {
  section: FilterSection;
  value: string | null;
  onToggleFilter: (filter: string, section?: FilterSection) => void;
  onRemoveFilter: (filter: string) => void;
  locked?: boolean;
  // When set, tapping the chip runs this instead of opening its own dropdown — used on the
  // curated msite row, where a tap should open the full filter drawer, not a one-off popover.
  onChipClick?: () => void;
}

function FilterDropdownChip({ section, value, onToggleFilter, onRemoveFilter, locked = false, onChipClick }: FilterDropdownChipProps) {
  const [open, setOpen] = useState(false);
  const chipRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (
        (chipRef.current && chipRef.current.contains(t)) ||
        (dropdownRef.current && dropdownRef.current.contains(t))
      ) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open && chipRef.current) {
      const rect = chipRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        zIndex: 10000,
      });
    }
  }, [open]);

  const options = section.options;

  function selectOption(opt: string) {
    onToggleFilter(opt, section);
    setOpen(false);
  }

  function clearValue() {
    if (value) onRemoveFilter(value);
    setOpen(false);
  }

  return (
    <>
      <div ref={chipRef} className="relative flex-shrink-0">
        <div
          className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
            locked
              ? 'border-slate-200 bg-slate-200 text-slate-400 cursor-not-allowed'
              : value
              ? `bg-teal-100 text-teal-800 cursor-pointer ${open ? 'border-teal-700' : 'border-teal-600 hover:border-teal-700'}`
              : `border-dashed cursor-pointer ${open ? 'border-teal-400 text-teal-600 bg-teal-50' : 'border-slate-300 text-slate-400 bg-slate-50 hover:border-teal-300 hover:text-teal-600'}`
          }`}
          onClick={() => {
            if (locked) return;
            if (onChipClick) { onChipClick(); return; }
            setOpen(o => !o);
          }}
        >
          {value && <Check className="w-3 h-3 flex-shrink-0" strokeWidth={3} />}
          {value ?? `${section.label}: Any`}
          {!onChipClick && <ChevronDown className={`w-2.5 h-2.5 transition-transform ${open ? 'rotate-180' : ''}`} />}
        </div>
      </div>
      {!onChipClick && open && (
        <div ref={dropdownRef} style={dropdownStyle} className="w-44 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 border-b border-slate-100">
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
              {section.label}
            </span>
            {value && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearValue();
                }}
                aria-label={`Clear ${section.label} filter`}
                title="Clear filter"
                className="flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {options.map(opt => {
              const isActive = value === opt;
              return (
                <button
                  key={opt}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectOption(opt);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                  {isActive && <Check className="w-3 h-3 text-teal-600 flex-shrink-0" />}
                </button>
              );
            })}
            {options.length === 0 && (
              <p className="px-3 py-2 text-xs text-slate-400">No options</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

interface LocationRowProps {
  selectedCity: string;
  setSelectedCity: (v: string) => void;
  cityOpen: boolean;
  setCityOpen: React.Dispatch<React.SetStateAction<boolean>>;
  cityQuery: string;
  setCityQuery: (v: string) => void;
  citySuggestions: string[];
  cityInputRef: React.RefObject<HTMLInputElement>;
  localOnly: boolean;
  setLocalOnly: (v: boolean) => void;
}

function LocationRow({
  selectedCity, setSelectedCity, cityOpen, setCityOpen, cityQuery, setCityQuery,
  citySuggestions, cityInputRef, localOnly, setLocalOnly,
}: LocationRowProps) {
  return (
    <div className="flex-shrink-0 flex items-center gap-2 flex-wrap">
      <div className="relative">
        <button
          onClick={() => setCityOpen(o => !o)}
          title="Sellers will be matched near this location"
          aria-label={`Delivery location: ${selectedCity}. Click to change`}
          className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-teal-400 text-slate-700 text-xs px-2.5 py-1 rounded-full transition-colors"
        >
          <MapPin className="w-3 h-3 text-teal-600" />
          <span className="font-medium">{selectedCity}</span>
          {cityOpen ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
        </button>
        {cityOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="p-2 border-b border-slate-100 flex items-center gap-1.5">
              <input
                ref={cityInputRef}
                type="text"
                value={cityQuery}
                onChange={e => setCityQuery(e.target.value)}
                placeholder="Search city..."
                className="flex-1 min-w-0 text-xs px-2.5 py-1.5 rounded-lg border border-teal-400 outline-none focus:ring-2 focus:ring-teal-100 placeholder-slate-400"
              />
              <button
                type="button"
                onClick={() => setCityOpen(false)}
                aria-label="Close"
                title="Close"
                className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="max-h-52 overflow-y-auto py-1">
              {citySuggestions.map(c => (
                <button
                  key={c}
                  onClick={() => { setSelectedCity(c); setCityOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                    c === selectedCity
                      ? 'bg-teal-50 text-teal-700 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {c}
                </button>
              ))}
              {citySuggestions.length === 0 && (
                <p className="px-3 py-2 text-xs text-slate-400">No cities found</p>
              )}
            </div>
          </div>
        )}
      </div>
      <label
        title={`Show only sellers based in ${selectedCity}`}
        className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer whitespace-nowrap"
      >
        <input
          type="checkbox"
          checked={localOnly}
          onChange={e => setLocalOnly(e.target.checked)}
          className="w-3.5 h-3.5 accent-teal-600 cursor-pointer"
        />
        Local only
      </label>
    </div>
  );
}

interface SpecFilterListProps {
  specsLoading: boolean;
  specsError: string | null;
  specSections: FilterSection[];
  openGroups: string[];
  toggleGroup: (id: string) => void;
  activeFilters: string[];
  toggleFilter: (filter: string, section?: FilterSection) => void;
  quantityValue: string;
  setQuantityValue: (v: string) => void;
  quantityUnit: string;
  setQuantityUnit: (v: string) => void;
  quantityUnits: string[];
  filterShake?: boolean;
}

// The full spec/filter list — shared by the screen-1 refine panel and the mobile
// filter overlay opened from the curated results screen, so both stay in sync.
function SpecFilterList({
  specsLoading, specsError, specSections, openGroups, toggleGroup,
  activeFilters, toggleFilter, quantityValue, setQuantityValue,
  quantityUnit, setQuantityUnit, quantityUnits, filterShake = false,
}: SpecFilterListProps) {
  // Nudges the buyer that more filters sit below the fold — only shown while
  // there's actually unscrolled content left, and fades out once they reach the bottom.
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);

  const updateScrollNudge = () => {
    const el = scrollRef.current;
    if (!el) return;
    setHasMoreBelow(el.scrollHeight - el.scrollTop - el.clientHeight > 12);
  };

  useEffect(() => {
    updateScrollNudge();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScrollNudge);
    ro.observe(el);
    return () => ro.disconnect();
  }, [specSections, openGroups, specsLoading]);

  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
    <div
      ref={scrollRef}
      onScroll={updateScrollNudge}
      className={`flex-1 overflow-y-auto px-3 py-2 space-y-0 ${filterShake ? 'animate-filter-shake' : ''}`}
      style={filterShake ? { animationFillMode: 'both' } : undefined}
    >
      {specsLoading && (
        <div className="flex items-center gap-2 py-2 text-xs text-slate-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Fetching relevant specs...
        </div>
      )}
      {!specsLoading && specsError && (
        <div className="mb-2 px-2.5 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] leading-snug text-amber-800">
          {specsError === 'fetch-failed'
            ? "Couldn't reach the specs service for this product — showing generic filters instead. (Check the browser console/network tab for the failed request.)"
            : "Couldn't find specific filters for this product — showing generic filters instead."}
        </div>
      )}
      {specSections.map(section => {
        const isCollapsible = !section.singleSelect;
        const isOpen = isCollapsible ? openGroups.includes(section.id) : true;
        return (
          <div key={section.id} className="pb-1">
            {isCollapsible ? (
              <button
                onClick={() => toggleGroup(section.id)}
                className="w-full flex items-center justify-between py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                <span>{section.label}</span>
                {isOpen
                  ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            ) : (
              <div className="py-2 text-sm font-medium text-slate-600">
                {section.label}
              </div>
            )}

            {isOpen && (
              section.type === 'quantity' ? (
                <div className="pb-2 flex flex-col gap-1.5">
                  <div className="flex gap-1.5 flex-wrap">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Qty"
                      value={quantityValue}
                      onChange={e => setQuantityValue(e.target.value)}
                      className="w-16 text-xs border border-slate-200 rounded px-1.5 py-1.5 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200 transition-all"
                    />
                    {quantityUnits.map(unit => (
                      <button
                        key={unit}
                        onClick={() => setQuantityUnit(unit)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          quantityUnit === unit
                            ? 'bg-teal-50 border-teal-500 text-teal-700 font-medium'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600'
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>
              ) : section.type === 'checkbox' ? (
                <div className="flex flex-wrap gap-1.5 pb-2">
                  {section.options.map(opt => {
                    const active = activeFilters.includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => toggleFilter(opt, section)}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-all ${
                          active
                            ? 'bg-teal-100 border-teal-600 text-teal-800 font-medium'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600'
                        }`}
                      >
                        {active && <Check className="w-3 h-3 flex-shrink-0" strokeWidth={3} />}
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 pb-2">
                  {section.options.map(opt => {
                    const active = activeFilters.includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => toggleFilter(opt, section)}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all ${
                          active
                            ? 'bg-teal-100 border-teal-600 text-teal-800 font-medium'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600'
                        }`}
                      >
                        {active && <Check className="w-3 h-3 flex-shrink-0" strokeWidth={3} />}
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )
            )}
          </div>
        );
      })}
    </div>
    {hasMoreBelow && (
      <div className="pointer-events-none absolute bottom-0 inset-x-0 flex flex-col items-center">
        <div className="w-full h-8 bg-gradient-to-t from-white md:from-[#fafafa] to-transparent" />
        <div className="relative -mt-5 mb-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm animate-bounce">
          <ChevronDown className="w-3.5 h-3.5 text-teal-600" />
        </div>
      </div>
    )}
    </div>
  );
}

interface ResultsCarouselProps {
  topPicks: SellerCard[];
  nearbySellers: SellerCard[];
  showNearby: boolean;
  setShowNearby: (v: boolean) => void;
  bestMatchId: number | null;
  priceRequestedIds: number[];
  setPriceRequestedIds: React.Dispatch<React.SetStateAction<number[]>>;
  quantityValue: string;
  quantityUnit: string;
  quantityUnits: string[];
  setQuantityValue: (v: string) => void;
  setQuantityUnit: (v: string) => void;
  resultSpecChips: { section: FilterSection; value: string | null }[];
  onToggleFilter: (filter: string, section?: FilterSection) => void;
  onRemoveFilter: (filter: string) => void;
  isFinding: boolean;
  selectedCity: string;
  setSelectedCity: (v: string) => void;
  cityOpen: boolean;
  setCityOpen: React.Dispatch<React.SetStateAction<boolean>>;
  cityQuery: string;
  setCityQuery: (v: string) => void;
  citySuggestions: string[];
  cityInputRef: React.RefObject<HTMLInputElement>;
  localOnly: boolean;
  setLocalOnly: (v: boolean) => void;
  resultsAreStale: boolean;
  onFindBestMatch: () => void;
  onOpenFilters: () => void;
}

const CARDS_PER_PAGE = 4;

// Results feedback ("Are these results useful?") — thumbs-up/down with optional
// one-tap reason chips, captured per tab (Top Picks / Nearby Sellers).
type FeedbackVote = 'up' | 'down';
const FEEDBACK_REASONS: Record<FeedbackVote, [string, string][]> = {
  up: [
    ['nearby', 'Nearby Sellers'],
    ['good_price', 'Good Price'],
    ['availability', 'Product Availability'],
    ['price_qty_match', 'Price & Quantity Matched'],
  ],
  down: [
    ['too_far', 'Located too far'],
    ['high_price', 'High price'],
    ['not_found', 'Product not found'],
    ['no_response', 'No response'],
  ],
};
const FEEDBACK_QUESTION: Record<FeedbackVote, string> = {
  up: 'Tell us what worked',
  down: 'What went wrong?',
};

function ResultsCarousel({
  topPicks, nearbySellers, showNearby, setShowNearby,
  bestMatchId, priceRequestedIds, setPriceRequestedIds,
  quantityValue, quantityUnit, quantityUnits,
  setQuantityValue, setQuantityUnit, resultSpecChips,
  onToggleFilter, onRemoveFilter, isFinding,
  selectedCity, setSelectedCity, cityOpen, setCityOpen, cityQuery, setCityQuery,
  citySuggestions, cityInputRef, localOnly, setLocalOnly,
  resultsAreStale, onFindBestMatch, onOpenFilters,
}: ResultsCarouselProps) {
  const [carouselPage, setCarouselPage] = useState(0);
  const list = showNearby ? nearbySellers : topPicks;
  const totalPages = Math.max(1, Math.ceil(list.length / CARDS_PER_PAGE));
  const pageItems = list.slice(carouselPage * CARDS_PER_PAGE, (carouselPage + 1) * CARDS_PER_PAGE);

  // Reset to first page when switching tabs
  useEffect(() => { setCarouselPage(0); }, [showNearby]);

  // Results feedback — vote is captured per tab (Top Picks / Nearby Sellers); reasons are
  // optional enrichment collected right after the vote (desktop: inline dropdown above the
  // thumbs; mobile: bottom sheet).
  const fbKey: 'top' | 'near' = showNearby ? 'near' : 'top';
  const [fbVote, setFbVote] = useState<Record<'top' | 'near', FeedbackVote | null>>({ top: null, near: null });
  const [fbStep, setFbStep] = useState<FeedbackVote | null>(null);
  const [fbPicked, setFbPicked] = useState<Set<string>>(new Set());
  const [fbNote, setFbNote] = useState('');
  const [fbSheetOpen, setFbSheetOpen] = useState(false);
  const [fbSheetVote, setFbSheetVote] = useState<FeedbackVote | null>(null);
  const fbDone = fbVote[fbKey];

  function logFeedback(vote: FeedbackVote, extra: Record<string, unknown> = {}) {
    // Stand-in for the real tracking call.
    console.log('[feedback]', {
      vote,
      list: showNearby ? 'nearby' : 'top_picks',
      sellers: list.map(s => s.id),
      ...extra,
      ts: Date.now(),
    });
  }

  function toggleFbReason(key: string) {
    setFbPicked(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  function castFeedbackVote(vote: FeedbackVote) {
    setFbPicked(new Set());
    setFbNote('');
    logFeedback(vote, { stage: 'vote' });
  }

  function finishFeedback(vote: FeedbackVote | null, withReasons: boolean) {
    if (!vote) return;
    if (withReasons) logFeedback(vote, { stage: 'reasons', reasons: Array.from(fbPicked), comment: fbNote.trim() });
    setFbVote(prev => ({ ...prev, [fbKey]: vote }));
    setFbStep(null);
    setFbSheetOpen(false);
    setFbPicked(new Set());
    setFbNote('');
  }

  function handleDesktopThumb(vote: FeedbackVote) {
    if (fbStep === vote) return;
    castFeedbackVote(vote);
    setFbStep(vote);
  }

  function handleMobileThumb(vote: FeedbackVote) {
    castFeedbackVote(vote);
    setFbSheetVote(vote);
    setFbSheetOpen(true);
  }

  // Desktop: clicking anywhere outside the open reasons dropdown closes it but keeps the vote
  // already cast (reasons are optional enrichment, not a requirement to register feedback).
  const fbDesktopRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!fbStep) return;
    function handleClickOutside(e: MouseEvent) {
      if (fbDesktopRef.current && fbDesktopRef.current.contains(e.target as Node)) return;
      finishFeedback(fbStep, false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fbStep]);

  function renderFeedbackReasons(vote: FeedbackVote, variant: 'desktop' | 'mobile') {
    const canSubmit = fbPicked.size > 0 || fbNote.trim().length > 0;
    return (
      <>
        <div className={`flex flex-wrap gap-2 ${variant === 'mobile' ? 'mt-3' : 'pt-1'}`}>
          {FEEDBACK_REASONS[vote].map(([key, label]) => {
            const active = fbPicked.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleFbReason(key)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  active
                    ? 'border-teal-600 bg-teal-50 text-teal-700 font-semibold'
                    : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300'
                }`}
              >
                {active && <Check className="w-3 h-3" />}
                {label}
              </button>
            );
          })}
        </div>
        <textarea
          value={fbNote}
          onChange={e => setFbNote(e.target.value)}
          maxLength={300}
          rows={variant === 'mobile' ? 3 : 2}
          placeholder="Share your feedback"
          className="mt-2.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 resize-none"
        />
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => finishFeedback(vote, true)}
          className="mt-2.5 w-full h-9 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-default transition-colors"
        >
          Submit
        </button>
      </>
    );
  }

  function ribbonFor(idx: number): { ribbon?: string; ribbonTone: 'amber' | 'teal' | 'slate' } {
    if (showNearby) {
      const seller = list[carouselPage * CARDS_PER_PAGE + idx];
      const labels = ['Nearest Seller', 'Nearby Seller', 'Nearby Seller', 'Nearby Seller'];
      return { ribbon: labels[idx] ?? undefined, ribbonTone: idx === 0 ? 'teal' : 'slate' };
    }
    if (idx === 0 && carouselPage === 0) return { ribbon: 'Best Overall', ribbonTone: 'amber' };
    const seller = list[carouselPage * CARDS_PER_PAGE + idx];
    const pageStart = carouselPage * CARDS_PER_PAGE;
    const pagePicks = list.slice(pageStart, pageStart + CARDS_PER_PAGE);
    const sameCityCount = pagePicks.filter(s => s.city === seller.city).length;
    if (sameCityCount >= 2) return { ribbon: 'Nearby Seller', ribbonTone: 'teal' };
    return { ribbon: undefined, ribbonTone: 'teal' };
  }

  return (
    <div className="z-20 bg-white flex flex-col rounded-br-xl overflow-y-auto">
      {/* Line 1 — city + nearby-only toggle — msite only; desktop shows these on the header instead */}
      <div className="md:hidden">
        <div className="flex-shrink-0 px-4 pt-3">
          <LocationRow
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            cityOpen={cityOpen}
            setCityOpen={setCityOpen}
            cityQuery={cityQuery}
            setCityQuery={setCityQuery}
            citySuggestions={citySuggestions}
            cityInputRef={cityInputRef}
            localOnly={localOnly}
            setLocalOnly={setLocalOnly}
          />
        </div>

        {/* Soft separator — location is a constraint, specs are refinement; keep them visually distinct */}
        <div className="flex-shrink-0 mx-4 mt-2 border-t border-slate-100" />
      </div>

      {/* Line 2 — quantity + spec chips, with a right-edge fade hinting there's more to scroll.
          Desktop keeps showing every spec (including ones not yet picked); msite shows only the
          ones actually selected, plus a filter chip that opens the full picker as an overlay. */}
      <div className="relative flex-shrink-0 hidden md:block">
        <div className="px-4 pt-3 flex items-center gap-1.5 flex-nowrap overflow-x-auto overflow-y-hidden scrollbar-hide">
          <QuantityChip
            value={quantityValue}
            unit={quantityUnit}
            units={quantityUnits}
            onValueChange={setQuantityValue}
            onUnitChange={setQuantityUnit}
            locked={isFinding}
          />
          {resultSpecChips.map(({ section, value }) => (
            <FilterDropdownChip
              key={section.id}
              section={section}
              value={value}
              onToggleFilter={onToggleFilter}
              onRemoveFilter={onRemoveFilter}
              locked={isFinding}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white to-transparent" />
      </div>

      <div className="flex-shrink-0 md:hidden px-4 pt-2 flex items-center gap-1.5">
        {/* Filter-drawer pill stays pinned to the row's left edge; selected filters scroll on
            their own in the remaining space, so the pill never scrolls out of reach. */}
        <button
          type="button"
          onClick={onOpenFilters}
          disabled={isFinding}
          aria-label={`Filters — ${resultSpecChips.length} available`}
          title="Filters"
          className="flex-shrink-0 flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full border border-teal-600 bg-white text-teal-600 transition-colors hover:border-teal-700 hover:text-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-teal-600 text-white text-[9px] font-bold flex-shrink-0">
            {resultSpecChips.length}
          </span>
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Filters</span>
        </button>
        <div className="relative flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto overflow-y-hidden scrollbar-hide">
            {quantityValue.trim().length > 0 && (
              <QuantityChip
                value={quantityValue}
                unit={quantityUnit}
                units={quantityUnits}
                onValueChange={setQuantityValue}
                onUnitChange={setQuantityUnit}
                locked={isFinding}
              />
            )}
            {resultSpecChips.filter(({ value }) => value !== null).map(({ section, value }) => (
              <FilterDropdownChip
                key={section.id}
                section={section}
                value={value}
                onToggleFilter={onToggleFilter}
                onRemoveFilter={onRemoveFilter}
                locked={isFinding}
                onChipClick={() => value && onRemoveFilter(value)}
              />
            ))}
          </div>
          <div className="pointer-events-none absolute top-0 right-0 h-full w-6 bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>

      {/* Stale-results strip — msite only; desktop shows this above the header instead */}
      {resultsAreStale && !isFinding && (
        <div className="md:hidden flex-shrink-0 flex items-center justify-between gap-3 px-4 py-1.5 bg-amber-50 border-b border-amber-100">
          <span className="flex items-center gap-1.5 text-xs font-medium text-amber-800 min-w-0">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Requirement updated</span>
          </span>
          <button
            type="button"
            onClick={onFindBestMatch}
            className="flex-shrink-0 flex items-center gap-1.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3.5 py-1.5 shadow-sm transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Find Best Match
          </button>
        </div>
      )}

      {/* Line 3 — Top Picks / Nearby Sellers toggle */}
      <div className="flex-shrink-0 px-4 pt-2 pb-2 flex items-center justify-start md:justify-between gap-2">
        <div className="flex items-center rounded-full bg-slate-100 p-0.5 text-xs md:text-[11px] font-semibold">
          <button
            onClick={() => setShowNearby(false)}
            className={`rounded-full px-3 py-1.5 md:px-2.5 md:py-1 border transition-all ${
              !showNearby ? 'border-teal-600 bg-white text-teal-700 shadow-sm' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Top Picks
          </button>
          <button
            onClick={() => setShowNearby(true)}
            className={`rounded-full px-3 py-1.5 md:px-2.5 md:py-1 border transition-all ${
              showNearby ? 'border-teal-600 bg-white text-teal-700 shadow-sm' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Nearby Sellers
          </button>
        </div>

      </div>

      {/* Msite — full list, single column, plain scroll (no pager) */}
      <div className="md:hidden px-3 pb-3 flex-1 overflow-y-auto scrollbar-hide">
        <div className="grid grid-cols-1 gap-3">
          {list.map((seller, idx) => {
            const { ribbon, ribbonTone } = (() => {
              if (showNearby) {
                const labels = ['Nearest Seller', 'Nearby Seller', 'Nearby Seller', 'Nearby Seller'];
                return { ribbon: labels[idx] ?? undefined, ribbonTone: (idx === 0 ? 'teal' : 'slate') as 'teal' | 'slate' };
              }
              if (idx === 0) return { ribbon: 'Best Overall', ribbonTone: 'amber' as const };
              const sameCityCount = list.filter(s => s.city === seller.city).length;
              if (sameCityCount >= 2) return { ribbon: 'Nearby Seller', ribbonTone: 'teal' as const };
              return { ribbon: undefined, ribbonTone: 'teal' as const };
            })();
            return (
              <FinalResultCard
                key={seller.id}
                seller={seller}
                isBestMatch={!showNearby && seller.id === bestMatchId && !!seller.isBestMatch}
                priceRequested={priceRequestedIds.includes(seller.id)}
                onAskPrice={() => setPriceRequestedIds(prev => prev.includes(seller.id) ? prev : [...prev, seller.id])}
                ribbon={ribbon}
                ribbonTone={ribbonTone}
              />
            );
          })}
        </div>

        {/* Results feedback — mobile: thumbs open a bottom sheet with reason chips */}
        {list.length > 0 && (
          <div className="mt-3 flex items-center justify-center gap-3">
            {fbDone ? (
              <span className="text-xs font-semibold text-emerald-600">
                Thanks for your feedback
              </span>
            ) : (
              <>
                <span className="text-xs font-semibold text-slate-600">Are these results useful?</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Yes, useful"
                    onClick={() => handleMobileThumb('up')}
                    className="flex h-8 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-teal-400 hover:text-teal-600"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Not useful"
                    onClick={() => handleMobileThumb('down')}
                    className="flex h-8 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-teal-400 hover:text-teal-600"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Mobile bottom sheet — reasons after a vote; dismissing without submitting keeps the vote */}
        {fbSheetOpen && fbSheetVote && (
          <div className="fixed inset-0 z-[10000]">
            <div className="absolute inset-0 bg-black/40" onClick={() => finishFeedback(fbSheetVote, false)} />
            <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl shadow-2xl p-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
              <div className="flex items-start justify-between gap-3 mb-1">
                <p className="text-sm font-bold text-slate-900">{FEEDBACK_QUESTION[fbSheetVote]}</p>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => finishFeedback(fbSheetVote, false)}
                  className="p-1 -m-1 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {renderFeedbackReasons(fbSheetVote, 'mobile')}
            </div>
          </div>
        )}
      </div>

      {/* Desktop — 4 cards per page, with edge-overlay nav arrows on whichever side has more */}
      <div className="hidden md:block px-3 pb-2 flex-shrink-0">
        <div className="relative">
          {carouselPage > 0 && (
            <button
              onClick={() => setCarouselPage(p => Math.max(0, p - 1))}
              aria-label="Previous sellers"
              title="Previous"
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md border border-slate-200 transition-all hover:bg-white hover:text-teal-700 hover:shadow-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {carouselPage < totalPages - 1 && (
            <button
              onClick={() => setCarouselPage(p => Math.min(totalPages - 1, p + 1))}
              aria-label="More sellers"
              title="Next"
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md border border-slate-200 transition-all hover:bg-white hover:text-teal-700 hover:shadow-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <div
            key={`${showNearby ? 'nearby' : 'toppicks'}-${carouselPage}`}
            className="grid grid-cols-4 gap-2.5 animate-loader-fade-in"
          >
            {pageItems.map((seller, idx) => {
              const { ribbon, ribbonTone } = ribbonFor(idx);
              return (
                <FinalResultCard
                  key={seller.id}
                  seller={seller}
                  isBestMatch={!showNearby && seller.id === bestMatchId && !!seller.isBestMatch}
                  priceRequested={priceRequestedIds.includes(seller.id)}
                  onAskPrice={() => setPriceRequestedIds(prev => prev.includes(seller.id) ? prev : [...prev, seller.id])}
                  ribbon={ribbon}
                  ribbonTone={ribbonTone}
                />
              );
            })}
          </div>
        </div>

        {/* Results feedback — desktop: thumbs open an inline dropdown anchored above them */}
        {list.length > 0 && (
          <div ref={fbDesktopRef} className="relative mt-3 flex items-center justify-center gap-3">
            {fbDone ? (
              <span className="text-xs font-semibold text-emerald-600">
                Thanks for your feedback
              </span>
            ) : (
              <>
                <span className="text-xs font-semibold text-slate-600">Are these results useful?</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Useful"
                    aria-expanded={fbStep === 'up'}
                    onClick={() => handleDesktopThumb('up')}
                    className={`flex h-8 w-9 items-center justify-center rounded-lg border transition-colors ${
                      fbStep === 'up' ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-200 bg-white text-slate-500 hover:border-teal-400 hover:text-teal-600'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Not useful"
                    aria-expanded={fbStep === 'down'}
                    onClick={() => handleDesktopThumb('down')}
                    className={`flex h-8 w-9 items-center justify-center rounded-lg border transition-colors ${
                      fbStep === 'down' ? 'border-slate-600 bg-slate-600 text-white' : 'border-slate-200 bg-white text-slate-500 hover:border-teal-400 hover:text-teal-600'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            {fbStep && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-left z-20">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="text-xs font-semibold text-slate-700">{FEEDBACK_QUESTION[fbStep]}</p>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={() => finishFeedback(fbStep, false)}
                    className="p-1 -m-1 rounded-full hover:bg-slate-100 text-slate-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {renderFeedbackReasons(fbStep, 'desktop')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface FinalResultCardProps {
  seller: SellerCard;
  isBestMatch: boolean;
  priceRequested: boolean;
  onAskPrice: () => void;
  ribbon?: string;
  ribbonTone?: 'amber' | 'teal' | 'slate';
}

function FinalResultCard({ seller, priceRequested, onAskPrice, ribbon, ribbonTone = 'teal' }: FinalResultCardProps) {
  const [ctaStage, setCtaStage] = useState<CtaStage>('idle');
  const [callRevealed, setCallRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const isAskPrice = !!seller.askPrice;

  function advanceCta() {
    if (ctaStage !== 'idle') return;
    if (isAskPrice) onAskPrice();
    setCtaStage('confirmed');
    setTimeout(() => setCtaStage('chat'), 1400);
  }

  function handleCollapsedEnquiryClick() {
    if (isAskPrice) onAskPrice();
    setCallRevealed(false);
    setCtaStage('chat');
  }

  function handleCopyPhone(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (seller.phone) {
      navigator.clipboard.writeText(seller.phone).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    }
  }

  return (
    <div className="flex flex-row md:flex-col gap-3 md:gap-0 rounded-xl border border-slate-200 bg-white overflow-hidden p-3 md:p-0">
      {/* Photo — fixed thumbnail on msite, full-width square on desktop */}
      <div className="relative w-28 h-28 md:w-full md:h-auto md:aspect-square overflow-hidden bg-slate-100 rounded-lg md:rounded-none flex-shrink-0">
        <img
          src={seller.image}
          alt={seller.name}
          className="w-full h-full object-cover"
        />
        {ribbon && (
          <div className={`absolute top-0 left-0 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm ${
            ribbonTone === 'amber' ? 'bg-gradient-to-r from-amber-500 to-amber-600'
            : ribbonTone === 'slate' ? 'bg-gradient-to-r from-slate-600 to-slate-700'
            : 'bg-gradient-to-r from-teal-500 to-teal-600'
          }`}>
            {ribbon}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0 md:p-3">
        {/* Product name */}
        <p className="text-sm font-bold text-slate-900 leading-tight line-clamp-1">{seller.name}</p>

        {/* Price + location */}
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-sm font-bold text-teal-700">{seller.price}{seller.priceUnit}</span>
          <span className="flex items-center gap-0.5 text-[10px] text-slate-500 truncate">
            <MapPin className="w-2.5 h-2.5 flex-shrink-0" />{seller.city}
          </span>
        </div>

        {/* TrustSEAL line */}
        <div className="flex items-center gap-1 flex-wrap">
          {seller.hasTrustSEAL && (
            <span className="flex items-center gap-0.5 text-[9px] font-medium text-slate-600">
              <TrustSealIcon /> TrustSEAL
            </span>
          )}
          {seller.hasTrustSEAL && seller.hasPayProtected && (
            <span className="flex items-center gap-0.5 text-[9px] font-medium text-slate-600">
              <ShieldCheck className="w-2.5 h-2.5 text-blue-600" /> Payment Protected
            </span>
          )}
          {!seller.hasTrustSEAL && seller.hasGST && (
            <span className="flex items-center gap-0.5 text-[9px] font-medium text-slate-600">
              <GstIcon /> GST Verified
            </span>
          )}
        </div>

        {/* Tenure + rating */}
        <div className="flex items-center gap-1">
          <User className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
          <span className="text-[10px] text-slate-500">{Math.round(seller.years)} yrs</span>
          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
          <span className="text-[10px] font-semibold text-slate-800">{seller.rating}<span className="text-slate-400 font-normal">({seller.reviews})</span></span>
        </div>

        {/* Why this seller — set apart from the metadata row above as a distinct reason chip */}
        {seller.matchHighlight && (() => {
          const label = formatMatchHighlight(seller.matchHighlight);
          if (!label) return null;
          const HighlightIcon = highlightIcon(seller.matchHighlight);
          return (
            <p className="inline-flex items-center gap-1 self-start text-[10px] font-medium mt-0.5 text-slate-600">
              <HighlightIcon className="w-2.5 h-2.5 flex-shrink-0" strokeWidth={2.5} />
              {label}
            </p>
          );
        })()}

        {/* CTAs */}
        <div className="flex items-center gap-1.5 mt-auto pt-1.5">
          <button
            type="button"
            onClick={callRevealed ? handleCollapsedEnquiryClick : advanceCta}
            className={`relative overflow-hidden rounded-lg py-1.5 text-[11px] font-semibold text-white transition-all duration-300 ${
              callRevealed ? 'flex-none px-2' : 'flex-1 px-2'
            } ${ctaStage === 'chat' ? 'bg-slate-900 hover:bg-slate-800' : ctaStage === 'confirmed' ? 'bg-emerald-600 cursor-default' : 'bg-teal-600 hover:bg-teal-700'}`}
          >
            <span className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-200 ${ctaStage === 'idle' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
              {callRevealed ? <><Send className="w-3 h-3 flex-shrink-0" />Enquiry</> : 'Send Enquiry'}
            </span>
            <span className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-200 ${ctaStage === 'confirmed' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
              <Check className="w-3 h-3 flex-shrink-0" strokeWidth={3} />{isAskPrice ? 'Requested' : 'Sent'}
            </span>
            <span className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-200 ${ctaStage === 'chat' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
              Chat Now
            </span>
            <span className="invisible flex items-center gap-1"><Send className="w-3 h-3" />Enquiry</span>
          </button>
          <button
            type="button"
            onClick={callRevealed ? handleCopyPhone : () => setCallRevealed(true)}
            className={`relative overflow-hidden flex-1 min-w-0 flex items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-semibold transition-all duration-300 ${
              callRevealed
                ? `text-white ${copied ? 'bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'}`
                : 'border border-emerald-500 text-emerald-600 hover:bg-emerald-50'
            }`}
            title="Call seller"
          >
            <span className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-200 ${!callRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
              <Phone className="w-3 h-3 text-emerald-600" />Call Now
            </span>
            <span className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-200 ${callRevealed && !copied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
              <Phone className="w-3 h-3 flex-shrink-0 text-white" /><span className="truncate">{seller.phone}</span>
            </span>
            <span className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-200 ${copied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
              <Check className="w-3 h-3 flex-shrink-0" strokeWidth={3} />Copied!
            </span>
            <span className="invisible flex items-center gap-1"><Phone className="w-3 h-3" />placeholder</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function GstIcon() {
  return (
    <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-green-500 flex-shrink-0">
      <Check className="w-2 h-2 text-white" strokeWidth={3} />
    </span>
  );
}

function TrustSealIcon() {
  return (
    <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-amber-400 flex-shrink-0">
      <Check className="w-2 h-2 text-red-600" strokeWidth={3} />
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => {
        const filled = rating >= i;
        const half = !filled && rating >= i - 0.5;
        return (
          <span key={i} className="relative inline-block w-2.5 h-2.5">
            <Star className="w-2.5 h-2.5 text-slate-200 fill-slate-200 absolute inset-0" />
            {(filled || half) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? '100%' : '50%' }}
              >
                <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

type CtaStage = 'idle' | 'confirmed' | 'chat';

interface NearestSupplierCardProps {
  seller: SellerCard;
  onAskPrice: () => void;
  hideDistance?: boolean;
}

function NearestSupplierCard({ seller, onAskPrice, hideDistance = false }: NearestSupplierCardProps) {
  const [ctaStage, setCtaStage] = useState<CtaStage>('idle');
  const [callRevealed, setCallRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const isAskPrice = !!seller.askPrice;

  function advanceCta() {
    if (ctaStage !== 'idle') return;
    if (isAskPrice) onAskPrice();
    setCtaStage('confirmed');
    setTimeout(() => setCtaStage('chat'), 1400);
  }

  function revealCall() {
    setCallRevealed(true);
  }

  function handleCollapsedEnquiryClick() {
    if (isAskPrice) onAskPrice();
    setCallRevealed(false);
    setCtaStage('chat');
  }

  function handleCopyPhone(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (seller.phone) {
      navigator.clipboard.writeText(seller.phone).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    }
  }

  return (
    <div className="group relative grid w-full grid-cols-[110px_minmax(0,1fr)] gap-x-2.5 gap-y-1 rounded-xl border border-slate-200 bg-white p-2.5 text-left shadow-sm">
      <img src={seller.image} alt={seller.name} className="row-span-5 w-[110px] h-[110px] rounded-lg object-cover bg-white" />
      <span className="min-w-0 truncate text-xs font-semibold leading-tight text-slate-800">{seller.name}</span>
      <span className="min-w-0 truncate text-[10px] font-bold text-slate-800">{seller.price}{seller.priceUnit}</span>
      <span className="flex min-w-0 items-center gap-0.5 truncate text-[9px] text-slate-500">
        <MapPin className="h-2.5 w-2.5 flex-shrink-0" /> {seller.city}{!hideDistance && (seller.distance === 0 ? ' (in your city)' : ` (${seller.distance} km)`)}
      </span>
      <span className="flex min-w-0 items-center gap-1 overflow-hidden whitespace-nowrap">
        {seller.hasTrustSEAL && <span className="flex items-center gap-0.5 text-[9px] font-medium text-slate-600"><TrustSealIcon /> TrustSEAL</span>}
        {seller.hasTrustSEAL && seller.hasPayProtected && <span className="flex items-center gap-0.5 text-[9px] font-medium text-slate-600"><ShieldCheck className="h-2.5 w-2.5 text-blue-600" /> Payment Protected</span>}
      </span>
      <span className="flex min-w-0 items-center gap-1 truncate text-[9px] text-slate-500">
        <User className="h-2.5 w-2.5 flex-shrink-0" /> 5 yrs
        <StarRating rating={seller.rating} />
        <span className="font-semibold text-slate-800">{seller.rating}</span>
        <span className="text-slate-400">({seller.reviews})</span>
      </span>
      <span className="col-span-2 flex min-w-0 items-center gap-1 pt-0.5">
        {/* Enquiry button — always mounted, width transitions smoothly */}
        <button
          type="button"
          onClick={callRevealed ? handleCollapsedEnquiryClick : advanceCta}
          className={`relative overflow-hidden rounded-md py-1 text-[10px] font-semibold text-white transition-all duration-300 ${
            callRevealed ? 'flex-none px-1.5' : 'flex-1 px-1.5'
          } ${ctaStage === 'chat' ? 'bg-slate-900 hover:bg-slate-800' : ctaStage === 'confirmed' ? 'bg-emerald-600 cursor-default' : 'bg-teal-600 hover:bg-teal-700'}`}
        >
          <span className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-200 ${ctaStage === 'idle' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
            {callRevealed ? <><Send className="h-2.5 w-2.5 flex-shrink-0" />Enquiry</> : 'Send Enquiry'}
          </span>
          <span className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-200 ${ctaStage === 'confirmed' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
            <Check className="h-2.5 w-2.5 flex-shrink-0" strokeWidth={3} />{isAskPrice ? 'Requested' : 'Sent'}
          </span>
          <span className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-200 ${ctaStage === 'chat' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
            Chat Now
          </span>
          <span className="invisible flex items-center gap-1"><Send className="h-2.5 w-2.5" />Enquiry</span>
        </button>
        {/* Second button — Call Now / Phone number, always mounted, cross-fades */}
        <button
          type="button"
          onClick={callRevealed ? handleCopyPhone : revealCall}
          className={`relative overflow-hidden flex-1 min-w-0 flex items-center justify-center gap-1 rounded-md py-1 text-[10px] font-semibold transition-all duration-300 ${
            callRevealed
              ? `text-white ${copied ? 'bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'}`
              : 'border border-emerald-500 text-emerald-600 hover:bg-emerald-50'
          }`}
          title="Call seller"
        >
          <span className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-200 ${!callRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
            <Phone className="h-2.5 w-2.5 text-emerald-600" />Call Now
          </span>
          <span className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-200 ${callRevealed && !copied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
            <Phone className="h-2.5 w-2.5 flex-shrink-0 text-white" /><span className="truncate">{seller.phone}</span>
          </span>
          <span className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-200 ${copied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
            <Check className="h-2.5 w-2.5 flex-shrink-0" strokeWidth={3} />Copied!
          </span>
          <span className="invisible flex items-center gap-1"><Phone className="h-2.5 w-2.5" />placeholder</span>
        </button>
      </span>
    </div>
  );
}

function SellerCardItem({ seller, isFavourite, isBestMatch, onToggleFavourite, priceRequested, onAskPrice, variant = 'default' }: SellerCardItemProps) {
  const [ctaStage, setCtaStage] = useState<CtaStage>('idle');
  const [callRevealed, setCallRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const isAskPrice = !!seller.askPrice;

  function advanceCta() {
    if (ctaStage === 'idle') {
      if (isAskPrice) onAskPrice?.();
      setCtaStage('confirmed');
      setTimeout(() => setCtaStage('chat'), 1400);
    }
  }

  function handleCollapsedEnquiryClick() {
    if (isAskPrice) onAskPrice?.();
    // Collapse the phone row and skip straight to chat — avoids layout reflow
    // from the confirmed intermediate state expanding the button to full width
    setCallRevealed(false);
    setCtaStage('chat');
  }

  function handleCopyPhone(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (seller.phone) {
      navigator.clipboard.writeText(seller.phone).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    }
  }
  return (
    <div className={`cursor-pointer overflow-hidden rounded-xl border flex flex-col bg-white h-full ${
      variant === 'curated'
        ? 'border-amber-400'
        : 'border-slate-100'
    }`}>
      {/* Image — 5:4 ratio gives natural product card feel without excess white */}
      <div
        className={`relative w-full overflow-hidden bg-slate-100 flex-shrink-0 ${variant === 'curated' ? 'aspect-[4/3]' : ''}`}
        style={variant === 'curated' ? undefined : { height: '50%' }}
      >
        <img
          src={seller.image}
          alt={seller.name}
          className="w-full h-full object-contain bg-white"
        />
        {/* Price chip — always top-left */}
        <div className="absolute top-1.5 left-1.5">
          {isAskPrice ? (
            <button
              onClick={e => { e.stopPropagation(); if (ctaStage === 'idle') advanceCta(); }}
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm backdrop-blur-sm transition-colors ${
                ctaStage !== 'idle'
                  ? 'bg-emerald-500/90 text-white cursor-default'
                  : 'bg-white/90 text-teal-700 hover:bg-teal-600 hover:text-white'
              }`}
            >
              {ctaStage === 'chat' ? 'Chat Now' : ctaStage === 'confirmed' ? 'Price Requested' : 'Ask Price'}
            </button>
          ) : (
            <span className={`bg-white/90 backdrop-blur-sm text-slate-800 ${variant === 'curated' ? 'text-sm px-2.5 py-1' : 'text-[9px] px-1.5 py-0.5'} font-bold rounded-full shadow-sm`}>
              {seller.price}
            </span>
          )}
        </div>
        {/* Heart — always top-right */}
        <button
          onClick={e => { e.stopPropagation(); onToggleFavourite(); }}
          className={`absolute top-2 right-2 ${variant === 'curated' ? 'w-7 h-7 bg-white/90' : 'w-5 h-5 bg-white/20'} rounded-full backdrop-blur-sm flex items-center justify-center hover:bg-white/80 transition-colors`}
        >
          <Heart className={`${variant === 'curated' ? 'w-3.5 h-3.5' : 'w-3 h-3'} ${isFavourite ? 'fill-red-500 text-red-500' : variant === 'curated' ? 'text-slate-500' : 'text-white drop-shadow'}`} />
        </button>
        {/* Best match chip — bottom-left */}
        {isBestMatch && (
          <div className="absolute bottom-1.5 left-1.5">
            <span className="flex items-center gap-0.5 bg-white/95 text-slate-800 text-[9px] font-semibold px-1.5 py-0.5 rounded-full shadow-sm">
              <Star className="w-2 h-2 fill-amber-400 text-amber-400" /> Best match
            </span>
          </div>
        )}
      </div>

      {/* Text zone — tight content-driven layout */}
      <div className={`flex flex-col gap-1 ${variant === 'curated' ? 'px-3 pt-2.5 pb-3' : 'px-2 pt-1.5 pb-2'}`}>
        {/* Line 1: company name */}
        <div className="flex items-start gap-1">
          <p className={`${variant === 'curated' ? 'text-sm' : 'text-[11px]'} font-semibold text-slate-900 leading-tight line-clamp-1 flex-1`}>{seller.name}</p>
        </div>
        {/* Line 2: location */}
        <div className="flex items-center gap-0.5">
          <MapPin className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
          <span className={`${variant === 'curated' ? 'text-xs' : 'text-[10px]'} text-slate-500 truncate`}>{seller.city}</span>
        </div>
        {/* Line 3: trust badges */}
        <div className={`flex items-center ${variant === 'curated' ? 'gap-1' : 'gap-1.5'} flex-wrap`}>
          {seller.hasGST && (
            <span className={`flex items-center gap-0.5 ${variant === 'curated' ? 'text-[9px]' : 'text-[9px]'} text-slate-600 font-medium`}>
              <GstIcon /> GST
            </span>
          )}
          {seller.hasTrustSEAL && (
            <span className={`flex items-center gap-0.5 ${variant === 'curated' ? 'text-[9px]' : 'text-[9px]'} text-slate-600 font-medium`}>
              <TrustSealIcon /> TrustSEAL
            </span>
          )}
          {seller.hasTrustSEAL && seller.hasPayProtected && (
            <span className={`flex items-center gap-0.5 ${variant === 'curated' ? 'text-[9px]' : 'text-[9px]'} text-slate-600 font-medium`}>
              <ShieldCheck className="w-2.5 h-2.5 text-blue-600" /> Payment Protected
            </span>
          )}
          {!seller.hasTrustSEAL && (
            <span className={`flex items-center gap-0.5 ${variant === 'curated' ? 'text-[9px]' : 'text-[9px]'} font-medium text-slate-600`}>
              <ShieldQuestion className="w-2.5 h-2.5 flex-shrink-0" />
              <a href="#" className="no-underline hover:underline underline-offset-1">Check Details</a>
            </span>
          )}
        </div>
        {/* Line 4: years + star rating + score + reviews */}
        <div className="flex items-center gap-1">
          <User className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
          <span className={`${variant === 'curated' ? 'text-[9px]' : 'text-[9px]'} text-slate-500 flex-shrink-0`}>{seller.years} yrs</span>
          <StarRating rating={seller.rating} />
          <span className={`${variant === 'curated' ? 'text-xs' : 'text-[10px]'} font-semibold text-slate-800`}>{seller.rating}</span>
          <span className={`${variant === 'curated' ? 'text-[10px]' : 'text-[9px]'} text-slate-400`}>({seller.reviews})</span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          {/* Enquiry button — always mounted, width transitions smoothly */}
          <button
            onClick={callRevealed ? handleCollapsedEnquiryClick : () => { if (ctaStage === 'idle') advanceCta(); }}
            className={`relative overflow-hidden rounded-md text-white text-[10px] font-semibold py-1 px-1.5 transition-all duration-300 ${
              callRevealed ? 'flex-none' : 'flex-1'
            } ${
              ctaStage === 'chat'
                ? 'bg-slate-900 hover:bg-slate-800'
                : ctaStage === 'confirmed'
                ? 'bg-emerald-600 cursor-default'
                : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {/* idle */}
            <span className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-200 ${ctaStage === 'idle' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
              {callRevealed ? <><Send className="w-2.5 h-2.5 flex-shrink-0" />Enquiry</> : 'Send Enquiry'}
            </span>
            {/* confirmed */}
            <span className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-200 ${ctaStage === 'confirmed' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
              <Check className="w-2.5 h-2.5 flex-shrink-0" strokeWidth={3} />{isAskPrice ? 'Requested' : 'Sent'}
            </span>
            {/* chat */}
            <span className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-200 ${ctaStage === 'chat' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
              Chat Now
            </span>
            {/* invisible spacer keeps height */}
            <span className="invisible flex items-center gap-1"><Send className="w-2.5 h-2.5" />Enquiry</span>
          </button>
          {/* Second button — Call Now / Phone number, always mounted, cross-fades */}
          <button
            onClick={callRevealed ? handleCopyPhone : (e: React.MouseEvent) => { e.stopPropagation(); setCallRevealed(true); }}
            className={`relative overflow-hidden flex-1 min-w-0 flex items-center justify-center gap-1 rounded-md py-1 text-[10px] font-semibold transition-all duration-300 ${
              callRevealed
                ? `text-white ${copied ? 'bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'}`
                : 'border border-emerald-500 text-emerald-600 hover:bg-emerald-50'
            }`}
            title="Call seller"
          >
            {/* Call Now state */}
            <span className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-200 ${!callRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
              <Phone className="w-2.5 h-2.5 text-emerald-600" />Call Now
            </span>
            {/* Phone number state */}
            <span className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-200 ${callRevealed && !copied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
              <Phone className="w-2.5 h-2.5 flex-shrink-0 text-white" /><span className="truncate">{seller.phone}</span>
            </span>
            {/* Copied state */}
            <span className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-200 ${copied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
              <Check className="w-2.5 h-2.5 flex-shrink-0" strokeWidth={3} />Copied!
            </span>
            {/* invisible spacer */}
            <span className="invisible flex items-center gap-1"><Phone className="w-2.5 h-2.5" />placeholder</span>
          </button>
        </div>
      </div>
    </div>
  );
}