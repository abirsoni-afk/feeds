import CtaPanel from './CtaPanel';
import StoriesRow from './StoriesRow';

export default function MobileProfileBar() {
  return (
    <div className="lg:hidden">
      <CtaPanel variant="mobile" />
      <div className="px-2 pt-2">
        <StoriesRow />
      </div>
    </div>
  );
}
