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
  const [mealToEdit, setMealToEdit] = useState<MealType | null>(null);
  const [deleteMealModalIsOpen, setDeleteMealModalIsOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<MealType | null>(null);

  const sortedMeals = [...meals].sort((a, b) => a.name.localeCompare(b.name));

  const mealList: Array<React.JSX.Element> =
    sortedMeals.map((meal, index) => (
      <Meal
        key={index}
        meal={meal}
        setEditMealModalIsOpen={setEditMealModalIsOpen}
        setMealToEdit={setMealToEdit}
        setDeleteMealModalIsOpen={setDeleteMealModalIsOpen}
        setMealToDelete={setMealToDelete}
      />
    )) || [];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-8 mb-8">
        <h1 className="flex items-center gap-3 text-title text-4xl font-semibold">
          {icon('hamburger', undefined, '34px')} Meals
        </h1>
        <Button
          icon={icon('plus')}
          text="Create Meal"
          ariaLabel="add new meal"
          onClick={() => setCreateMealModalIsOpen(true)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mealList}
      </div>
      {createMealModalIsOpen && (
        <CreateMealModal
          user={user}
          userData={userData}
          setCreateMealModalIsOpen={setCreateMealModalIsOpen}
          setMeals={setMeals}
        />
      )}
      {editMealModalIsOpen && (
        <EditMealModal
          meal={mealToEdit}
          user={user}
          userData={userData}
          setEditMealModalIsOpen={setEditMealModalIsOpen}
          setMeals={setMeals}
        />
      )}
      {deleteMealModalIsOpen && (
        <DeleteMealModal
          meal={mealToDelete}
          user={user}
          userData={userData}
          setDeleteMealModalIsOpen={setDeleteMealModalIsOpen}
          setMeals={setMeals}
        />
      )}
    </>
  );
}
