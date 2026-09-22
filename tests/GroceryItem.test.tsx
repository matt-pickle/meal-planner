import { describe, test, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroceryList from '../src/pages/GroceryList';
import { renderWithUserData } from './userDataHarness';
import GroceryItem from '../src/components/GroceryItem';
import { type UserData } from '../src/utils/types';

describe('GroceryItem Component', () => {
  beforeEach(async () => {
    const mockUserData: UserData = {
      meals: [],
      schedule: [],
      groceryList: [
        { id: 'cheese', name: 'Cheese', quantity: 1, units: 'lbs', status: 'to buy' },
        { id: 'apples', name: 'Apples', quantity: 6, units: 'apples', status: 'bought' },
      ],
    };
    renderWithUserData(<GroceryList />, mockUserData);
    // Bought items are hidden until the section is expanded
    await userEvent.click(screen.getByRole('button', { name: 'toggle accordion' }));
  });

  test('renders all elements', async () => {
    const nameInput = screen.getAllByRole('textbox', { name: 'item name' });
    const quantityInput = screen.getAllByRole('spinbutton', { name: 'quantity' });
    const unitsInput = screen.getAllByRole('textbox', { name: 'units' });
    const statusCheckbox = screen.getAllByRole('checkbox', { name: 'mark as bought' });
    const deleteButton = screen.getAllByRole('button', { name: 'delete item' });

    expect(nameInput).toHaveLength(2);
    expect(quantityInput).toHaveLength(2);
    expect(unitsInput).toHaveLength(2);
    expect(statusCheckbox).toHaveLength(2);
    expect(deleteButton).toHaveLength(2);
  });

  test('updates item name on input change', async () => {
    const nameInput = screen.getByDisplayValue('Cheese');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Chicken');

    expect(nameInput).toHaveDisplayValue('Chicken');
  });

  test('updates item quantity on input change', async () => {
    const quantityInput = screen.getByDisplayValue('1');
    await userEvent.clear(quantityInput);
    await userEvent.type(quantityInput, '3');

    expect(quantityInput).toHaveValue(3);
  });

  test('updates item units on input change', async () => {
    const unitsInput = screen.getByDisplayValue('lbs');
    await userEvent.clear(unitsInput);
    await userEvent.type(unitsInput, 'kg');

    expect(unitsInput).toHaveDisplayValue('kg');
  });

  test('toggles item status when checked/unchecked', async () => {
    let groceryItem = screen.getByDisplayValue('Cheese').parentElement;
    let statusCheckbox = within(groceryItem!).getByRole('checkbox', { name: 'mark as bought' });
    const boughtSection = screen.getByTestId('accordion-content');

    expect(boughtSection).not.toContainElement(groceryItem);

    await userEvent.click(statusCheckbox);
    groceryItem = screen.getByDisplayValue('Cheese').parentElement;

    expect(boughtSection).toContainElement(groceryItem);

    statusCheckbox = within(groceryItem!).getByRole('checkbox', {
      name: 'mark as bought',
    });

    await userEvent.click(statusCheckbox);
    groceryItem = await screen.findByDisplayValue('Cheese');

    expect(boughtSection).not.toContainElement(groceryItem);
  });

  test('other items keep their checked state when one is toggled', async () => {
    const checkedFor = (name: string) => {
      const row = screen.getByDisplayValue(name).parentElement;
      return within(row!).getByRole('checkbox', { name: 'mark as bought' });
    };

    expect(checkedFor('Apples')).toBeChecked();

    // Move Cheese into the bought section and straight back out again
    await userEvent.click(checkedFor('Cheese'));
    await userEvent.click(checkedFor('Cheese'));

    expect(checkedFor('Cheese')).not.toBeChecked();
    expect(checkedFor('Apples')).toBeChecked();
  });

  test('gives each item its own checkbox, even when unnamed', async () => {
    const addItemButton = screen.getByRole('button', { name: 'add item' });
    await userEvent.click(addItemButton);
    await userEvent.click(addItemButton);

    const checkboxIds = screen
      .getAllByRole('checkbox', { name: 'mark as bought' })
      .map(checkbox => checkbox.id);
    expect(new Set(checkboxIds).size).toBe(checkboxIds.length);
  });

  test('deletes item on delete button click', async () => {
    const groceryItem = screen.getByDisplayValue('Cheese').parentElement;
    const deleteButton = within(groceryItem!).getByRole('button', { name: 'delete item' });

    await userEvent.click(deleteButton);
    expect(screen.queryByDisplayValue('Cheese')).not.toBeInTheDocument();
  });
});

// Regression: clearing the field stored NaN, which rendered as an empty but
// invalid value and was written to Firestore.
describe('GroceryItem quantity field', () => {
  test('clears the quantity instead of storing NaN', async () => {
    const setGroceryItems = vi.fn();
    const item = {
      id: 'cheese',
      name: 'Cheese',
      quantity: 1,
      units: 'lbs',
      status: 'to buy' as const,
    };
    render(<GroceryItem item={item} groceryItems={[item]} setGroceryItems={setGroceryItems} />);

    await userEvent.clear(screen.getByRole('spinbutton', { name: 'quantity' }));

    expect(setGroceryItems).toHaveBeenCalledWith([{ ...item, quantity: undefined }]);
  });
});

// Regression: new items are created with quantity undefined, so value={undefined}
// made the input uncontrolled until the user typed — React warns and the switch
// can drop the first keystroke.
describe('GroceryItem with no quantity', () => {
  test('renders an empty controlled quantity input', () => {
    const item = {
      id: 'blank',
      name: '',
      quantity: undefined,
      units: '',
      status: 'to buy' as const,
    };
    render(<GroceryItem item={item} groceryItems={[item]} setGroceryItems={vi.fn()} />);

    expect(screen.getByRole('spinbutton', { name: 'quantity' })).toHaveValue(null);
  });
});

// Issue 35: negative quantities were accepted and saved
describe('GroceryItem quantity bounds', () => {
  const item = {
    id: 'cheese',
    name: 'Cheese',
    quantity: 1,
    units: 'lbs',
    status: 'to buy' as const,
  };

  test('marks the field as non-negative for the browser', () => {
    render(<GroceryItem item={item} groceryItems={[item]} setGroceryItems={vi.fn()} />);

    expect(screen.getByRole('spinbutton', { name: 'quantity' })).toHaveAttribute('min', '0');
  });

  test('ignores a negative quantity', () => {
    const setGroceryItems = vi.fn();
    render(<GroceryItem item={item} groceryItems={[item]} setGroceryItems={setGroceryItems} />);

    fireEvent.change(screen.getByRole('spinbutton', { name: 'quantity' }), {
      target: { value: '-3' },
    });

    expect(setGroceryItems).not.toHaveBeenCalled();
  });
});
