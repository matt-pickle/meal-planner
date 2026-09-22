import Icon from './Icon';

// Shown while the user's data is still being fetched. Data pages must not
// render before it arrives: they seed their state from it once, on mount.
export default function Loading() {
  return (
    <div role="status" className="flex items-center gap-3 text-light text-lg">
      <span className="animate-spin">{<Icon name="hamburger" size="24px" />}</span>
      Loading your meal plan...
    </div>
  );
}
