import Button from './Button';
import Modal from './Modal';
import { type MealType } from '../utils/types';

type Props = {
  meal: MealType | null;
  meals: Array<MealType>;
  setDeleteMealModalIsOpen: (isOpen: boolean) => void;
  setMeals: (meals: Array<MealType>) => void;
};

export default function DeleteMealModal({
  meal,
  meals,
  setDeleteMealModalIsOpen,
  setMeals,
}: Props) {

  function deleteMeal() {
    if (meal) {
      setMeals(meals.filter(m => m.id !== meal.id));
    }
    setDeleteMealModalIsOpen(false);
  }

  return (
    <Modal title="Delete Meal" onClose={() => setDeleteMealModalIsOpen(false)} classOverrides="delete-meal-modal max-w-md">
      <p className="text-light mb-6">
        Are you sure you want to delete the meal "{meal?.name}"?
      </p>
      <div className="flex items-center justify-center gap-4">
        <Button
          text="Cancel"
          onClick={() => setDeleteMealModalIsOpen(false)}
          ariaLabel="cancel"
        />
        <Button
          text="Delete"
          onClick={deleteMeal}
          ariaLabel="delete meal"
          classOverrides="bg-red-600 hover:bg-red-800"
        />
      </div>
    </Modal>
  );
}
