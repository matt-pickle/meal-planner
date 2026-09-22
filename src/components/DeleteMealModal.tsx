import Button from './Button';
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
      setMeals(meals.filter(m => m !== meal));
    }
    setDeleteMealModalIsOpen(false);
  }

  return (
    <div className="fixed top-0 left-0 z-10 w-full h-full bg-black/60 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="delete-meal-modal bg-dark rounded-md p-6 w-full max-w-md">
          <h2 className="text-subtitle text-xl font-semibold mb-4">Delete Meal</h2>
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
        </div>
      </div>
    </div>
  );
}
