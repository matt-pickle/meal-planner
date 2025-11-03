import { icon } from '../utils/utils';
import { type MealType } from '../utils/types';

type Props = {
  meal: MealType;
  setEditMealModalIsOpen: (isOpen: boolean) => void;
  setMealToEdit: (meal: MealType | null) => void;
  setDeleteMealModalIsOpen: (isOpen: boolean) => void;
  setMealToDelete: (meal: MealType | null) => void;
};

export default function Meal({
  meal,
  setEditMealModalIsOpen,
  setMealToEdit,
  setDeleteMealModalIsOpen,
  setMealToDelete,
}: Props) {

  function handleEditClick() {
    setMealToEdit(meal);
    setEditMealModalIsOpen(true);
  }

  function handleDeleteClick() {
    setMealToDelete(meal);
    setDeleteMealModalIsOpen(true);
  }

  return (
    <>
      <h2>{meal.name}</h2>
      <span>{meal.emoji}</span>
      <ul>
        {meal.ingredients.map((ingredient, index) => (
          <li key={index}>
            {ingredient.quantity}
            {ingredient.units} {ingredient.name}
          </li>
        ))}
      </ul>
      <button onClick={handleEditClick} aria-label="edit">
        {icon('edit')}
      </button>
      <button onClick={handleDeleteClick} aria-label="delete">
        {icon('trash')}
      </button>
    </>
  );
}