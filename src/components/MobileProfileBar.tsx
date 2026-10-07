import CtaPanel from './CtaPanel';
import StoriesRow from './StoriesRow';
import { Persona } from './PersonaFloater';

interface MobileProfileBarProps {
  persona?: Persona;
}

export default function MobileProfileBar({ persona }: MobileProfileBarProps) {
  return (
    <div className="lg:hidden">
      <CtaPanel variant="mobile" />
      {persona !== 'bl-waiting' && (
        <div className="px-2 pt-2">
          <StoriesRow />
        </div>
      )}
    </div>
  );
}
