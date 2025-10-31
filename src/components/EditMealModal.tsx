import { useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
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
    <div>
      <h2>Edit Meal</h2>
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
        <Button text="Cancel" onClick={() => setEditMealModalIsOpen(false)} ariaLabel="cancel" />
        <Button text="Save" onClick={saveMeal} ariaLabel="save meal" />
      </div>
    </div>
  );
}
