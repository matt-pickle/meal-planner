import Button from './Button';
import Modal from './Modal';
import { type GroceryItemType } from '../utils/types';

type Props = {
  ingredients: Array<GroceryItemType>;
  setAddFromMealsModalIsOpen: (isOpen: boolean) => void;
  addIngredientsFromMeals: () => void;
};

export default function AddFromMealsModal({
  ingredients,
  setAddFromMealsModalIsOpen,
  addIngredientsFromMeals,
}: Props) {

  function confirm() {
    addIngredientsFromMeals();
    setAddFromMealsModalIsOpen(false);
  }

  return (
    <Modal title="Add Ingredients from Meals" onClose={() => setAddFromMealsModalIsOpen(false)} classOverrides="add-from-meals-modal max-w-md">
      <p className="text-light mb-3">
        This will add the following ingredients from your scheduled meals to your grocery list. If an ingredient is already on the list, its quantity will be increased.
      </p>
      {ingredients.length > 0 ? (
        <ul className="flex flex-col gap-2 text-light bg-medium rounded-md p-4 mb-6">
          {ingredients.map((ingredient, index) => (
            <li key={index}>
              {ingredient.name}&nbsp;-&nbsp;
              {ingredient.quantity}&nbsp;
              {ingredient.units}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-light mb-6">
          There are no ingredients to add. Schedule some meals first.
        </p>
      )}
      <div className="flex items-center justify-center gap-4">
        <Button
          text="Cancel"
          onClick={() => setAddFromMealsModalIsOpen(false)}
          ariaLabel="cancel"
          classOverrides="bg-red-600 hover:bg-red-800"
        />
        <Button
          text="Add Ingredients"
          onClick={confirm}
          ariaLabel="confirm add ingredients"
          disabled={ingredients.length === 0}
          classOverrides={ingredients.length === 0 ? 'opacity-50 hover:bg-blue-500' : ''}
        />
      </div>
    </Modal>
  );
}
