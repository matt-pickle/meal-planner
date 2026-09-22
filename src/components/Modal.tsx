import { useEffect, useRef, useId } from 'react';

type Props = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  // Width of the card, and any class the page uses as a hook
  classOverrides?: string;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ title, onClose, children, classOverrides = 'max-w-xl' }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const titleId = `${useId()}-title`;

  // Take focus on open and hand it back to whatever had it on close
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const firstFocusable = cardRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    (firstFocusable ?? cardRef.current)?.focus();

    return () => previouslyFocused?.focus?.();
  }, []);

  // The page behind a modal must not scroll
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;

    // Keep Tab inside the dialog
    const focusable = Array.from(cardRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleBackdropMouseDown(event: React.MouseEvent) {
    // Only a click on the backdrop itself, not one that started inside the card
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className="fixed top-0 left-0 z-10 w-full h-full bg-black/60 overflow-y-auto"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        className="min-h-full flex items-center justify-center p-4"
        onMouseDown={handleBackdropMouseDown}
      >
        <div
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className={`bg-dark rounded-md p-6 w-full outline-none ${classOverrides}`}
        >
          <h2 id={titleId} className="text-subtitle text-xl font-semibold mb-4">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>
  );
}
