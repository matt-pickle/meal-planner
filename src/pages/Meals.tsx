import { type UserData } from '../../firebase/firebase';
import { type User } from 'firebase/auth';
import Meal from '../components/Meal';

type Props = {
  user: User | null;
  userData: UserData | undefined;
};

export default function Meals({ user, userData }: Props) {

  const mealList: Array<React.JSX.Element> =
    userData?.meals.map((meal, index) => (
      <Meal
        key={index}
        user={user}
        userData={userData}
        name={meal.name}
        emoji={meal.emoji}
        ingredients={meal.ingredients}
      />
    )) || [];

  return (
    <>
      <h1 className="text-blue-200">Meals Page</h1>
      {mealList}
    </>
  );
}
