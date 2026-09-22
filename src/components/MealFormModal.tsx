import { lazy, Suspense, useEffect, useState } from 'react';
import { type Theme } from 'emoji-picker-react';
import IngredientsInput from './IngredientsInput';
import Button from './Button';
import Modal from './Modal';
import { loadEmojiPicker } from './emojiPicker';
import { isDuplicateMealName } from '../utils/utils';
import { type EmojiObject, type MealType, type Ingredient } from '../utils/types';

// One of the largest dependencies in the app, and most visitors never open a
// meal form, so it stays out of the main bundle.
const EmojiPicker = lazy(loadEmojiPicker);
const DARK = 'dark' as Theme;

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
    initialMeal?.ingredients.map(ingredient => ({ ...ingredient })) || [],
  );

  const trimmedName = name.trim();
  const isDuplicate = trimmedName !== '' && isDuplicateMealName(name, meals, initialMeal?.id);
  // Save stays disabled until the name is both present and unique
  const canSave = trimmedName !== '' && !isDuplicate;

  // Fetch the picker as soon as the form opens rather than waiting for the
  // button, so it is already there when the user asks for it.
  useEffect(() => {
    loadEmojiPicker();
  }, []);

  function pickEmoji(emojiObject: EmojiObject) {
    setEmoji(emojiObject.emoji);
    setEmojiPickerIsOpen(false);
  }

  function saveMeal() {
    if (!canSave) return;
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
        onChange={e => setName(e.target.value)}
      />
      {isDuplicate && (
        <p role="alert" className="text-red-400 -mt-3 mb-4">
          You already have a meal called &quot;{trimmedName}&quot;.
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
            <Suspense fallback={<p className="text-light">Loading emoji...</p>}>
              <EmojiPicker
                onEmojiClick={pickEmoji}
                theme={DARK}
                height={350}
                open={emojiPickerIsOpen}
              />
            </Suspense>
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
        <Button text="Save" onClick={saveMeal} ariaLabel="save meal" disabled={!canSave} />
      </div>
    </Modal>
  );
}
