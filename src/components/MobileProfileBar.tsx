import CtaPanel from './CtaPanel';
import StoriesRow from './StoriesRow';
import StoryFeedCards from './StoryFeedCards';
import { Persona } from './PersonaFloater';

interface MobileProfileBarProps {
  persona?: Persona;
}

export default function MobileProfileBar({ persona }: MobileProfileBarProps) {
  return (
    <div className="lg:hidden">
      <CtaPanel variant="mobile" />
      <div className="px-2 pt-2">
        {persona === 'new-user' ? <StoryFeedCards /> : <StoriesRow />}
      </div>
    </div>
  );
}
