import Button from './Button';
import { type UserData, type GroceryItemType } from '../utils/types';

type Props = {
  item: GroceryItemType;
  groceryItems: Array<GroceryItemType>;
  setGroceryItems: (items: Array<GroceryItemType>) => void;
};

export default function GroceryItem({ item, groceryItems, setGroceryItems }: Props) {

  return (
    <div className="grocery-item">
      <div className="flex gap-2">
        <input
          aria-label="item name"
          type="text"
          placeholder="Butter"
          value={item.name}
          onChange={e => {
            const newItems = [...groceryItems];
            const thisItem = newItems.find(i => i === item);
            if (thisItem) {
              thisItem.name = e.target.value;
            }
            setGroceryItems(newItems);
          }}
          className="border p-1 rounded w-1/2"
        />
        <input
          aria-label="quantity"
          type="number"
          placeholder="1"
          value={item.quantity}
          onChange={e => {
            const newItems = [...groceryItems];
            const thisItem = newItems.find(i => i === item);
            if (thisItem) {
              thisItem.quantity = parseFloat(e.target.value);
            }
            setGroceryItems(newItems);
          }}
          className="border p-1 rounded w-1/4"
        />
        <input
          aria-label="units"
          type="text"
          placeholder="tbsp"
          value={item.units}
          onChange={e => {
            const newItems = [...groceryItems];
            const thisItem = newItems.find(i => i === item);
            if (thisItem) {
              thisItem.units = e.target.value;
            }
            setGroceryItems(newItems);
          }}
          className="border p-1 rounded w-1/4"
        />
        <button
          onClick={() => {
            const newItems = groceryItems.filter((i) => i !== item);
            setGroceryItems(newItems);
          }}
          className="text-red-500"
          aria-label="remove item"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
