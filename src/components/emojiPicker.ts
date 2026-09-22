// Kept in its own module so the dynamic import has one identity: the form uses
// it both to declare the lazy component and to start fetching the chunk on
// open. Repeat calls reuse the same in-flight promise.
export function loadEmojiPicker() {
  return import('emoji-picker-react');
}
