import Button from './Button';
import { type Ingredient } from '../utils/types';

type Props = {
  ingredients: Array<Ingredient>;
  setIngredients: (ingredients: Array<Ingredient>) => void;
};

export default function IngredientsInput({ ingredients, setIngredients }: Props) {
  // Replace the row rather than editing it in place: these objects can be the
  // same ones held in userData, where an in-place edit applies immediately and
  // survives Cancel.
  function updateIngredient(index: number, changes: Partial<Ingredient>) {
    setIngredients(
      ingredients.map((ingredient, i) =>
        i === index ? { ...ingredient, ...changes } : ingredient,
      ),
    );
  }

  const inputRows = ingredients.map((ingredient, index) => (
    <div key={index} className="flex gap-2 mb-2">
      <input
        aria-label="ingredient name"
        type="text"
        placeholder="Butter"
        value={ingredient.name}
        onChange={e => updateIngredient(index, { name: e.target.value })}
        className="bg-medium text-white rounded-md px-3 py-2 placeholder:text-light/50 focus:outline-2 focus:outline-title w-1/2"
      />
      <input
        aria-label="ingredient quantity"
        type="number"
        min="0"
        placeholder="1"
        value={ingredient.quantity ?? ''}
        onChange={e => {
          // parseFloat('') is NaN, which used to be stored, rendered and saved.
          // A negative amount of an ingredient is meaningless, so ignore it.
          const quantity = e.target.value === '' ? undefined : Number(e.target.value);
          if (quantity === undefined || (!Number.isNaN(quantity) && quantity >= 0)) {
            updateIngredient(index, { quantity: quantity });
          }
        }}
        className="bg-medium text-white rounded-md px-3 py-2 placeholder:text-light/50 focus:outline-2 focus:outline-title w-1/4"
      />
      <input
        aria-label="ingredient units"
        type="text"
        placeholder="tbsp"
        value={ingredient.units}
        onChange={e => updateIngredient(index, { units: e.target.value })}
        className="bg-medium text-white rounded-md px-3 py-2 placeholder:text-light/50 focus:outline-2 focus:outline-title w-1/4"
      />
      <button
        onClick={() => {
          const newIngredients = ingredients.filter((_, i) => i !== index);
          setIngredients(newIngredients);
        }}
        className="text-red-500 cursor-pointer px-1"
        aria-label="remove ingredient"
      >
        &times;
      </button>
    </div>
  ));

  function addIngredient() {
    // No quantity rather than 0, as new grocery items do: an untouched 0 reads
    // as "none needed"
    setIngredients([...ingredients, { name: '', quantity: undefined, units: '' }]);
  }

  return (
    <div className="ingredients-input">
      <div className="flex gap-2 text-light text-sm font-semibold mb-1">
        <h3 className="w-1/2">Name</h3>
        <h3 className="w-1/4">Quantity</h3>
        <h3 className="w-1/4">Units</h3>
      </div>
      {inputRows}
      <Button
        text="Add Ingredient"
        onClick={addIngredient}
        ariaLabel="add ingredient"
        classOverrides="text-sm mt-1"
      />
    </div>
  );
}
