import { useState } from 'react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import IngredientsInput from './IngredientsInput';
import Button from './Button';
import Modal from './Modal';
import { isDuplicateMealName } from '../utils/utils';
import { type EmojiObject, type MealType, type Ingredient } from '../utils/types';

type Props = {
  title: string;
  meals: Array<MealType>;
  // The meal being edited; absent when creating one
  initialMeal?: MealType;
  onSave: (meal: MealType) => void;
  onClose: () => void;
  classOverrides?: string;
};

export default function MealFormModal({
  title,
  meals,
  initialMeal,
  onSave,
  onClose,
  classOverrides,
}: Props) {
  const [name, setName] = useState(initialMeal?.name || '');
  const [emoji, setEmoji] = useState<string | null>(initialMeal?.emoji || null);
  const [emojiPickerIsOpen, setEmojiPickerIsOpen] = useState(false);
  // Copy the ingredients: editing the stored objects would apply the changes
  // before the user saves, and leave them applied after Cancel.
  const [ingredients, setIngredients] = useState<Array<Ingredient>>(
    initialMeal?.ingredients.map(ingredient => ({ ...ingredient })) || []
  );
  const [nameError, setNameError] = useState('');

  function pickEmoji(emojiObject: EmojiObject) {
    setEmoji(emojiObject.emoji);
    setEmojiPickerIsOpen(false);
  }

  function saveMeal() {
    if (!name.trim()) {
      setNameError('Give the meal a name.');
      return;
    }
    if (isDuplicateMealName(name, meals, initialMeal?.id)) {
      setNameError(`You already have a meal called "${name.trim()}".`);
      return;
    }
    onSave({
      id: initialMeal?.id ?? crypto.randomUUID(),
      name: name,
      emoji: emoji || '',
      ingredients: ingredients,
    });
    onClose();
  }

  return (
    <Modal title={title} onClose={onClose} classOverrides={classOverrides}>
      <label htmlFor="meal-name" className="block text-light font-semibold mb-1">
        Meal Name
      </label>
      <input
        aria-label="meal name"
        id="meal-name"
        type="text"
        placeholder="Spaghetti"
        className="w-full bg-medium text-white rounded-md px-3 py-2 mb-4 placeholder:text-light/50 focus:outline-2 focus:outline-title"
        value={name}
        onChange={e => {
          setName(e.target.value);
          setNameError('');
        }}
      />
      {nameError && (
        <p role="alert" className="text-red-400 -mt-3 mb-4">
          {nameError}
        </p>
      )}
      <label className="block text-light font-semibold mb-1">Emoji</label>
      <div className="relative mb-4">
        <button
          onClick={() => setEmojiPickerIsOpen(!emojiPickerIsOpen)}
          aria-label="choose emoji"
          className="bg-medium text-white rounded-md px-3 py-2 cursor-pointer hover:bg-medium/70"
        >
          {emoji ? `${emoji}  Change emoji` : 'Choose emoji'}
        </button>
        {emojiPickerIsOpen && (
          <div className="absolute left-0 top-12 z-20">
            <EmojiPicker
              onEmojiClick={pickEmoji}
              theme={Theme.DARK}
              height={350}
              open={emojiPickerIsOpen}
            />
          </div>
        )}
      </div>
      <label className="block text-light font-semibold mb-1">Ingredients</label>
      <IngredientsInput ingredients={ingredients} setIngredients={setIngredients} />
      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          text="Cancel"
          onClick={onClose}
          ariaLabel="cancel"
          classOverrides="bg-red-600 hover:bg-red-800"
        />
        <Button text="Save" onClick={saveMeal} ariaLabel="save meal" />
      </div>
    </Modal>
  );
}
