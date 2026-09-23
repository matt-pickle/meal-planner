import { describe, test, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroceryItem from '../src/components/GroceryItem';
import { type GroceryItemType } from '../src/utils/types';

// Regression: new items are created with quantity undefined, so
// value={item.quantity} left the input uncontrolled until the user typed.
// React warns about the switch, and it can drop the first keystroke.
//
// This lives in its own file on purpose: React logs that warning only once per
// module instance, so a test sharing a file with anything else that renders a
// GroceryItem would see the warning already spent and pass either way.
describe('GroceryItem quantity input is always controlled', () => {
  function Harness() {
    const [items, setItems] = useState<Array<GroceryItemType>>([
      { id: 'cheese', name: 'Cheese', quantity: undefined, units: 'lbs', status: 'to buy' },
    ]);
    return (
      <GroceryItem
        item={items[0]}
        updateItem={(id, changes) =>
          setItems(current =>
            current.map(item => (item.id === id ? { ...item, ...changes } : item)),
          )
        }
        removeItem={vi.fn()}
      />
    );
  }

  test('does not warn when a quantity is first typed', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<Harness />);

    await userEvent.type(screen.getByRole('spinbutton', { name: 'quantity' }), '5');

    const messages = consoleError.mock.calls.map(call => String(call[0]));
    expect(messages.filter(message => /uncontrolled/i.test(message))).toEqual([]);
    consoleError.mockRestore();
  });

  test('keeps every keystroke', async () => {
    render(<Harness />);

    await userEvent.type(screen.getByRole('spinbutton', { name: 'quantity' }), '5');

    expect(screen.getByRole('spinbutton', { name: 'quantity' })).toHaveValue(5);
  });
});
