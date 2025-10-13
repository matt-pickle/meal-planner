import { useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
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
    <div>
      <h2>Create New Meal</h2>
      <label htmlFor="meal-name">Meal Name</label>
      <input
        aria-label="meal name"
        id="meal-name"
        type="text"
        placeholder="Spaghetti"
        className="border p-1 rounded w-full mb-2"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <label>Emoji</label>
      <button onClick={() => setEmojiPickerIsOpen(true)} aria-label="choose emoji">
        Choose emoji
      </button>
      {/*/ @ts-ignore theme attribute */}
      <EmojiPicker onEmojiClick={pickEmoji} theme="dark" open={emojiPickerIsOpen} />
      {emoji}
      <label>Ingredients</label>
      <IngredientsInput ingredients={ingredients} setIngredients={setIngredients} />
      <div className="flex items-center justify-center gap-4">
        <Button text="Cancel" onClick={() => setCreateMealModalIsOpen(false)} ariaLabel="cancel" />
        <Button text="Save" onClick={saveMeal} ariaLabel="save meal" />
      </div>
    </div>
  );
}
