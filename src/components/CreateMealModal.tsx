import { useState } from 'react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import IngredientsInput from './IngredientsInput';
import Button from './Button';
import { updateUserData } from '../../firebase/firebase';
import { type User } from 'firebase/auth';
import { type UserData } from '../utils/types';
import { type EmojiObject, type MealType, type Ingredient } from '../utils/types';

type Props = {
  user: User | null;
  userData: UserData | undefined;
  setCreateMealModalIsOpen: (isOpen: boolean) => void;
  setMeals: (meals: Array<MealType>) => void;
};

export default function CreateMealModal({
  user,
  userData,
  setCreateMealModalIsOpen,
  setMeals,
}: Props) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState<string | null>(null);
  const [emojiPickerIsOpen, setEmojiPickerIsOpen] = useState(false);
  const [ingredients, setIngredients] = useState<Array<Ingredient>>([]);

  function pickEmoji(emojiObject: EmojiObject) {
    setEmoji(emojiObject.emoji);
    setEmojiPickerIsOpen(false);
  }

  function saveMeal() {
    if (user && userData) {
      const newMeal: MealType = {
        name: name,
        emoji: emoji || '',
        ingredients: ingredients,
      };
      updateUserData(user.uid, {
        meals: [...userData.meals, newMeal],
      });
      setMeals([...userData.meals, newMeal]);
    }
    setCreateMealModalIsOpen(false);
  }

  return (
    <div className="fixed top-0 left-0 z-10 w-full h-full bg-black/60 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="create-meal-modal bg-dark rounded-md p-6 w-full max-w-xl">
          <h2 className="text-subtitle text-xl font-semibold mb-4">Create New Meal</h2>
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
              {emoji ? `${emoji}  Change emoji` : 'Choose emoji'}
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
              onClick={() => setCreateMealModalIsOpen(false)}
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
