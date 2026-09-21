// A tiny publish/subscribe channel so the Firestore helpers can report a
// failure without every call site having to thread an error handler down.
// App subscribes and renders the message in an ErrorBanner.

type Listener = (message: string) => void;

const listeners = new Set<Listener>();

export function notifyError(message: string): void {
  listeners.forEach(listener => listener(message));
}

export function onError(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
