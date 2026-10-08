import { useEffect, useRef, useState } from 'react';
import { Phone, Check } from 'lucide-react';

type CallPhase = 'idle' | 'connecting' | 'connected';

interface CallNowButtonProps {
  variant?: 'desktop' | 'mobile';
}

// Shared "Call Now" CTA for feed post cards. At rest it's sized exactly like
// its "Get Best Price" sibling — natural content size on desktop, equal
// flex-1 share on mobile. Tapping it fakes a short call flow — Connecting...
// (ringing phone icon) for 4s, then Call Connected for 3s, then back to
// idle — and the button's width grows/shrinks smoothly between each phase's
// natural size instead of snapping. That's done by measuring each phase's
// real width off-screen and animating the `flex` shorthand (flex-basis is
// what actually sizes a flex item, so overriding grow/shrink/basis together
// is what makes the animation — and the mobile flex-1 default — both work).
const CONNECTING_MS = 4000;
const CONNECTED_MS = 3000;

export default function CallNowButton({ variant = 'desktop' }: CallNowButtonProps) {
  const [phase, setPhase] = useState<CallPhase>('idle');
  const [pinnedWidth, setPinnedWidth] = useState<number | undefined>(undefined);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const idleMirrorRef = useRef<HTMLSpanElement | null>(null);
  const connectingMirrorRef = useRef<HTMLSpanElement | null>(null);
  const connectedMirrorRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function startCall() {
    if (phase !== 'idle') return;

    const idleW = idleMirrorRef.current?.offsetWidth;
    const connectingW = connectingMirrorRef.current?.offsetWidth;

    // Pin the current (natural) width as a concrete number first — CSS can't
    // animate from "auto"/flex-1, only between two numeric values — then
    // grow to the connecting width a frame later so the change animates.
    if (idleW != null) setPinnedWidth(idleW);
    requestAnimationFrame(() => {
      setPhase('connecting');
      if (connectingW != null) setPinnedWidth(connectingW);
    });

    timeoutRef.current = setTimeout(() => {
      setPhase('connected');
      const connectedW = connectedMirrorRef.current?.offsetWidth;
      if (connectedW != null) setPinnedWidth(connectedW);

      timeoutRef.current = setTimeout(() => {
        setPhase('idle');
        const nextIdleW = idleMirrorRef.current?.offsetWidth;
        if (nextIdleW != null) setPinnedWidth(nextIdleW);
      }, CONNECTED_MS);
    }, CONNECTING_MS);
  }

  function handleTransitionEnd() {
    // Once the shrink-back-to-idle animation finishes, release the pinned
    // size so the button returns to flex-1 (mobile) / natural (desktop)
    // sizing — i.e. exactly matching Get Best Price again, resize-safe.
    if (phase === 'idle') setPinnedWidth(undefined);
  }

  const mirrorClass =
    'absolute opacity-0 pointer-events-none -z-10 top-0 left-0 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold whitespace-nowrap';

  const sizing =
    variant === 'mobile'
      ? 'relative flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-300 ease-out active:scale-95'
      : 'relative inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-300 ease-out active:scale-95';

  const tone =
    phase === 'connected'
      ? 'border border-transparent bg-emerald-100 text-emerald-700 cursor-default'
      : phase === 'connecting'
      ? 'border border-[#1d8480] text-[#1d8480] bg-white cursor-default'
      : 'border border-[#1d8480] text-[#1d8480] bg-white hover:bg-teal-50';

  return (
    <button
      type="button"
      onClick={startCall}
      onTransitionEnd={handleTransitionEnd}
      disabled={phase !== 'idle'}
      style={pinnedWidth != null ? { flex: `0 0 ${pinnedWidth}px` } : undefined}
      className={`${sizing} ${tone}`}
    >
      <span key={phase} className="inline-flex items-center gap-1.5 animate-cta-fade-in">
        {phase === 'connected' ? (
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
        ) : (
          <Phone className={`w-3.5 h-3.5 ${phase === 'connecting' ? 'animate-call-ring' : ''}`} />
        )}
        {phase === 'connected' ? 'Call Connected' : phase === 'connecting' ? 'Connecting...' : 'Call Now'}
      </span>

      {/* Hidden mirrors — same content/padding as each phase, used only to measure
          that phase's natural width so size changes can animate smoothly. */}
      <span ref={idleMirrorRef} aria-hidden="true" className={mirrorClass}>
        <Phone className="w-3.5 h-3.5" />
        Call Now
      </span>
      <span ref={connectingMirrorRef} aria-hidden="true" className={mirrorClass}>
        <Phone className="w-3.5 h-3.5" />
        Connecting...
      </span>
      <span ref={connectedMirrorRef} aria-hidden="true" className={mirrorClass}>
        <Check className="w-3.5 h-3.5" strokeWidth={3} />
        Call Connected
      </span>
    </button>
  );
}
