import Button from './Button';
import Checkbox from './Checkbox';
import { type UserData, type GroceryItemType } from '../utils/types';
import { className } from '../utils/utils';

type Props = {
  item: GroceryItemType;
  groceryItems: Array<GroceryItemType>;
  setGroceryItems: (items: Array<GroceryItemType>) => void;
};

export default function GroceryItem({ item, groceryItems, setGroceryItems }: Props) {
  function toggleStatus(checked: boolean) {
    const newItems = [...groceryItems];
    const thisItem = newItems.find(i => i === item);
    if (thisItem && checked) {
      thisItem.status = 'bought';
    } else if (thisItem) {
      thisItem.status = 'to buy';
    }
    setGroceryItems(newItems);
  }

  return (
    <div className="grocery-item">
      <div className="flex gap-2">
        <Checkbox
          id={`checkbox-${className(item.name)}`}
          ariaLabel={`mark as bought`}
          onChange={toggleStatus}
          size="16px"
          color="#000000"
          initialChecked={item.status === 'bought'}
        />
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
            const newItems = groceryItems.filter(i => i !== item);
            setGroceryItems(newItems);
          }}
          className="text-red-500"
          aria-label="delete item"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
