// Resolves a free-text product/service name to its mcat (micro-category) id,
// via IndiaMART's internal mcat-suggestion endpoint. Response looks like:
//   {"mcatid":"105916","catid":"171","type":"P"}
export interface McatResult {
  mcatid: string;
  catid: string;
  type: string;
}

export async function fetchMcatId(query: string, signal?: AbortSignal): Promise<McatResult | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const url =
    'https://apps.imimg.com/models/mcatid-suggestion.php' +
    `?search_param=${encodeURIComponent(trimmed)}&modid=MY`;

  const res = await fetch(url, { signal });
  if (!res.ok) return null;

  const raw = await res.text();
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);
    if (data && typeof data === 'object' && data.mcatid) {
      return {
        mcatid: String(data.mcatid),
        catid: String(data.catid ?? ''),
        type: String(data.type ?? ''),
      };
    }
  } catch {
    // fall through
  }
  return null;
}
