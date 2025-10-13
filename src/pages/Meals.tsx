import { useState } from 'react';
import { type User } from 'firebase/auth';
import Meal from '../components/Meal';
import Button from '../components/Button';
import CreateMealModal from '../components/CreateMealModal';
import EditMealModal from '../components/EditMealModal';
import DeleteMealModal from '../components/DeleteMealModal';
import { icon } from '../utils/utils';
import { type UserData, type MealType } from '../utils/types';

type Props = {
  user: User | null;
  userData: UserData | undefined;
};

export default function Meals({ user, userData }: Props) {
  const [meals, setMeals] = useState<Array<MealType>>(userData?.meals || []);
  const [createMealModalIsOpen, setCreateMealModalIsOpen] = useState(false);
  const [editMealModalIsOpen, setEditMealModalIsOpen] = useState(false);
  const [deleteMealModalIsOpen, setDeleteMealModalIsOpen] = useState(false);

  const mealList: Array<React.JSX.Element> =
    meals.map((meal, index) => (
      <Meal
        key={index}
        user={user}
        userData={userData}
        name={meal.name}
        emoji={meal.emoji}
        ingredients={meal.ingredients}
        setEditMealModalIsOpen={setEditMealModalIsOpen}
        setDeleteMealModalIsOpen={setDeleteMealModalIsOpen}
      />
    )) || [];

  return (
    <>
      <h1 className="text-blue-200">Meals Page</h1>
      {mealList}
      <Button
        icon={icon('plus')}
        ariaLabel="add new meal"
        onClick={() => setCreateMealModalIsOpen(true)}
      />
      {createMealModalIsOpen && (
        <CreateMealModal
          user={user}
          userData={userData}
          setCreateMealModalIsOpen={setCreateMealModalIsOpen}
          setMeals={setMeals}
        />
      )}
      {editMealModalIsOpen && <EditMealModal setEditMealModalIsOpen={setEditMealModalIsOpen} />}
      {deleteMealModalIsOpen && (
        <DeleteMealModal setDeleteMealModalIsOpen={setDeleteMealModalIsOpen} />
      )}
    </>
  );
}
