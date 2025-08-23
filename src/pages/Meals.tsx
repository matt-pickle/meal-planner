import { useState } from 'react';
import { type UserData } from '../../firebase/firebase';
import { type User } from 'firebase/auth';
import Meal from '../components/Meal';
import Button from '../components/Button';
import { icon } from '../utils/utils';

type Props = {
  user: User | null;
  userData: UserData | undefined;
};

export default function Meals({ user, userData }: Props) {
  const [newMealModalIsOpen, setNewMealModalIsOpen] = useState(false);

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
      <Button
        icon={icon('plus')}
        ariaLabel="add new meal"
        onClick={() => setNewMealModalIsOpen(true)}
      />
    </>
  );
}
