import { useEffect, useRef, useState } from 'react';
import { Phone, Check } from 'lucide-react';

type CallPhase = 'idle' | 'connecting' | 'connected';

interface CallNowButtonProps {
  variant?: 'desktop' | 'mobile';
}

// Shared "Call Now" CTA for feed post cards — tapping it fakes a short call
// flow instead of doing nothing: Connecting... (ringing phone icon) for 4s,
// then Call Connected for 3s, then back to the idle Call Now state. Each
// phase change cross-fades its label/icon in rather than snapping, and the
// button itself eases its color change instead of switching instantly.
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
      ? 'flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors duration-300 ease-out active:scale-95'
      // Fixed min-width so the longer "Call Connected" label doesn't snap the
      // button wider — it's the width jump, not the color change, that reads
      // as a jerk when the CTA switches state.
      : 'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap min-w-[132px] transition-colors duration-300 ease-out active:scale-95';

  const tone =
    phase === 'connected'
      ? 'bg-emerald-100 text-emerald-700 cursor-default'
      : phase === 'connecting'
      ? 'border border-[#1d8480] text-[#1d8480] bg-white cursor-default'
      : 'border border-[#1d8480] text-[#1d8480] bg-white hover:bg-teal-50';

  return (
    <button type="button" onClick={startCall} disabled={phase !== 'idle'} className={`${sizing} ${tone}`}>
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
    </button>
  );
}
