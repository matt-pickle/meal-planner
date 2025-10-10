import { useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import Multiselect from './Multiselect';
import { type EmojiObject, type Ingredient } from '../utils/types';

type Props = {
  setCreateMealModalIsOpen: (isOpen: boolean) => void;
};

export default function CreateMealModal({ setCreateMealModalIsOpen }: Props) {
  const [emoji, setEmoji] = useState<string | null>(null);
  const [emojiPickerIsOpen, setEmojiPickerIsOpen] = useState(false);
  const [ingredients, setIngredients] = useState<Array<Ingredient>>([]);

  function pickEmoji(emojiObject: EmojiObject) {
    setEmoji(emojiObject.emoji);
    setEmojiPickerIsOpen(false);
  }

  return (
    <div>
      <h2>Create New Meal</h2>
      <button onClick={() => setEmojiPickerIsOpen(true)}>Choose emoji</button>
      {/*/ @ts-ignore theme attribute */}
      <EmojiPicker onEmojiClick={pickEmoji} theme="dark" open={emojiPickerIsOpen} />
      {emoji}
      <Multiselect
        options={[
          { label: 'Eggs', value: 'eggs' },
          { label: 'Bacon', value: 'bacon' },
          { label: 'Bread', value: 'bread' },
          { label: 'Lettuce', value: 'lettuce' },
          { label: 'Tomato', value: 'tomato' },
        ]}
        onSelect={(selected) => setIngredients(selected)}
        placeholder="Select ingredients..."
      />
      {/* list selected ingredients with quantity inputs */}
    </div>
  );
}
