import Button from './Button';
import { updateUserData } from '../../firebase/firebase';
import { type User } from 'firebase/auth';
import { type UserData } from '../utils/types';
import { type MealType } from '../utils/types';

type Props = {
  meal: MealType | null;
  user: User | null;
  userData: UserData | undefined;
  setDeleteMealModalIsOpen: (isOpen: boolean) => void;
  setMeals: (meals: Array<MealType>) => void;
};

export default function DeleteMealModal({
  meal,
  user,
  userData,
  setDeleteMealModalIsOpen,
  setMeals,
}: Props) {

  function deleteMeal() {
    if (user && userData && meal) {
      const updatedMeals = userData.meals.filter(m => m !== meal);
      updateUserData(user.uid, { meals: updatedMeals });
      setMeals(updatedMeals);
    }
    setDeleteMealModalIsOpen(false);
  }

  return (
    <div>
      <h2>Delete Meal</h2>
      <p>Are you sure you want to delete the meal "{meal?.name}"?</p>
      <div className="flex items-center justify-center gap-4">
        <Button text="Cancel" onClick={() => setDeleteMealModalIsOpen(false)} ariaLabel="cancel" />
        <Button text="Delete" onClick={deleteMeal} ariaLabel="delete meal" />
      </div>
    </div>
  );
}
