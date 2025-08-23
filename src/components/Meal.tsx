import { type UserData } from '../../firebase/firebase';
import { type User } from 'firebase/auth';

type Ingredient = {
  name: string;
  emoji: string;
  quantity: number;
}

type Props = {
  user: User | null;
  userData: UserData | undefined;
  name: string;
  emoji: string;
  ingredients: Array<Ingredient>;
};

export default function Meal({ user, userData, name, emoji, ingredients }: Props) {
  return (
    <>
      <h2>{name}</h2>
      <span>{emoji}</span>
      <ul>
        {ingredients.map((ingredient, index) => (
          <li key={index}>
            {ingredient.emoji} {ingredient.name} (x{ingredient.quantity})
          </li>
        ))}
      </ul>
    </>
  );
}