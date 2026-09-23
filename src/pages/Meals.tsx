import { useState } from 'react';
import Meal from '../components/Meal';
import Button from '../components/Button';
import MealFormModal from '../components/MealFormModal';
import DeleteMealModal from '../components/DeleteMealModal';
import Icon from '../components/Icon';
import { useUserData } from '../state/UserDataContext';
import { type MealType } from '../utils/types';

export default function Meals() {
  // One copy of the data, owned by the store
  const { userData, setMeals } = useUserData();
  const meals = userData.meals;
  const [createMealModalIsOpen, setCreateMealModalIsOpen] = useState(false);
  const [editMealModalIsOpen, setEditMealModalIsOpen] = useState(false);
  const [mealToEdit, setMealToEdit] = useState<MealType | null>(null);
  const [deleteMealModalIsOpen, setDeleteMealModalIsOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<MealType | null>(null);

  const sortedMeals = [...meals].sort((a, b) => a.name.localeCompare(b.name));

  const mealList: Array<React.JSX.Element> = sortedMeals.map(meal => (
    <Meal
      key={meal.id}
      meal={meal}
      setEditMealModalIsOpen={setEditMealModalIsOpen}
      setMealToEdit={setMealToEdit}
      setDeleteMealModalIsOpen={setDeleteMealModalIsOpen}
      setMealToDelete={setMealToDelete}
    />
  ));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-8 mb-8">
        <h1 className="flex items-center gap-3 text-title text-4xl font-semibold">
          <Icon name="hamburger" size="34px" /> Meals
        </h1>
        <Button
          icon={<Icon name="plus" />}
          text="Create Meal"
          ariaLabel="add new meal"
          onClick={() => setCreateMealModalIsOpen(true)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mealList}
      </div>
      {createMealModalIsOpen && (
        <MealFormModal
          title="Create New Meal"
          classOverrides="create-meal-modal max-w-xl"
          meals={meals}
          onSave={meal => setMeals([...meals, meal])}
          onClose={() => setCreateMealModalIsOpen(false)}
        />
      )}
      {editMealModalIsOpen && mealToEdit && (
        <MealFormModal
          title="Edit Meal"
          classOverrides="edit-meal-modal max-w-xl"
          meals={meals}
          initialMeal={mealToEdit}
          onSave={updated => setMeals(meals.map(meal => (meal.id === updated.id ? updated : meal)))}
          onClose={() => setEditMealModalIsOpen(false)}
        />
      )}
      {deleteMealModalIsOpen && (
        <DeleteMealModal
          meal={mealToDelete}
          meals={meals}
          setDeleteMealModalIsOpen={setDeleteMealModalIsOpen}
          setMeals={setMeals}
        />
      )}
    </>
  );
}
