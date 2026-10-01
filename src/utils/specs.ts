// Fetches the ISQ (Item Specific Questions) spec panel for a resolved mcat id,
// via IndiaMART's internal GetIsq endpoint, and normalizes the response into a
// flat list of spec groups with their option pills.
//
// The raw shape (observed sample):
//   { "CODE":"200", "STATUS":"1", "DATA": [ [ {..spec..}, {..spec..} ], {..spec..}, ... ], "MESSAGE":"SUCCESS" }
// DATA's elements can be either a single spec object or an array of spec
// objects grouped together — this flattens one level so every entry is a
// single spec. Multi-value fields (options desc/id/status/etc.) are pipe
// ("##") separated and split into parallel arrays here.

export interface SpecOption {
  id: string;
  label: string;
}

export interface SpecGroup {
  id: string;
  label: string;
  /** IM_SPEC_MASTER_TYPE: 1 = free-entry (e.g. Quantity, no option pills), 2/3 = pill options */
  type: string;
  options: SpecOption[];
}

interface RawSpec {
  IM_SPEC_MASTER_ID: string;
  IM_SPEC_MASTER_DESC: string;
  IM_SPEC_MASTER_TYPE: string;
  IM_SPEC_OPTIONS_DESC: string;
  IM_SPEC_OPTIONS_ID: string;
}

export async function fetchSpecs(mcatid: string, signal?: AbortSignal): Promise<SpecGroup[]> {
  if (!mcatid) return [];

  const url =
    'https://apps.imimg.com/index.php' +
    `?r=Newreqform/GetIsq&modid=MY&mcatid=${encodeURIComponent(mcatid)}` +
    '&cat_type=3&flag=1&isq_format=1&generic_flag=1&country_iso=IN';

  const res = await fetch(url, { signal });
  if (!res.ok) return [];

  const raw = await res.text();
  if (!raw) return [];

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }

  const obj = data as { DATA?: unknown };
  if (!obj || !Array.isArray(obj.DATA)) return [];

  const flat: RawSpec[] = obj.DATA.flatMap((item) => (Array.isArray(item) ? item : [item]));

  return flat
    .filter((spec) => spec && spec.IM_SPEC_MASTER_ID)
    .map((spec) => {
      const descRaw = spec.IM_SPEC_OPTIONS_DESC ?? '';
      const idsRaw = spec.IM_SPEC_OPTIONS_ID ?? '';
      const hasOptions = descRaw && descRaw !== 'None';

      const labels = hasOptions ? descRaw.split('##') : [];
      const ids = hasOptions ? idsRaw.split('##') : [];

      const options: SpecOption[] = labels.map((label, i) => ({
        id: ids[i] ?? label,
        label,
      }));

      return {
        id: spec.IM_SPEC_MASTER_ID,
        label: spec.IM_SPEC_MASTER_DESC,
        type: spec.IM_SPEC_MASTER_TYPE,
        options,
      };
    });
}
