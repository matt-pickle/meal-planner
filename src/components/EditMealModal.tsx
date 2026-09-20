import { useState } from 'react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import IngredientsInput from './IngredientsInput';
import Button from './Button';
import { updateUserData } from '../../firebase/firebase';
import { type User } from 'firebase/auth';
import { type UserData } from '../utils/types';
import { type EmojiObject, type MealType, type Ingredient } from '../utils/types';

type Props = {
  meal: MealType | null;
  user: User | null;
  userData: UserData | undefined;
  setEditMealModalIsOpen: (isOpen: boolean) => void;
  setMeals: (meals: Array<MealType>) => void;
};

export default function EditMealModal({
  meal,
  user,
  userData,
  setEditMealModalIsOpen,
  setMeals,
}: Props) {
  const [name, setName] = useState(meal?.name || '');
  const [emoji, setEmoji] = useState<string | null>(meal?.emoji || null);
  const [emojiPickerIsOpen, setEmojiPickerIsOpen] = useState(false);
  const [ingredients, setIngredients] = useState<Array<Ingredient>>(meal?.ingredients || []);

  function pickEmoji(emojiObject: EmojiObject) {
    setEmoji(emojiObject.emoji);
    setEmojiPickerIsOpen(false);
  }

  function saveMeal() {
    if (user && userData && meal) {
      const newMeal: MealType = {
        name,
        emoji: emoji || '',
        ingredients,
      };
      const updatedMeals = userData.meals.map(m => (m === meal ? newMeal : m));
      updateUserData(user.uid, { meals: updatedMeals });
      setMeals(updatedMeals);
    }
    setEditMealModalIsOpen(false);
  }

  return (
    <div className="fixed top-0 left-0 z-10 w-full h-full bg-black/60 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="edit-meal-modal bg-dark rounded-md p-6 w-full max-w-xl">
          <h2 className="text-subtitle text-xl font-semibold mb-4">Edit Meal</h2>
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
              onClick={() => setEditMealModalIsOpen(false)}
              ariaLabel="cancel"
              classOverrides="bg-red-600 hover:bg-red-800"
            />
            <Button text="Save" onClick={saveMeal} ariaLabel="save meal" />
          </div>
        </div>
      </div>
    </div>
  );
}
