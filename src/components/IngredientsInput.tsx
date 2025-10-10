import Button from './Button';
import { type Ingredient } from '../utils/types';

type Props = {
  ingredients: Array<Ingredient>;
  setIngredients: (ingredients: Array<Ingredient>) => void;
};

export default function IngredientsInput({ ingredients, setIngredients }: Props) {
  let inputRows = ingredients.map((ingredient, index) => (
    <div key={index} className="flex gap-2">
      <input
        type="text"
        placeholder="Butter"
        value={ingredient.name}
        onChange={(e) => {
          const newIngredients = [...ingredients];
          newIngredients[index].name = e.target.value;
          setIngredients(newIngredients);
        }}
        className="border p-1 rounded w-1/2"
      />
      <input
        type="number"
        placeholder="1"
        value={ingredient.quantity}
        onChange={(e) => {
          const newIngredients = [...ingredients];
          newIngredients[index].quantity = parseFloat(e.target.value);
          setIngredients(newIngredients);
        }}
        className="border p-1 rounded w-1/4"
      />
      <input
        type="text"
        placeholder="tbsp"
        value={ingredient.units}
        onChange={(e) => {
          const newIngredients = [...ingredients];
          newIngredients[index].units = e.target.value;
          setIngredients(newIngredients);
        }}
        className="border p-1 rounded w-1/4"
      />
      <button
        onClick={() => {
          const newIngredients = ingredients.filter((_, i) => i !== index);
          setIngredients(newIngredients);
        }}
        className="text-red-500"
        aria-label="remove ingredient"
      >
        &times;
      </button>
    </div>
  ));

  function addIngredient() {
    setIngredients([...ingredients, { name: '', quantity: 0, units: '' }]);
  }

  return (
    <div className="ingredients-input">
      <div className="flex gap-2 font-bold mb-2">
        <h3>Name</h3>
        <h3>Quantity</h3>
        <h3>Units</h3>
      </div>
      {inputRows}
      <Button text="Add Ingredient" onClick={addIngredient} ariaLabel="add ingredient" />
    </div>
  );
}
