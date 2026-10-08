import { useEffect, useRef, useState } from 'react';
import { Phone, Check } from 'lucide-react';

type CallPhase = 'idle' | 'connecting' | 'connected';

interface CallNowButtonProps {
  variant?: 'desktop' | 'mobile';
}

// Shared "Call Now" CTA for feed post cards — tapping it fakes a short call
// flow instead of doing nothing: Connecting... (ringing phone icon) for 4s,
// then Call Connected for 3s, then back to the idle Call Now state.
//
// The button's box size must never change across phases (that read as a
// jerk), so its width/height are reserved by an invisible span holding the
// longest label ("Call Connected") and the real, phase-dependent content is
// laid on top of it with position:absolute + inset-0 — the visible content
// cross-fades, but the button itself never resizes.
const CONNECTING_MS = 4000;
const CONNECTED_MS = 3000;

export default function CallNowButton({ variant = 'desktop' }: CallNowButtonProps) {
  const [phase, setPhase] = useState<CallPhase>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function startCall() {
    if (phase !== 'idle') return;
    setPhase('connecting');
    timeoutRef.current = setTimeout(() => {
      setPhase('connected');
      timeoutRef.current = setTimeout(() => {
        setPhase('idle');
      }, CONNECTED_MS);
    }, CONNECTING_MS);
  }

  const sizing =
    variant === 'mobile'
      ? 'relative flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors duration-300 ease-out active:scale-95'
      : 'relative inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors duration-300 ease-out active:scale-95';

  // Always keep a 1px border — even "transparent" — so the rendered box size
  // (border adds to it regardless of box-sizing when width is auto) never
  // changes across phases; only its color/fill does.
  const tone =
    phase === 'connected'
      ? 'border border-transparent bg-emerald-100 text-emerald-700 cursor-default'
      : phase === 'connecting'
      ? 'border border-[#1d8480] text-[#1d8480] bg-white cursor-default'
      : 'border border-[#1d8480] text-[#1d8480] bg-white hover:bg-teal-50';

  return (
    <button type="button" onClick={startCall} disabled={phase !== 'idle'} className={`${sizing} ${tone}`}>
      {/* Invisible sizer — reserves the button's box size for the longest label so no
          phase change ever resizes it; the visible content overlays it absolutely. */}
      <span className="invisible inline-flex items-center gap-1.5" aria-hidden="true">
        <Check className="w-3.5 h-3.5" strokeWidth={3} />
        Call Connected
      </span>

      <span className="absolute inset-0 inline-flex items-center justify-center gap-1.5">
        {phase === 'connected' ? (
          <span key="connected" className="inline-flex items-center gap-1.5 animate-cta-fade-in">
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
            Call Connected
          </span>
        ) : phase === 'connecting' ? (
          <span key="connecting" className="inline-flex items-center gap-1.5 animate-cta-fade-in">
            <Phone className="w-3.5 h-3.5 animate-call-ring" />
            Connecting...
          </span>
        ) : (
          <span key="idle" className="inline-flex items-center gap-1.5 animate-cta-fade-in">
            <Phone className="w-3.5 h-3.5" />
            Call Now
          </span>
        )}
      </span>
    </button>
  );
}
