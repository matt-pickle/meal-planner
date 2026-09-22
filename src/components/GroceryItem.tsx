import Checkbox from './Checkbox';
import { type GroceryItemType } from '../utils/types';

type Props = {
  item: GroceryItemType;
  groceryItems: Array<GroceryItemType>;
  setGroceryItems: (items: Array<GroceryItemType>) => void;
};

export default function GroceryItem({ item, groceryItems, setGroceryItems }: Props) {
  // Replace the item rather than editing it in place: these objects are the
  // ones held in the page's state, and editing them skips the re-render.
  function updateItem(changes: Partial<GroceryItemType>) {
    setGroceryItems(groceryItems.map(i => (i.id === item.id ? { ...i, ...changes } : i)));
  }

  function toggleStatus(checked: boolean) {
    updateItem({ status: checked ? 'bought' : 'to buy' });
  }

  return (
    <div className="grocery-item">
      <div className="flex flex-wrap items-center gap-2">
        <div className="pr-2">
          <Checkbox
            id={`checkbox-${item.id}`}
            ariaLabel={`mark as bought`}
            onChange={toggleStatus}
            size="20px"
            color="#e2e8f0"
            checked={item.status === 'bought'}
          />
        </div>
        <input
          aria-label="item name"
          type="text"
          placeholder="Butter"
          value={item.name}
          onChange={e => updateItem({ name: e.target.value })}
          className="bg-medium text-white rounded-md px-2 sm:px-3 py-2 placeholder:text-light/50 focus:outline-2 focus:outline-title min-w-0 flex-1 sm:w-1/2 sm:flex-none"
        />
        <button
          onClick={() => {
            const newItems = groceryItems.filter(i => i.id !== item.id);
            setGroceryItems(newItems);
          }}
          className="w-4 text-red-500 text-center cursor-pointer sm:order-last"
          aria-label="delete item"
        >
          &times;
        </button>
        <div className="flex gap-2 w-full pl-9 pr-6 sm:w-auto sm:flex-1 sm:pl-0 sm:pr-0">
          <input
            aria-label="quantity"
            type="number"
            min="0"
            placeholder="1"
            value={item.quantity ?? ''}
            onChange={e => {
              // parseFloat('') is NaN, which used to be stored, rendered and saved.
              // A negative quantity to buy is meaningless, so ignore it.
              const quantity = e.target.value === '' ? undefined : Number(e.target.value);
              if (quantity === undefined || (!Number.isNaN(quantity) && quantity >= 0)) {
                updateItem({ quantity: quantity });
              }
            }}
            className="bg-medium text-white rounded-md px-2 sm:px-3 py-2 placeholder:text-light/50 focus:outline-2 focus:outline-title w-1/3 sm:w-1/2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <input
            aria-label="units"
            type="text"
            placeholder="tbsp"
            value={item.units}
            onChange={e => updateItem({ units: e.target.value })}
            className="bg-medium text-white rounded-md px-2 sm:px-3 py-2 placeholder:text-light/50 focus:outline-2 focus:outline-title w-2/3 sm:w-1/2"
          />
        </div>
      </div>
    </div>
  );
}
