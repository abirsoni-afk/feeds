// Windmill curated-seller-search flow: submit a job with the buyer's
// keyword/mcat/city/quantity/specs, then poll for the ranked seller list.
export interface SpecAnswer {
  question: string;
  answer: string;
}

export interface CuratedSearchPayload {
  offer_id: string;
  keyword: string;
  mcat_id: string;
  mcat_name: string;
  buyer_city_id: string;
  buyer_city: string;
  city_id: string;
  city_match: string;
  quantity: string;
  quantity_unit: string;
  specifications: SpecAnswer[];
}

export interface CuratedSeller {
  pns?: string;
  city?: string;
  rank?: number;
  image?: string;
  title?: string;
  cityid?: string | number | null;
  rating?: number | null;
  dist_km?: number;
  glusrid?: string;
  paidurl?: string;
  sources?: string[];
  paid_url?: string;
  seller_id?: string;
  title_url?: string;
  trustseal?: boolean;
  CustTypeWt?: number | string;
  base_score?: number;
  city_match?: boolean;
  final_rank?: number;
  companyname?: string;
  final_score?: number;
  memberSince?: string | null;
  boost_reason?: string;
  gst_verified?: string | boolean;
  rating_count?: number | string | null;
  custtype_name?: string;
  is_local_mcat?: boolean;
  product_match?: number;
  rank_position?: number;
  specs_matched?: number;
  vintage_years?: number;
  original_title?: string;
  gstVerifiedFlag?: string;
  price_formatted?: string;
  supplier_rating?: number | null;
  member_since_str?: string | null;
  pns_success_ratio?: number;
  p2_breakdown?: { bl_mcat_6m?: number; [key: string]: unknown };
}

const CREATE_JOB_URL =
  'https://buyer.indiamart.com/miscreact/ajaxrequest/buyermy/curatedsellersearch/windmill';
const JOB_STATUS_URL =
  'https://buyer.indiamart.com/miscreact/ajaxrequest/buyermy/curatedsellersearch/windmill/status';

function extractJobId(raw: unknown): string | null {
  if (!raw) return null;
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const candidate = obj.job_id ?? obj.jobId ?? obj.job ?? obj.id ?? obj.data;
    if (typeof candidate === 'string') return candidate;
    if (candidate && typeof candidate === 'object') return extractJobId(candidate);
  }
  return null;
}

export async function createCuratedSearchJob(
  payload: CuratedSearchPayload,
  signal?: AbortSignal
): Promise<string | null> {
  const res = await fetch(CREATE_JOB_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) return null;

  const raw = await res.text();
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);
    return extractJobId(data);
  } catch {
    return null;
  }
}

export type JobStatusResult =
  | { status: 'pending' }
  | { status: 'done'; sellers: CuratedSeller[] }
  | { status: 'error' };

function extractSellerList(raw: unknown): CuratedSeller[] | null {
  if (Array.isArray(raw)) return raw as CuratedSeller[];
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    // Observed real shape: { completed, success, result: { final_ranked_sellers: [...] } }
    for (const key of [
      'final_ranked_sellers',
      'ranked_sellers',
      'data',
      'result',
      'results',
      'sellers',
      'cards',
      'items',
    ]) {
      const val = obj[key];
      if (Array.isArray(val)) return val as CuratedSeller[];
      // The seller list can be nested one or more levels deeper, e.g.
      // obj.result.final_ranked_sellers.
      if (val && typeof val === 'object') {
        const nested = extractSellerList(val);
        if (nested) return nested;
      }
    }
  }
  return null;
}

function extractStatusFlag(raw: unknown): string | null {
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    // Explicit "success": false is a definite failure signal.
    if (obj.success === false) return 'error';
    const status = obj.status ?? obj.job_status ?? obj.state;
    if (typeof status === 'string') return status.toLowerCase();
  }
  return null;
}

export async function fetchCuratedSearchStatus(
  jobId: string,
  signal?: AbortSignal
): Promise<JobStatusResult> {
  const res = await fetch(JOB_STATUS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId }),
    signal,
  });
  if (!res.ok) return { status: 'error' };

  const raw = await res.text();
  if (!raw) return { status: 'pending' };

  try {
    const data = JSON.parse(raw);
    const obj = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;

    // "completed": true is the authoritative signal to stop polling —
    // use whatever seller data came back (even an empty list) at that point.
    if (obj.completed === true) {
      return { status: 'done', sellers: extractSellerList(data) ?? [] };
    }

    const sellers = extractSellerList(data);
    if (sellers && sellers.length > 0) return { status: 'done', sellers };

    const flag = extractStatusFlag(data);
    if (flag && ['failed', 'error', 'cancelled'].includes(flag)) return { status: 'error' };

    // Empty/ambiguous response — treat as "still processing" and let the
    // caller poll again, up to its own retry budget.
    return { status: 'pending' };
  } catch {
    return { status: 'error' };
  }
}
