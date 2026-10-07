import CtaPanel from './CtaPanel';
import StoriesRow from './StoriesRow';
import { Persona } from './PersonaFloater';

interface MobileProfileBarProps {
  persona?: Persona;
}

export default function MobileProfileBar(_props: MobileProfileBarProps) {
  return (
    <div className="lg:hidden">
      <CtaPanel variant="mobile" />
      <div className="px-2 pt-2">
        <StoriesRow />
      </div>
    </div>
  );
}
