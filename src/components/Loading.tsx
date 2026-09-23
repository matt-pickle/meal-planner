import Icon from './Icon';

// Shown while the sign-in is being restored and then while the user's data is
// fetched. Private pages read that data from the store, which only exists once
// it has arrived, so they can't render until then.
export default function Loading() {
  return (
    <div role="status" className="flex items-center gap-3 text-light text-lg">
      <span className="animate-spin">
        <Icon name="hamburger" size="24px" />
      </span>
      Loading your meal plan...
    </div>
  );
}
