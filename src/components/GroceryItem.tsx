import { memo } from 'react';
import Checkbox from './Checkbox';
import { type GroceryItemType } from '../utils/types';
import { parseQuantity } from '../utils/utils';
import { INPUT_CLASS } from './styles';

type Props = {
  item: GroceryItemType;
  // Both keep one identity for the life of the list, so with memo below a row
  // re-renders only when its own item changes, not on every edit to another
  updateItem: (id: string, changes: Partial<GroceryItemType>) => void;
  removeItem: (id: string) => void;
};

export default memo(function GroceryItem({ item, updateItem, removeItem }: Props) {
  function update(changes: Partial<GroceryItemType>) {
    updateItem(item.id, changes);
  }

  function toggleStatus(checked: boolean) {
    update({ status: checked ? 'bought' : 'to buy' });
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
          onChange={e => update({ name: e.target.value })}
          className={`${INPUT_CLASS} px-2 sm:px-3 min-w-0 flex-1 sm:w-1/2 sm:flex-none`}
        />
        <button
          onClick={() => removeItem(item.id)}
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
              const quantity = parseQuantity(e.target.value);
              if (quantity !== null) update({ quantity });
            }}
            className={`${INPUT_CLASS} px-2 sm:px-3 w-1/3 sm:w-1/2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
          />
          <input
            aria-label="units"
            type="text"
            placeholder="tbsp"
            value={item.units}
            onChange={e => update({ units: e.target.value })}
            className={`${INPUT_CLASS} px-2 sm:px-3 w-2/3 sm:w-1/2`}
          />
        </div>
      </div>
    </div>
  );
});
