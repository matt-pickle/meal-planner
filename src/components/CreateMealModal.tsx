import { useState } from 'react';
import EmojiPicker from 'emoji-picker-react';

type Props = {
  setCreateMealModalIsOpen: (isOpen: boolean) => void;
};

type EmojiObject = {
  emoji: string;
}

export default function CreateMealModal({ setCreateMealModalIsOpen }: Props) {
  const [emoji, setEmoji] = useState<string | null>(null);
  const [emojiPickerIsOpen, setEmojiPickerIsOpen] = useState(false);

  function pickEmoji(emojiObject: EmojiObject) {
    setEmoji(emojiObject.emoji);
    setEmojiPickerIsOpen(false);
  }

  return (
    <div>
      <h2>Create New Meal</h2>
      <button onClick={() => setEmojiPickerIsOpen(true)}>Choose emoji</button>
      <EmojiPicker onEmojiClick={pickEmoji} theme="dark" open={emojiPickerIsOpen} />
      {emoji}
    </div>
  );
}
