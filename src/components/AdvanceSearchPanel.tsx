import { forwardRef, useEffect, useImperativeHandle, useRef, useState, Ref } from 'react';
import {
  Loader2, Search, Sparkles, ShieldCheck, MapPin, Trophy,
  Building2, Phone, Star, BadgeCheck, Check, ChevronLeft, ChevronRight, ChevronDown,
  ThumbsUp, ThumbsDown, X as XIcon,
} from 'lucide-react';
import { SpecOption } from '../utils/specs';
import SuggestSearchInput from './SuggestSearchInput';
import { fetchMcatId } from '../utils/mcat';
import { fetchSpecs, SpecGroup } from '../utils/specs';
import {
  createCuratedSearchJob,
  fetchCuratedSearchStatus,
  CuratedSeller,
  SpecAnswer,
} from '../utils/curatedSearch';

export interface AdvanceSearchPanelHandle {
  reset: () => void;
}

interface AdvanceSearchPanelProps {
  autoFocus?: boolean;
  theme?: 'teal' | 'gray';
  onClose?: () => void;
  /** Fires with a one-line status ("Finding the best sellers for X, matching")
   *  once a search is underway, and null when back at the idle form — so a
   *  host bar (e.g. the "Looking to buy something?" nudge) can show this
   *  instead of its own idle copy, rather than displaying both at once. */
  onStatusTextChange?: (text: string | null) => void;
  /** When the host renders the status line itself (via onStatusTextChange),
   *  set this to skip the panel's own copy of that line so it isn't shown
   *  twice. The spec chips below it still render either way. */
  hideStatusText?: boolean;
}

type Stage = 'form' | 'loading' | 'results' | 'error';

const LOADER_STAGES = [
  { label: 'Finding relevant sellers', icon: Search },
  { label: 'Matching your requirement', icon: Sparkles },
  { label: 'Verifying seller details', icon: ShieldCheck },
  { label: 'Finding sellers near you', icon: MapPin },
  { label: 'Preparing your best matches', icon: Trophy },
];

// Product photo cube — plain white, no colored backdrop.

// Polling schedule for the windmill job: 5s, then 10s, then 20s, then
// every 20s after that, up to a generous attempt budget.
const POLL_DELAYS_MS = [5000, 10000, 20000];
const MAX_POLL_ATTEMPTS = 10;

function pollDelayFor(attempt: number): number {
  return POLL_DELAYS_MS[attempt] ?? POLL_DELAYS_MS[POLL_DELAYS_MS.length - 1];
}

function ScanMiniScene() {
  return (
    <div className="relative w-full h-full flex items-center justify-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="relative w-10 h-8 rounded-md border border-teal-200 bg-white overflow-hidden">
          <div className="absolute inset-x-1 top-1.5 h-1 rounded-full bg-slate-100" />
          <div className="absolute inset-x-1 top-3.5 h-1 rounded-full bg-slate-100 w-2/3" />
        </div>
      ))}
      <div
        className="absolute inset-y-0 w-6 bg-gradient-to-r from-transparent via-teal-300/50 to-transparent"
        style={{ animation: 'loader-scan-sweep 1.8s ease-in-out infinite' }}
      />
    </div>
  );
}

function MatchMiniScene({ query, chips }: { query: string; chips: string[] }) {
  const shown = chips.slice(0, 3);
  const extra = chips.length - shown.length;
  const tags = query ? [query, ...shown] : shown;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center gap-1.5 px-2">
      <div className="flex flex-wrap items-center justify-center gap-1">
        {tags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className={`px-1.5 py-0.5 rounded-full border text-[9px] font-medium whitespace-nowrap ${
              i === 0
                ? 'border-teal-300 bg-white text-slate-700'
                : 'border-teal-200 bg-teal-50 text-teal-700'
            }`}
          >
            {tag}
          </span>
        ))}
        {extra > 0 && (
          <span className="px-1.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[9px] font-medium text-teal-700">
            +{extra}
          </span>
        )}
      </div>
      <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center animate-loader-glow">
        <Check className="w-3 h-3 text-white" strokeWidth={3} />
      </div>
    </div>
  );
}

function TrustMiniScene() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-10 h-10 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-300 animate-loader-glow" />
        <ShieldCheck className="w-6 h-6 text-emerald-500" />
      </div>
    </div>
  );
}

function ProximityMiniScene({ city }: { city: string }) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center gap-1">
      <div className="relative w-6 h-6 flex items-center justify-center">
        <span className="absolute w-6 h-6 rounded-full bg-teal-300/40 animate-loader-glow" />
        <MapPin className="w-4 h-4 text-teal-600 animate-loader-float-dot" />
      </div>
      <span className="text-[10px] font-medium text-slate-500 truncate max-w-[100px]">{city || 'Near you'}</span>
    </div>
  );
}

function RankMiniScene() {
  return (
    <div className="relative w-full h-full flex items-center justify-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-3 rounded-t-sm bg-gradient-to-t from-teal-500 to-emerald-400 animate-loader-bar-grow"
          style={{ height: `${28 - i * 6}px`, animationDelay: `${i * 0.12}s` }}
        />
      ))}
      <Trophy className="w-4 h-4 text-amber-500 ml-1 animate-loader-icon-bounce" />
    </div>
  );
}

function renderMiniScene(idx: number, query: string, city: string, chips: string[]) {
  switch (idx) {
    case 0: return <ScanMiniScene />;
    case 1: return <MatchMiniScene query={query} chips={chips} />;
    case 2: return <TrustMiniScene />;
    case 3: return <ProximityMiniScene city={city} />;
    default: return <RankMiniScene />;
  }
}

// A single editable filter chip for the results screen — shows the current
// value (or "+ Spec name" when nothing is picked yet) and opens a small
// options list on click so buyers can change or add a filter in place.
function FilterDropdown({
  label,
  options,
  valueId,
  theme,
  disabled = false,
  onSelect,
}: {
  label: string;
  options: SpecOption[];
  valueId: string;
  theme: 'teal' | 'gray';
  disabled?: boolean;
  onSelect: (optionId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.id === valueId);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filledClass = theme === 'teal' ? 'bg-teal-600 text-white' : 'bg-[#1d8480] text-white';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
          current ? filledClass : 'bg-white border border-dashed border-slate-300 text-slate-500 hover:border-teal-400'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {current ? `${label}: ${current.label}` : `+ ${label}`}
        <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 top-full mt-1 min-w-[140px] bg-white border border-slate-200 rounded-lg shadow-xl z-20 max-h-56 overflow-y-auto scrollbar-thin">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setOpen(false);
                onSelect(opt.id);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs whitespace-nowrap transition-colors ${
                opt.id === valueId ? 'text-teal-700 font-semibold bg-teal-50' : 'text-slate-700 hover:bg-teal-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AdvanceSearchPanel(
  { autoFocus = false, theme = 'teal', onClose, onStatusTextChange, hideStatusText = false }: AdvanceSearchPanelProps,
  ref: Ref<AdvanceSearchPanelHandle>
) {
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [specs, setSpecs] = useState<SpecGroup[] | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantityValues, setQuantityValues] = useState<Record<string, string>>({});
  const [unitSpecId, setUnitSpecId] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [justSwitched, setJustSwitched] = useState(false);
  const [error, setError] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const [lastCity, setLastCity] = useState('Noida');
  const [mcatId, setMcatId] = useState('');

  const [stage, setStage] = useState<Stage>('form');
  const [loaderStageIdx, setLoaderStageIdx] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [sellers, setSellers] = useState<CuratedSeller[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Results feedback (thumbs up / down)
  const FEEDBACK_DISPOSITIONS = [
    'Wrong category',
    'Prices too high',
    'Not enough sellers',
    'Sellers located too far',
    "Didn't match my requirement",
  ];
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedDispositions, setSelectedDispositions] = useState<string[]>([]);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const snackbarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSnackbar = (message: string) => {
    if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
    setSnackbarMessage(message);
    snackbarTimerRef.current = setTimeout(() => setSnackbarMessage(null), 2500);
  };

  useEffect(() => {
    return () => {
      if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
    };
  }, []);

  const handleThumbsUp = () => {
    if (feedbackGiven) return;
    setFeedbackGiven('up');
    showSnackbar('Thanks for your feedback');
  };

  const handleThumbsDown = () => {
    if (feedbackGiven) return;
    setShowFeedbackModal(true);
  };

  const toggleDisposition = (label: string) => {
    setSelectedDispositions((prev) =>
      prev.includes(label) ? prev.filter((d) => d !== label) : [...prev, label]
    );
  };

  const handleFeedbackSubmit = () => {
    // TODO: wire to feedback-capture endpoint with { rating: 'down', dispositions: selectedDispositions, note: feedbackNote, keyword: lastQuery }
    setShowFeedbackModal(false);
    setFeedbackGiven('down');
    setSelectedDispositions([]);
    setFeedbackNote('');
    showSnackbar('Thanks for your feedback');
  };
  const resultsScrollRef = useRef<HTMLDivElement>(null);

  function updateScrollArrows() {
    const el = resultsScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  function scrollResults(dir: 'left' | 'right') {
    const el = resultsScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' });
  }

  const pollAbortRef = useRef<AbortController | null>(null);
  const pollStopRef = useRef(false);
  const submittedRef = useRef<{ selected: Record<string, string>; quantity: Record<string, string> }>({
    selected: {},
    quantity: {},
  });

  async function handleSearch(query: string, city: string) {
    setStage('form');
    setLastQuery(query);
    setLastCity(city);
    setLoadingSpecs(true);
    setError(false);
    setSpecs(null);
    setSelected({});
    setQuantityValues({});
    setUnitSpecId(null);
    setMcatId('');

    try {
      const mcat = await fetchMcatId(query);
      if (!mcat) {
        setError(true);
        return;
      }
      setMcatId(mcat.mcatid);
      const result = await fetchSpecs(mcat.mcatid);
      setSpecs(result);

      // Auto-select the first option for the quantity unit spec.
      const unitSpec = result.find((s) => s.label.trim().toLowerCase().includes('quantity unit'));
      if (unitSpec) {
        setUnitSpecId(unitSpec.id);
        if (unitSpec.options.length > 0) {
          setSelected((prev) => ({ ...prev, [unitSpec.id]: unitSpec.options[0].id }));
        }
      } else {
        setUnitSpecId(null);
      }
    } catch {
      setError(true);
    } finally {
      setLoadingSpecs(false);
    }
  }

  function stopPolling() {
    pollStopRef.current = true;
    pollAbortRef.current?.abort();
  }

  function handleClose() {
    stopPolling();
    setSpecs(null);
    setSelected({});
    setQuantityValues({});
    setUnitSpecId(null);
    setError(false);
    setResetKey((k) => k + 1);
    setStage('form');
    setLastQuery('');
    setMcatId('');
    setSellers([]);
    setFeedbackGiven(null);
    setShowFeedbackModal(false);
    setSelectedDispositions([]);
    setFeedbackNote('');
    onStatusTextChange?.(null);
    onClose?.();
  }

  useImperativeHandle(ref, () => ({ reset: handleClose }));

  // Build the {question, answer} spec list and the quantity/unit fields the
  // windmill job expects. Takes the selection maps explicitly (rather than
  // reading `selected`/`quantityValues` state directly) so a caller that
  // just changed a filter can pass the brand-new values in immediately,
  // without waiting a render for state to catch up.
  function buildSpecAnswers(
    sel: Record<string, string>,
    qty: Record<string, string>
  ): { specifications: SpecAnswer[]; quantity: string; quantityUnit: string } {
    const specifications: SpecAnswer[] = [];
    let quantity = '';
    let quantityUnit = '';

    if (specs) {
      for (let i = 0; i < specs.length; i++) {
        const spec = specs[i];
        const next = specs[i + 1];
        const isQty = spec.label.trim().toLowerCase() === 'quantity';
        const nextIsUnit = next && next.label.trim().toLowerCase().includes('quantity unit');
        if (isQty && nextIsUnit) {
          quantity = qty[spec.id] ?? '';
          const unitOpt = next.options.find((o) => o.id === sel[next.id]);
          quantityUnit = unitOpt?.label ?? '';
          i++;
          continue;
        }
        if (spec.id === unitSpecId) continue;
        const opt = spec.options.find((o) => o.id === sel[spec.id]);
        if (opt) specifications.push({ question: spec.label, answer: opt.label });
      }
    }

    return { specifications, quantity, quantityUnit };
  }

  // sel/qty default to the current state, so the original "Search" / "Find
  // Best Match" CTA can call this with no arguments as before; a results-
  // screen filter edit passes its just-changed values in directly instead.
  async function handleProceed(
    sel: Record<string, string> = selected,
    qty: Record<string, string> = quantityValues
  ) {
    setStage('loading');
    setLoaderStageIdx(0);
    setSellers([]);
    setProgressPercent(4);
    pollStopRef.current = false;
    submittedRef.current = { selected: sel, quantity: qty };
    setFeedbackGiven(null);
    setShowFeedbackModal(false);
    setSelectedDispositions([]);
    setFeedbackNote('');

    const { specifications, quantity, quantityUnit } = buildSpecAnswers(sel, qty);

    const controller = new AbortController();
    pollAbortRef.current = controller;

    try {
      const jobId = await createCuratedSearchJob(
        {
          offer_id: '',
          keyword: lastQuery,
          mcat_id: mcatId,
          mcat_name: lastQuery,
          buyer_city_id: '1',
          buyer_city: lastCity,
          city_id: '70751',
          city_match: 'exact',
          quantity,
          quantity_unit: quantityUnit,
          specifications,
        },
        controller.signal
      );

      if (!jobId) {
        if (!pollStopRef.current) setStage('error');
        return;
      }

      let elapsedMs = 0;
      // Pace the visual estimate against the same schedule we actually poll
      // on, capped short of 100% so it never looks "done" before the job is.
      const ESTIMATED_TOTAL_MS = POLL_DELAYS_MS.reduce((a, b) => a + b, 0) + POLL_DELAYS_MS[POLL_DELAYS_MS.length - 1] * 3;

      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        if (pollStopRef.current) return;

        // Wait before each check — 5s, then 10s, then 20s, then every 20s.
        const delay = pollDelayFor(attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        if (pollStopRef.current) return;

        elapsedMs += delay;
        setProgressPercent(Math.min(94, Math.round((elapsedMs / ESTIMATED_TOTAL_MS) * 100)));

        const result = await fetchCuratedSearchStatus(jobId, controller.signal);
        if (pollStopRef.current) return;

        if (result.status === 'done') {
          const ordered = [...result.sellers].sort((a, b) => {
            const rankA = a.rank ?? a.final_rank ?? a.rank_position ?? Number.MAX_SAFE_INTEGER;
            const rankB = b.rank ?? b.final_rank ?? b.rank_position ?? Number.MAX_SAFE_INTEGER;
            return rankA - rankB;
          });
          setProgressPercent(100);
          setSellers(ordered);
          setStage('results');
          return;
        }
        if (result.status === 'error') {
          setStage('error');
          return;
        }

        setLoaderStageIdx((i) => Math.min(i + 1, LOADER_STAGES.length - 1));
      }

      if (!pollStopRef.current) setStage('error');
    } catch (err) {
      if ((err as { name?: string })?.name !== 'AbortError' && !pollStopRef.current) {
        setStage('error');
      }
    }
  }

  const pillActive = theme === 'teal'
    ? 'bg-teal-600 text-white border-teal-600'
    : 'bg-[#1d8480] text-white border-[#1d8480]';
  const pillInactive = theme === 'teal'
    ? 'bg-white text-slate-700 border-slate-200 hover:border-teal-400'
    : 'bg-white text-gray-700 border-gray-200 hover:border-[#1d8480]';

  const hasSpecSelection = Object.entries(selected).some(
    ([id, value]) => value && id !== unitSpecId
  );

  const prevHasSelectionRef = useRef(false);
  useEffect(() => {
    if (hasSpecSelection && !prevHasSelectionRef.current) {
      setJustSwitched(true);
      const t = setTimeout(() => setJustSwitched(false), 1400);
      prevHasSelectionRef.current = true;
      return () => clearTimeout(t);
    }
    prevHasSelectionRef.current = hasSpecSelection;
  }, [hasSpecSelection]);

  useEffect(() => {
    if (stage !== 'loading') setProgressPercent(0);
  }, [stage]);

  // Cancel any in-flight polling if the component unmounts.
  useEffect(() => () => stopPolling(), []);

  // Recompute the scroll-arrow visibility once results render (layout needs
  // a tick to settle before scrollWidth/clientWidth are accurate).
  useEffect(() => {
    if (stage !== 'results') return;
    const t = setTimeout(updateScrollArrows, 50);
    return () => clearTimeout(t);
  }, [stage, sellers]);

  const specRows: SpecGroup[][] = [];
  if (specs) {
    for (let i = 0; i < specs.length; i++) {
      const current = specs[i];
      const next = specs[i + 1];
      const isQtyPair =
        next &&
        current.label.trim().toLowerCase() === 'quantity' &&
        next.label.trim().toLowerCase().includes('quantity unit');
      if (isQtyPair) {
        specRows.push([current, next]);
        i++;
      } else {
        specRows.push([current]);
      }
    }
  }

  // Build the summary chips shown once the buyer commits to a search, each
  // as "Spec name: value" — quantity (with its unit) first, then every
  // other selected spec option. summaryValues mirrors the same selected-only
  // list but with just the value (no "Spec name:" prefix), for the compact
  // loader illustration where the label would just be noise.
  const summaryChips: string[] = [];
  const summaryValues: string[] = [];
  if (specs) {
    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i];
      const next = specs[i + 1];
      const isQty = spec.label.trim().toLowerCase() === 'quantity';
      const nextIsUnit = next && next.label.trim().toLowerCase().includes('quantity unit');
      if (isQty && nextIsUnit) {
        const qtyVal = quantityValues[spec.id];
        const unitOpt = next.options.find((o) => o.id === selected[next.id]);
        if (qtyVal) {
          const value = `${qtyVal}${unitOpt ? ` ${unitOpt.label}` : ''}`;
          summaryChips.push(`${spec.label}: ${value}`);
          summaryValues.push(value);
        }
        i++;
        continue;
      }
      if (spec.id === unitSpecId) continue;
      const opt = spec.options.find((o) => o.id === selected[spec.id]);
      if (opt) {
        summaryChips.push(`${spec.label}: ${opt.label}`);
        summaryValues.push(opt.label);
      }
    }
  }

  const ActiveLoaderIcon = LOADER_STAGES[loaderStageIdx].icon;

  // True once the buyer has changed a filter on the results screen since
  // the last search actually ran — drives the "stale requirement" banner
  // rather than silently refiring the API on every click.
  const filtersDirty =
    stage === 'results' &&
    (JSON.stringify(selected) !== JSON.stringify(submittedRef.current.selected) ||
      JSON.stringify(quantityValues) !== JSON.stringify(submittedRef.current.quantity));

  // "Top Recommended Sellers" is always capitalized and bold in the JSX
  // version (statusPrefix/statusSuffix wrap it); the plain-text version for
  // the host bar keeps the same capitalization without the styling.
  const statusPrefix = stage === 'results' ? '' : 'Finding the ';
  const statusSuffix = ' for';
  const statusText = lastQuery
    ? `${statusPrefix}Top Recommended Sellers${statusSuffix} ${lastQuery}`
    : null;

  useEffect(() => {
    onStatusTextChange?.(stage === 'form' ? null : statusText);
  }, [stage, statusText]);

  function isGstVerified(seller: CuratedSeller): boolean {
    return seller.gst_verified === '1' || seller.gst_verified === true || seller.gstVerifiedFlag === '1';
  }

  function isTrustSealEligible(seller: CuratedSeller): boolean {
    const wt = Number(seller.CustTypeWt);
    return !Number.isNaN(wt) && wt >= 199;
  }

  // memberSince arrives either as an ISO date string, an already-formatted
  // "9 yrs" / "1 yr" string, or null/empty — handle all three.
  function memberSinceLabel(seller: CuratedSeller): string | null {
    const raw = seller.memberSince || seller.member_since_str;
    if (!raw) return null;
    if (/\byrs?\b/i.test(raw)) return raw;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;
    return `Member since ${d.getFullYear()}`;
  }

  return (
    <div className="relative">
      {stage === 'form' && (
        <>
          <SuggestSearchInput key={resetKey} autoFocus={autoFocus} onSearch={handleSearch} />

          {loadingSpecs && (
            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Fetching relevant questions...
            </div>
          )}

          {!loadingSpecs && error && (
            <p className="mt-3 text-xs text-slate-400">
              Couldn't find matching specs for that — try a more specific product name.
            </p>
          )}

          {!loadingSpecs && specs && specs.length > 0 && (
            <div className="mt-3 space-y-3">
              {specRows.map((row) => {
                const isQtyPair = row.length === 2;
                if (isQtyPair) {
                  const [qtySpec, unitSpec] = row;
                  return (
                    <div key={qtySpec.id}>
                      <p className="text-xs font-semibold text-slate-600 mb-1.5">{qtySpec.label}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={quantityValues[qtySpec.id] ?? ''}
                          onChange={(e) => {
                            const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
                            setQuantityValues((prev) => ({ ...prev, [qtySpec.id]: digitsOnly }));
                          }}
                          placeholder="Enter quantity"
                          className="w-28 h-8 px-2.5 text-xs rounded-md border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                        />
                        {unitSpec.options.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {unitSpec.options.map((opt) => {
                              const isActive = selected[unitSpec.id] === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() =>
                                    setSelected((prev) => ({
                                      ...prev,
                                      [unitSpec.id]: opt.id,
                                    }))
                                  }
                                  className={`px-2.5 py-1 rounded-full border text-xs font-medium whitespace-nowrap transition-colors ${
                                    isActive ? pillActive : pillInactive
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                const spec = row[0];
                return (
                  <div key={spec.id}>
                    <p className="text-xs font-semibold text-slate-600 mb-1.5">{spec.label}</p>
                    {spec.options.length === 0 ? (
                      <input
                        type="text"
                        placeholder={`Enter ${spec.label.toLowerCase()}`}
                        className="w-full sm:w-48 h-8 px-2.5 text-xs rounded-md border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {spec.options.map((opt) => {
                          const isActive = selected[spec.id] === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() =>
                                setSelected((prev) => ({
                                  ...prev,
                                  [spec.id]: isActive ? '' : opt.id,
                                }))
                              }
                              className={`px-2.5 py-1 rounded-full border text-xs font-medium whitespace-nowrap transition-colors ${
                                isActive ? pillActive : pillInactive
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleProceed()}
                  className={`flex items-center justify-center gap-1.5 h-9 px-4 rounded-full text-xs font-semibold text-white transition-all duration-300 ${
                    hasSpecSelection
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 shadow-sm hover:shadow-md hover:brightness-110'
                      : 'bg-teal-600 hover:bg-teal-700'
                  } ${justSwitched ? 'animate-cta-pop' : ''}`}
                >
                  {hasSpecSelection ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Find Best Match
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {(stage === 'loading' || stage === 'error') && (
        <div className="animate-[slideInUp_0.3s_ease-out]">
          {lastQuery && !hideStatusText && (
            <p className="text-xs text-slate-500 mb-1.5">
              {statusPrefix}<b className="font-bold text-slate-700">Top Recommended Sellers</b> for{' '}
              <span className="font-semibold text-slate-800">{lastQuery}</span>
              {summaryChips.length > 0 && <>:</>}
            </p>
          )}
          {summaryChips.length > 0 && (
            // Non-interactive while a search is in flight (or just failed) —
            // filters can only be changed once results are showing.
            <div className="flex flex-wrap items-center gap-1.5">
              {summaryChips.map((chip, i) => (
                <span
                  key={`${chip}-${i}`}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap text-white opacity-70 cursor-not-allowed ${
                    theme === 'teal' ? 'bg-teal-600' : 'bg-[#1d8480]'
                  }`}
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {stage === 'results' && (
        <div className="animate-[slideInUp_0.3s_ease-out]">
          {lastQuery && !hideStatusText && (
            <p className="text-xs text-slate-500 mb-1.5">
              {statusPrefix}<b className="font-bold text-slate-700">Top Recommended Sellers</b> for{' '}
              <span className="font-semibold text-slate-800">{lastQuery}</span>
              {specRows.length > 0 && <>:</>}
            </p>
          )}
          {specRows.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {specRows.map((row) => {
                if (row.length === 2) {
                  const [qtySpec, unitSpec] = row;
                  // Quantity wasn't part of the original requirement (buyer
                  // left it blank in step 1) — don't surface it as a
                  // filter to fill in here.
                  if (!submittedRef.current.quantity[qtySpec.id]) return null;
                  return (
                    <div key={qtySpec.id} className="flex items-center gap-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={quantityValues[qtySpec.id] ?? ''}
                        placeholder={qtySpec.label}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
                          setQuantityValues((prev) => ({ ...prev, [qtySpec.id]: digitsOnly }));
                        }}
                        className="w-16 h-7 px-2 text-xs text-center rounded-full border border-slate-200 bg-white focus:outline-none focus:border-teal-500 transition-colors"
                      />
                      {unitSpec.options.length > 0 && (
                        <FilterDropdown
                          label={unitSpec.label}
                          options={unitSpec.options}
                          valueId={selected[unitSpec.id] ?? ''}
                          theme={theme}
                          onSelect={(id) => setSelected((prev) => ({ ...prev, [unitSpec.id]: id }))}
                        />
                      )}
                    </div>
                  );
                }

                const spec = row[0];
                if (spec.options.length === 0) return null;
                return (
                  <FilterDropdown
                    key={spec.id}
                    label={spec.label}
                    options={spec.options}
                    valueId={selected[spec.id] ?? ''}
                    theme={theme}
                    onSelect={(id) => {
                      setSelected((prev) => ({
                        ...prev,
                        [spec.id]: prev[spec.id] === id ? '' : id,
                      }));
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Filters changed since the last search — nudge the buyer to
              re-run it rather than silently refetching on every click. */}
          {filtersDirty && (
            <div
              className={`mt-2 flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${
                theme === 'teal' ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <span className="text-[11px] text-amber-700 font-medium">
                Requirement updated. Click Find Best Match to see recommended sellers
              </span>
              <button
                type="button"
                onClick={() => handleProceed(selected, quantityValues)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white whitespace-nowrap transition-colors ${
                  theme === 'teal' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-[#1d8480] hover:brightness-110'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Find Best Match
              </button>
            </div>
          )}
        </div>
      )}

      {stage === 'loading' && (
        <div className="mt-4 flex flex-col items-center gap-3 py-3">
          {/* Gamified, illustrated loader — a different mini scene per stage
              (scanning cards, matching chips, a trust shield, a map pin,
              ranked bars) so progress reads visually, not just as text. */}
          <div
            key={loaderStageIdx}
            className={`relative w-full max-w-[220px] h-20 rounded-xl border overflow-hidden animate-[slideInUp_0.3s_ease-out] ${
              theme === 'teal' ? 'bg-gradient-to-br from-teal-50 to-white border-teal-100' : 'bg-gray-50 border-gray-200'
            }`}
          >
            {renderMiniScene(loaderStageIdx, lastQuery, lastCity, summaryValues)}
          </div>

          <div className={`flex items-center gap-1.5 text-xs font-medium ${theme === 'teal' ? 'text-teal-700' : 'text-gray-700'}`}>
            <ActiveLoaderIcon className="w-3.5 h-3.5" key={`icon-${loaderStageIdx}`} />
            <p key={loaderStageIdx} className="animate-[slideInUp_0.3s_ease-out]">
              {LOADER_STAGES[loaderStageIdx].label}...
            </p>
          </div>

          <div className="w-full max-w-xs h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${theme === 'teal' ? 'bg-teal-500' : 'bg-[#1d8480]'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">This usually takes upto 30 seconds</p>
        </div>
      )}

      {stage === 'error' && (
        <p className="mt-3 text-xs text-slate-400">
          Couldn't fetch matching sellers right now — please try again.
        </p>
      )}

      {stage === 'results' && (
        <div className="mt-3 -mx-1 relative">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollResults('left')}
              aria-label="Scroll to previous sellers"
              className="absolute left-0.5 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollResults('right')}
              aria-label="Scroll to more sellers"
              className="absolute right-0.5 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            </button>
          )}
          <div
            ref={resultsScrollRef}
            onScroll={updateScrollArrows}
            className="flex gap-3 overflow-x-auto scrollbar-thin px-1 pb-1 snap-x snap-mandatory"
          >
            {sellers.map((s, idx) => {
              const memberLabel = memberSinceLabel(s);
              const rating = s.supplier_rating ?? s.rating;
              return (
                <div
                  key={s.seller_id ?? s.glusrid ?? idx}
                  className="snap-start shrink-0 w-[225px] rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col animate-[slideInUp_0.35s_ease-out]"
                  style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'backwards' }}
                >
                  <div className="relative w-full aspect-square bg-white flex items-center justify-center overflow-hidden">
                    {(s.rank === 1 || s.final_rank === 1) && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wide z-10">
                        Best Overall
                      </span>
                    )}
                    {s.image ? (
                      <img src={s.image} alt={s.title ?? s.companyname ?? ''} className="w-full h-full object-contain p-2" />
                    ) : (
                      <Building2 className="w-8 h-8 text-slate-400/70" />
                    )}
                  </div>

                  <div className="p-2.5 flex flex-col gap-1">
                    <p className="text-xs font-bold text-slate-900 leading-tight truncate">{s.companyname ?? s.title}</p>
                    {s.price_formatted && (
                      <p className="text-sm font-bold text-teal-700">{s.price_formatted}</p>
                    )}
                    {memberLabel && (
                      <p className="text-[10px] text-slate-400">{memberLabel}</p>
                    )}

                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                      <span className="truncate">{s.city}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 flex-wrap">
                      {isGstVerified(s) && (
                        <span className="flex items-center gap-1">
                          <BadgeCheck className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                          GST
                        </span>
                      )}
                      {isTrustSealEligible(s) && (
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                          TrustSEAL
                        </span>
                      )}
                    </div>

                    {s.trustseal && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <ShieldCheck className="w-2.5 h-2.5 text-sky-500 shrink-0" />
                        Payment Protected
                      </div>
                    )}

                    {typeof rating === 'number' && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <span className="flex items-center gap-0.5 text-amber-500">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span className="text-slate-600">{rating.toFixed(1)}</span>
                        </span>
                        {s.rating_count !== undefined && s.rating_count !== null && (
                          <span className="text-slate-400">({s.rating_count})</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 mt-1">
                      <button className="flex-1 flex items-center justify-center gap-1 h-7 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-semibold transition-colors">
                        Enquiry
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1 h-7 rounded-md border border-slate-200 text-slate-700 hover:border-teal-400 text-[10px] font-semibold transition-colors">
                        <Phone className="w-2.5 h-2.5" />
                        Call Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {stage === 'results' && sellers.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500">Was this helpful?</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleThumbsUp}
              disabled={!!feedbackGiven}
              aria-label="Thumbs up"
              className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
                feedbackGiven === 'up'
                  ? 'bg-teal-600 border-teal-600 text-white'
                  : feedbackGiven
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-slate-200 text-slate-500 hover:border-teal-400 hover:text-teal-600'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleThumbsDown}
              disabled={!!feedbackGiven}
              aria-label="Thumbs down"
              className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
                feedbackGiven === 'down'
                  ? 'bg-slate-700 border-slate-700 text-white'
                  : feedbackGiven
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {showFeedbackModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm rounded-xl p-3">
          <div className="w-full max-w-xs bg-white rounded-xl shadow-lg border border-slate-200 p-4 animate-[slideInUp_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-800">What went wrong?</p>
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Close"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {FEEDBACK_DISPOSITIONS.map((label) => {
                const isActive = selectedDispositions.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleDisposition(label)}
                    className={`px-2.5 py-1 rounded-full border text-xs font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-slate-700 border-slate-700 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <textarea
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="Tell us more (optional)"
              rows={3}
              className="w-full text-xs px-2.5 py-2 rounded-md border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors resize-none mb-3"
            />
            <button
              type="button"
              onClick={handleFeedbackSubmit}
              className="w-full h-8 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {snackbarMessage && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-2 z-50 flex justify-center">
          <div className="px-3.5 py-2 rounded-full bg-slate-800 text-white text-xs font-medium shadow-lg animate-[snackbarIn_0.2s_ease-out]">
            {snackbarMessage}
          </div>
        </div>
      )}
    </div>
  );
}

export default forwardRef(AdvanceSearchPanel);
