import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroceryList from '../src/pages/GroceryList';
import { renderWithUserData } from './userDataHarness';
import { updateUserData } from '../firebase/firebase';
import { type UserData } from '../src/utils/types';

describe('GroceryList Component', () => {
  beforeEach(async () => {
    const mockUserData: UserData = {
      meals: [
        {
          id: 'spaghetti',
          name: 'Spaghetti',
          emoji: '🍝',
          ingredients: [
            { name: 'Noodles', quantity: 1, units: 'boxes' },
            { name: 'Sauce', quantity: 2, units: 'jars' },
            { name: 'Ground Beef', quantity: 2, units: 'lbs' },
          ],
        },
        {
          id: 'hamburger',
          name: 'Hamburger',
          emoji: '🍔',
          ingredients: [
            { name: 'Buns', quantity: 1, units: 'package' },
            { name: 'Ground Beef', quantity: 2, units: 'lbs' },
          ],
        },
      ],
      schedule: [{ date: Date.now() + 86400000, breakfast: '', lunch: 'spaghetti', dinner: 'hamburger' }],
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
    const title = screen.getByText(/Grocery List/);
    const addItemButton = screen.getByRole('button', { name: 'add item' });
    const addIngredientsButton = screen.getByRole('button', { name: 'add ingredients from upcoming meals' });
    const toBuySection = screen.getByText(/Items to Buy/);
    const cheeseItem = screen.getByDisplayValue(/Cheese/);
    const applesItem = screen.getByDisplayValue(/Apples/);
    const boughtSection = screen.getByText(/Bought Items/);
    const boughtToggle = screen.getByRole('button', { name: 'toggle accordion' });

    expect(title).toBeVisible();
    expect(addItemButton).toBeVisible();
    expect(addIngredientsButton).toBeVisible();
    expect(toBuySection).toBeVisible();
    expect(cheeseItem).toBeVisible();
    expect(applesItem).toBeVisible();
    expect(boughtSection).toBeVisible();
    expect(boughtToggle).toBeVisible();
  });

  test('Creates new Grocery Item on add item button click', async () => {
    const addItemButton = screen.getByRole('button', { name: 'add item' });
    await userEvent.click(addItemButton);
    const nameInputs = screen.getAllByRole('textbox', { name: 'item name' });
    const quantityInputs = screen.getAllByRole('spinbutton', { name: 'quantity' });
    const unitsInputs = screen.getAllByRole('textbox', { name: 'units' });

    expect(nameInputs).toHaveLength(3);
    expect(quantityInputs).toHaveLength(3);
    expect(unitsInputs).toHaveLength(3);
    expect(nameInputs[1]).toHaveDisplayValue('');
    expect(quantityInputs[1]).toHaveValue(null);
    expect(unitsInputs[1]).toHaveDisplayValue('');
  });

  test('Adds ingredients on "Add Ingredients from Upcoming Meals" click', async () => {
    const addIngredientsButton = screen.getByRole('button', { name: 'add ingredients from upcoming meals' });
    await userEvent.click(addIngredientsButton);
    await userEvent.click(screen.getByRole('button', { name: 'confirm add ingredients' }));

    expect(screen.getByDisplayValue(/Noodles/)).toBeVisible();
    expect(screen.getByDisplayValue(/Sauce/)).toBeVisible();
    expect(screen.getByDisplayValue(/Buns/)).toBeVisible();
    expect(screen.getByDisplayValue(/Ground Beef/)).toBeVisible();
    expect(screen.getByDisplayValue(/4/)).toBeVisible();
  });
});

// Regression: the 500 ms autosave also fired on mount. If the page mounted
// before userData arrived, it wrote an empty list over the user's saved one.
describe('GroceryList autosave', () => {
  const savedList: UserData = {
    meals: [],
    schedule: [],
    groceryList: [{ id: 'cheese', name: 'Cheese', quantity: 1, units: 'lbs', status: 'to buy' }],
  };

  beforeEach(() => {
    vi.mocked(updateUserData).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('does not write anything on mount', () => {
    vi.useFakeTimers();
    renderWithUserData(<GroceryList />, savedList);

    vi.advanceTimersByTime(2000);

    expect(updateUserData).not.toHaveBeenCalled();
  });

  test('still writes after the user changes something', async () => {
    const user = userEvent.setup();
    renderWithUserData(<GroceryList />, savedList);

    await user.click(screen.getByRole('button', { name: 'add item' }));

    await vi.waitFor(() => expect(updateUserData).toHaveBeenCalledTimes(1));
    expect(vi.mocked(updateUserData).mock.calls[0][1].groceryList).toHaveLength(2);
  });
});

// Issue 20: quantities were merged with a truthiness test, which treats 0 as
// missing. These pin the summing behaviour for both merge paths.
describe('GroceryList quantity merging', () => {

  function midnightPlus(days: number) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return date.getTime();
  }

  const userData: UserData = {
    meals: [
      {
        id: 'soup',
        name: 'Soup',
        emoji: '🍲',
        ingredients: [{ name: 'Salt', quantity: 0, units: 'tsp' }],
      },
      {
        id: 'stew',
        name: 'Stew',
        emoji: '🥘',
        ingredients: [{ name: 'Salt', quantity: 3, units: 'tsp' }],
      },
    ],
    schedule: [{ date: midnightPlus(1), breakfast: 'soup', lunch: 'stew', dinner: '' }],
    // an item already on the list with a quantity of 0
    groceryList: [{ id: 'salt', name: 'Salt', quantity: 0, units: 'tsp', status: 'to buy' }],
  };

  test('adds to an existing quantity of 0 rather than replacing it', async () => {
    renderWithUserData(<GroceryList />, userData);

    await userEvent.click(
      screen.getByRole('button', { name: 'add ingredients from upcoming meals' })
    );
    await userEvent.click(screen.getByRole('button', { name: 'confirm add ingredients' }));

    const quantity = screen.getByRole('spinbutton', { name: 'quantity' });
    expect(quantity).toHaveValue(3);
  });
});
