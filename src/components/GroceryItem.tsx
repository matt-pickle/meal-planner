import Checkbox from './Checkbox';
import { type GroceryItemType } from '../utils/types';

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
      <div className="flex flex-wrap items-center gap-2">
        <div className="pr-2">
          <Checkbox
            id={`checkbox-${groceryItems.indexOf(item)}`}
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
          onChange={e => {
            const newItems = [...groceryItems];
            const thisItem = newItems.find(i => i === item);
            if (thisItem) {
              thisItem.name = e.target.value;
            }
            setGroceryItems(newItems);
          }}
          className="bg-medium text-white rounded-md px-2 sm:px-3 py-2 placeholder:text-light/50 focus:outline-2 focus:outline-title min-w-0 flex-1 sm:w-1/2 sm:flex-none"
        />
        <button
          onClick={() => {
            const newItems = groceryItems.filter(i => i !== item);
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
            className="bg-medium text-white rounded-md px-2 sm:px-3 py-2 placeholder:text-light/50 focus:outline-2 focus:outline-title w-1/3 sm:w-1/2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
            className="bg-medium text-white rounded-md px-2 sm:px-3 py-2 placeholder:text-light/50 focus:outline-2 focus:outline-title w-2/3 sm:w-1/2"
          />
        </div>
      </div>
    </div>
  );
}
