import { Search, SlidersHorizontal, ShieldCheck, MapPin, Trophy, Check, Building2, Star, Award, Clock } from 'lucide-react';

const EVAL_STAGES = [
  'Finding relevant sellers',
  'Matching your requirement',
  'Verifying seller details',
  'Finding sellers near you',
  'Preparing your best matches',
];

const STAGE_ICONS = [Search, SlidersHorizontal, ShieldCheck, MapPin, Trophy];

/* ── Stage 0: Scanning sellers — magnifying glass over supplier cards ── */
function ScanScene() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-[290px] h-[175px]">
        {[0, 1, 2, 3, 4, 5].map(i => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          return (
            <div
              key={i}
              className="absolute w-[82px] h-[64px] rounded-lg border border-slate-200 bg-white flex flex-col items-center justify-center gap-1.5"
              style={{ left: `${col * 94 + 8}px`, top: `${row * 73 + 8}px` }}
            >
              <Building2 className="w-6 h-6 text-slate-300" />
              <div className="w-10 h-1.5 rounded-full bg-slate-100" />
              <div className="w-7 h-1.5 rounded-full bg-slate-100" />
            </div>
          );
        })}
        <div
          className="absolute inset-0 overflow-hidden rounded-lg"
          style={{ animation: 'loader-scan-sweep 3s ease-in-out infinite' }}
        >
          <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-teal-200/40 to-transparent" />
        </div>
        {[0, 1, 2, 3, 4, 5].map(i => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          return (
            <div
              key={`check-${i}`}
              className="absolute w-[82px] h-[64px] rounded-lg border-2 border-teal-400 bg-teal-50/80 flex items-center justify-center"
              style={{
                left: `${col * 94 + 8}px`,
                top: `${row * 73 + 8}px`,
                animation: `loader-card-lightup 3s ease-in-out infinite`,
                animationDelay: `${i * 0.45}s`,
              }}
            >
              <Check className="w-6 h-6 text-teal-500" strokeWidth={3} />
            </div>
          );
        })}
        <div
          className="absolute w-12 h-12 rounded-full border-2 border-teal-500 bg-transparent"
          style={{ animation: 'loader-mag-glass 3s ease-in-out infinite' }}
        >
          <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-teal-500" />
        </div>
      </div>
    </div>
  );
}

/* ── Stage 1: Matching specs — requirement doc connecting to suppliers ── */
function MatchScene({ specLabels }: { specLabels: string[] }) {
  const specs = specLabels.length > 0 ? specLabels : ['No specs selected'];
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-[290px] h-[175px]">
        <div className="absolute left-3 top-3 w-[100px] h-[150px] rounded-lg border border-teal-200 bg-white p-2.5 flex flex-col gap-1 shadow-sm overflow-hidden">
          {specs.map((spec, i) => (
            <div key={i} className="flex items-center gap-1">
              <Check className="w-2.5 h-2.5 text-teal-500 flex-shrink-0" strokeWidth={3} />
              <span className="text-[7px] font-semibold text-slate-700 leading-tight line-clamp-2">{spec}</span>
            </div>
          ))}
        </div>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="absolute right-3 w-[76px] rounded-lg border border-slate-200 bg-white p-2 flex items-center gap-1.5"
            style={{ top: `${14 + i * 50}px` }}
          >
            <Building2 className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-1">
              <div className="w-full h-1.5 rounded-full bg-slate-100" />
              <div className="w-2/3 h-1.5 rounded-full bg-slate-100" />
            </div>
          </div>
        ))}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 290 175">
          {[0, 1, 2].map(i => (
            <line
              key={i}
              x1="103" y1="78"
              x2="214"
              y2={34 + i * 50}
              stroke="#14B8A6"
              strokeWidth="2"
              strokeDasharray="5 4"
              style={{ animation: 'loader-line-flow 2.5s ease-in-out infinite', animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </svg>
        {[0, 1, 2].map(i => (
          <div
            key={`check-${i}`}
            className="absolute w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center"
            style={{
              left: '174px',
              top: `${22 + i * 50}px`,
              animation: 'loader-match-pop 2.5s ease-in-out infinite',
              animationDelay: `${i * 0.45 + 0.75}s`,
            }}
          >
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Stage 2: Verifying trust signals — shield with sequential tick badges ── */
function TrustScene() {
  const ticks = [
    { label: 'GST', delay: 0 },
    { label: 'TrustSEAL', delay: 1.4 },
    { label: 'Rating', delay: 2.8 },
  ];
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center gap-2">
      <div className="relative w-[200px] h-[100px] flex items-center justify-center">
        {/* Central shield with pulse rings */}
        <div className="relative z-10">
          <div className="absolute inset-0 rounded-full bg-teal-100/50" style={{ animation: 'loader-shield-ripple 2.5s ease-out infinite' }} />
          <div className="absolute inset-0 rounded-full bg-teal-100/40" style={{ animation: 'loader-shield-ripple 2.5s ease-out infinite', animationDelay: '0.8s' }} />
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/40">
            <ShieldCheck className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
        </div>
        {/* Scanning sweep line */}
        <div className="absolute inset-x-4 top-0 h-full overflow-hidden rounded-full">
          <div
            className="absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-teal-300/25 to-transparent"
            style={{ animation: 'loader-doc-scan 3s ease-in-out infinite' }}
          />
        </div>
      </div>
      {/* Sequential tick badges — only one visible at a time, centre aligned */}
      <div className="relative h-[28px] w-full flex items-center justify-center">
        {ticks.map((tick, i) => (
          <div
            key={i}
            className="absolute flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200 px-2 py-0.5"
            style={{ animation: 'loader-trust-tick 4.2s ease-in-out infinite', animationDelay: `${tick.delay}s` }}
          >
            <Check className="w-3 h-3 text-teal-600" strokeWidth={3} />
            <span className="text-[10px] font-bold text-teal-700">{tick.label}</span>
            {i === 2 && <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Stage 3: Computing proximity — map with pins dropping ── */
function ProximityScene({ locationName }: { locationName: string }) {
  const pins = [
    { x: 44, y: 50, delay: 0 },
    { x: 94, y: 36, delay: 0.45 },
    { x: 72, y: 80, delay: 0.9 },
    { x: 116, y: 72, delay: 1.35 },
    { x: 30, y: 94, delay: 1.8 },
  ];
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-[260px] h-[175px] rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 260 175">
          {[0, 1, 2, 3, 4].map(i => (
            <line key={`h${i}`} x1="0" y1={i * 35 + 10} x2="260" y2={i * 35 + 10} stroke="#E2E8F0" strokeWidth="0.5" />
          ))}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <line key={`v${i}`} x1={i * 43 + 10} y1="0" x2={i * 43 + 10} y2="175" stroke="#E2E8F0" strokeWidth="0.5" />
          ))}
        </svg>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-0.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-teal-500 border-2 border-white shadow-md flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-teal-400" style={{ animation: 'loader-pin-ripple 3s ease-out infinite' }} />
          </div>
          <span className="text-[9px] font-semibold text-teal-700 bg-white/95 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">{locationName}</span>
        </div>
        {pins.map((p, i) => (
          <div key={i}>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 260 175">
              <line
                x1="130" y1="87"
                x2={p.x + 9} y2={p.y + 9}
                stroke="#14B8A6"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                style={{ animation: 'loader-line-flow 3s ease-in-out infinite', animationDelay: `${p.delay}s` }}
              />
            </svg>
            <div
              className="absolute"
              style={{
                left: `${p.x}px`,
                top: `${p.y}px`,
                animation: 'loader-pin-drop 3s ease-in-out infinite',
                animationDelay: `${p.delay}s`,
              }}
            >
              <MapPin className="w-6 h-6 text-teal-600 fill-teal-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Stage 4: Ranking results — leaderboard bars rising into ranked positions ── */
function RankScene() {
  const items = [
    { rank: 1, color: 'bg-gradient-to-br from-amber-300 to-amber-500', medal: 'text-amber-500', bar: 'bg-amber-400', width: '100%', delay: 0 },
    { rank: 2, color: 'bg-gradient-to-br from-slate-300 to-slate-400', medal: 'text-slate-400', bar: 'bg-slate-300', width: '78%', delay: 0.3 },
    { rank: 3, color: 'bg-gradient-to-br from-orange-300 to-orange-400', medal: 'text-orange-400', bar: 'bg-orange-300', width: '60%', delay: 0.6 },
  ];
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-[240px] h-[170px] flex flex-col justify-end gap-2.5 pb-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5"
            style={{ animation: 'loader-rank-slide-in 2.5s ease-out infinite', animationDelay: `${item.delay}s` }}
          >
            <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-[12px] font-bold text-white shadow-sm flex-shrink-0`}>
              {item.rank}
            </div>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 h-7 rounded-lg bg-slate-100 overflow-hidden relative">
                <div
                  className="h-full rounded-lg origin-left"
                  style={{
                    width: item.width,
                    background: i === 0 ? 'linear-gradient(90deg, #FCD34D, #F59E0B)' : i === 1 ? 'linear-gradient(90deg, #CBD5E1, #94A3B8)' : 'linear-gradient(90deg, #FDBA74, #FB923C)',
                    animation: 'loader-bar-grow 2.5s ease-out infinite',
                    animationDelay: `${item.delay}s`,
                  }}
                />
                {i === 0 && (
                  <Trophy className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600" style={{ animation: 'loader-trophy-bounce 1.5s ease-in-out infinite' }} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderStageScene(idx: number, specLabels: string[], locationName: string) {
  switch (idx) {
    case 0: return <ScanScene />;
    case 1: return <MatchScene specLabels={specLabels} />;
    case 2: return <TrustScene />;
    case 3: return <ProximityScene locationName={locationName} />;
    default: return <RankScene />;
  }
}

export { EVAL_STAGES, STAGE_ICONS };

export default function FindingBestMatchLoader({
  evalStage,
  evalDone,
  progress,
  specLabels,
  locationName,
  activeFilters,
}: {
  evalStage: number;
  evalDone: number[];
  progress: number;
  specLabels: string[];
  locationName: string;
  activeFilters: string[];
}) {
  const activeIdx = evalStage >= 0 && evalStage < EVAL_STAGES.length ? evalStage : EVAL_STAGES.length - 1;
  const allDone = evalDone.length >= EVAL_STAGES.length;
  const ActiveIcon = STAGE_ICONS[activeIdx];
  const stageLabel = allDone ? 'Finishing up…' : `${EVAL_STAGES[activeIdx]}…`;

  return (
    <div className="absolute inset-0 z-30 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 px-4 overflow-hidden bg-white">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(13,148,136,0.05) 0%, rgba(255,255,255,1) 65%)' }}
      />

      {/* Product name AND city already show in the modal header on desktop; msite still shows city
          here since it lives in the body there instead. Selected specs (if any) show either way. */}
      <div className="absolute top-0 inset-x-0 z-20 px-4 pt-3">
        <div className="md:hidden flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-full w-fit">
          <MapPin className="w-3 h-3 text-teal-600 flex-shrink-0" />
          <span className="text-slate-400 font-normal">Near</span>
          <span className="font-medium">{locationName}</span>
        </div>
        {activeFilters.length > 0 && (
          <>
            <div className="mt-2 border-t border-slate-100 md:hidden" />
            <div className="mt-2 md:mt-0 flex items-center gap-1.5 flex-nowrap overflow-x-auto overflow-y-hidden scrollbar-hide">
              {activeFilters.map(f => (
                <span
                  key={f}
                  className="flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-200 text-slate-400"
                >
                  {f}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Animated stage visual — centred on msite, beside the progress ring on desktop */}
      <div className="relative z-10 w-[280px] h-[170px] md:w-[320px] md:h-[190px] rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/30 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
        <div key={activeIdx} className="w-full h-full animate-loader-fade-in">
          {renderStageScene(allDone ? 4 : activeIdx, specLabels, locationName)}
        </div>
      </div>

      {/* Progress ring — text sits below it on msite, beside it on desktop */}
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-3 md:gap-4">
        <div className="relative w-[80px] h-[80px] flex items-center justify-center flex-shrink-0">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#E2E8F0" strokeWidth="4" />
            <circle
              cx="40" cy="40" r="34" fill="none" stroke="url(#loaderGrad)" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 34}
              strokeDashoffset={2 * Math.PI * 34 * (1 - progress / 100)}
              style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
            />
            <defs>
              <linearGradient id="loaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2DD4BF" />
                <stop offset="100%" stopColor="#0D9488" />
              </linearGradient>
            </defs>
          </svg>
          <div className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
            allDone ? 'bg-gradient-to-br from-teal-400 to-teal-600 text-white' : 'bg-white text-teal-600'
          }`}>
            {allDone ? <Check className="w-6 h-6 animate-loader-check-pop" strokeWidth={3} /> : <ActiveIcon className="w-6 h-6" />}
          </div>
        </div>
        <div className="flex flex-col items-center md:items-start">
          <p className="text-base md:text-lg font-semibold text-slate-900 text-center md:text-left animate-loader-fade-in" key={stageLabel}>{stageLabel}</p>
        </div>
      </div>

      {/* Time estimate — shown once, not per-stage; made prominent so buyers know what to expect.
          Centered with a flex wrapper spanning the full width (not left-1/2 + translate) so it
          stays correctly centered and doesn't clip/misalign on narrow mobile viewports. */}
      <div className="absolute bottom-6 inset-x-0 z-10 px-4 flex justify-center">
        <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-100 rounded-full px-4 py-1.5 max-w-full">
          <Clock className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
          <p className="text-xs text-teal-700 font-semibold whitespace-nowrap">This usually takes upto 30 seconds</p>
        </div>
      </div>
    </div>
  );
}
