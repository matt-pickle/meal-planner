import Button from './Button';
import { icon } from '../utils/utils';

type Props = {
  message: string | null;
  onDismiss: () => void;
};

export default function ErrorBanner({ message, onDismiss }: Props) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-red-700 text-white rounded-md shadow-lg py-3 px-4 max-w-md"
    >
      <p className="flex-1">{message}</p>
      <Button
        icon={icon('x')}
        ariaLabel="dismiss error"
        onClick={onDismiss}
        classOverrides="!bg-transparent hover:!bg-red-800 !p-2"
      />
    </div>
  );
}
