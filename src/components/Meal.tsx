import { type User } from 'firebase/auth';
import { icon } from '../utils/utils';
import { type UserData, type Ingredient } from '../utils/types';

type Props = {
  user: User | null;
  userData: UserData | undefined;
  name: string;
  emoji: string;
  ingredients: Array<Ingredient>;
  setEditMealModalIsOpen: (isOpen: boolean) => void;
  setDeleteMealModalIsOpen: (isOpen: boolean) => void;
};

export default function Meal({ user, userData, name, emoji, ingredients, setEditMealModalIsOpen, setDeleteMealModalIsOpen }: Props) {
  return (
    <>
      <h2>{name}</h2>
      <span>{emoji}</span>
      <ul>
        {ingredients.map((ingredient, index) => (
          <li key={index}>
            {ingredient.quantity}{ingredient.units} {ingredient.name}
          </li>
        ))}
      </ul>
      <button onClick={() => setEditMealModalIsOpen(true)} aria-label="edit">{icon('edit')}</button>
      <button onClick={() => setDeleteMealModalIsOpen(true)} aria-label="delete">{icon('trash')}</button>
    </>
  );
}