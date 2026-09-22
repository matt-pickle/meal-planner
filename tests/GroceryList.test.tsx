import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, fireEvent, screen, within } from '@testing-library/react';
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
      schedule: [
        { date: Date.now() + 86400000, breakfast: '', lunch: 'spaghetti', dinner: 'hamburger' },
      ],
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
    const addIngredientsButton = screen.getByRole('button', {
      name: 'add ingredients from upcoming meals',
    });
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
    const addIngredientsButton = screen.getByRole('button', {
      name: 'add ingredients from upcoming meals',
    });
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

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(updateUserData).not.toHaveBeenCalled();
  });

  test('still writes once the user pauses', () => {
    vi.useFakeTimers();
    renderWithUserData(<GroceryList />, savedList);

    fireEvent.click(screen.getByRole('button', { name: 'add item' }));
    expect(updateUserData).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(updateUserData).toHaveBeenCalledTimes(1);
    expect(vi.mocked(updateUserData).mock.calls[0][1].groceryList).toHaveLength(2);
  });

  // The debounce must not cost the user an edit when they move on
  test('writes the pending edit when the user navigates away from the page', async () => {
    const { unmount } = renderWithUserData(<GroceryList />, savedList);

    await userEvent.click(screen.getByRole('button', { name: 'add item' }));
    expect(updateUserData).not.toHaveBeenCalled();

    unmount();

    expect(updateUserData).toHaveBeenCalledTimes(1);
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
      screen.getByRole('button', { name: 'add ingredients from upcoming meals' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'confirm add ingredients' }));

    const quantity = screen.getByRole('spinbutton', { name: 'quantity' });
    expect(quantity).toHaveValue(3);
  });

  // Issue 6: `undefined ?? 0` on both sides turned "no amount" into 0, which
  // reads as "buy none".
  const noAmountSalt: UserData['meals'] = [
    {
      id: 'soup',
      name: 'Soup',
      emoji: '🍲',
      ingredients: [{ name: 'Salt', quantity: undefined, units: 'pinch' }],
    },
    {
      id: 'stew',
      name: 'Stew',
      emoji: '🥘',
      ingredients: [{ name: 'Salt', quantity: undefined, units: 'pinch' }],
    },
  ];

  async function addFromMeals() {
    await userEvent.click(
      screen.getByRole('button', { name: 'add ingredients from upcoming meals' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'confirm add ingredients' }));
  }

  test('leaves the quantity empty when an ingredient without one appears twice', async () => {
    renderWithUserData(<GroceryList />, {
      meals: noAmountSalt,
      schedule: [{ date: midnightPlus(1), breakfast: 'soup', lunch: 'stew', dinner: '' }],
      groceryList: [],
    });

    await addFromMeals();

    expect(screen.getByRole('spinbutton', { name: 'quantity' })).toHaveValue(null);
  });

  test('leaves the quantity empty when merging into an item without one', async () => {
    renderWithUserData(<GroceryList />, {
      meals: noAmountSalt,
      schedule: [{ date: midnightPlus(1), breakfast: 'soup', lunch: '', dinner: '' }],
      groceryList: [
        { id: 'salt', name: 'Salt', quantity: undefined, units: 'pinch', status: 'to buy' },
      ],
    });

    await addFromMeals();

    expect(screen.getByRole('spinbutton', { name: 'quantity' })).toHaveValue(null);
  });

  test('keeps the amount when only one side has one', async () => {
    renderWithUserData(<GroceryList />, {
      meals: noAmountSalt,
      schedule: [{ date: midnightPlus(1), breakfast: 'soup', lunch: '', dinner: '' }],
      groceryList: [{ id: 'salt', name: 'Salt', quantity: 2, units: 'pinch', status: 'to buy' }],
    });

    await addFromMeals();

    expect(screen.getByRole('spinbutton', { name: 'quantity' })).toHaveValue(2);
  });
});

// Issue 40: the merges scanned what had been gathered so far for every
// ingredient. They are keyed lookups now, which must keep the same matching.
describe('GroceryList ingredient matching', () => {
  function midnightPlus(days: number) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return date.getTime();
  }

  async function addFromMeals() {
    await userEvent.click(
      screen.getByRole('button', { name: 'add ingredients from upcoming meals' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'confirm add ingredients' }));
  }

  test('keeps the same ingredient in different units apart', async () => {
    renderWithUserData(<GroceryList />, {
      meals: [
        {
          id: 'cake',
          name: 'Cake',
          emoji: '🍰',
          ingredients: [
            { name: 'Milk', quantity: 2, units: 'cups' },
            { name: 'Milk', quantity: 1, units: 'litres' },
          ],
        },
      ],
      schedule: [{ date: midnightPlus(1), breakfast: 'cake', lunch: '', dinner: '' }],
      groceryList: [],
    });

    await addFromMeals();

    const quantities = screen
      .getAllByRole('spinbutton', { name: 'quantity' })
      .map(input => (input as HTMLInputElement).value);
    expect(quantities).toEqual(['2', '1']);
  });

  // Issue 7: matching was exact, so "Eggs" and "eggs " became separate rows
  test('matches ingredients regardless of case and surrounding spaces', async () => {
    renderWithUserData(<GroceryList />, {
      meals: [
        {
          id: 'omelette',
          name: 'Omelette',
          emoji: '🍳',
          ingredients: [{ name: 'Eggs', quantity: 3, units: 'eggs' }],
        },
        {
          id: 'cake',
          name: 'Cake',
          emoji: '🍰',
          ingredients: [{ name: 'eggs ', quantity: 2, units: ' Eggs' }],
        },
      ],
      schedule: [{ date: midnightPlus(1), breakfast: 'omelette', lunch: 'cake', dinner: '' }],
      groceryList: [],
    });

    await addFromMeals();

    // one row, spelled as it first appeared
    expect(screen.getByRole('textbox', { name: 'item name' })).toHaveValue('Eggs');
    expect(screen.getByRole('textbox', { name: 'units' })).toHaveValue('eggs');
    expect(screen.getByRole('spinbutton', { name: 'quantity' })).toHaveValue(5);
  });

  test('merges into a list item that differs only in case and spaces', async () => {
    renderWithUserData(<GroceryList />, {
      meals: [
        {
          id: 'omelette',
          name: 'Omelette',
          emoji: '🍳',
          ingredients: [{ name: ' eggs', quantity: 3, units: 'EGGS' }],
        },
      ],
      schedule: [{ date: midnightPlus(1), breakfast: 'omelette', lunch: '', dinner: '' }],
      groceryList: [{ id: 'eggs', name: 'Eggs', quantity: 1, units: 'eggs', status: 'to buy' }],
    });

    await addFromMeals();

    expect(screen.getByRole('textbox', { name: 'item name' })).toHaveValue('Eggs');
    expect(screen.getByRole('spinbutton', { name: 'quantity' })).toHaveValue(4);
  });

  test('totals the same ingredient across several scheduled meals', async () => {
    renderWithUserData(<GroceryList />, {
      meals: [
        {
          id: 'soup',
          name: 'Soup',
          emoji: '🍲',
          ingredients: [{ name: 'Salt', quantity: 1, units: 'tsp' }],
        },
        {
          id: 'stew',
          name: 'Stew',
          emoji: '🥘',
          ingredients: [{ name: 'Salt', quantity: 2, units: 'tsp' }],
        },
      ],
      schedule: [
        { date: midnightPlus(1), breakfast: 'soup', lunch: 'stew', dinner: 'soup' },
        { date: midnightPlus(2), breakfast: 'stew', lunch: '', dinner: '' },
      ],
      groceryList: [],
    });

    await addFromMeals();

    // 1 + 2 + 1 + 2
    expect(screen.getByRole('spinbutton', { name: 'quantity' })).toHaveValue(6);
  });

  test('merges into the first matching item when the list has duplicates', async () => {
    renderWithUserData(<GroceryList />, {
      meals: [
        {
          id: 'soup',
          name: 'Soup',
          emoji: '🍲',
          ingredients: [{ name: 'Salt', quantity: 5, units: 'tsp' }],
        },
      ],
      schedule: [{ date: midnightPlus(1), breakfast: 'soup', lunch: '', dinner: '' }],
      groceryList: [
        { id: 'a', name: 'Salt', quantity: 1, units: 'tsp', status: 'to buy' },
        { id: 'b', name: 'Salt', quantity: 100, units: 'tsp', status: 'to buy' },
      ],
    });

    await addFromMeals();

    const quantities = screen
      .getAllByRole('spinbutton', { name: 'quantity' })
      .map(input => (input as HTMLInputElement).value);
    expect(quantities).toEqual(['6', '100']);
  });

  // Regression: a bought item matched like any other, so the new quantity was
  // added to a row under Bought Items and nothing appeared under Items to Buy.
  test('moves a matching bought item back to Items to Buy with the new quantity', async () => {
    renderWithUserData(<GroceryList />, {
      meals: [
        {
          id: 'cereal',
          name: 'Cereal',
          emoji: '🥣',
          ingredients: [{ name: 'Milk', quantity: 2, units: 'gallons' }],
        },
      ],
      schedule: [{ date: midnightPlus(1), breakfast: 'cereal', lunch: '', dinner: '' }],
      groceryList: [{ id: 'milk', name: 'Milk', quantity: 1, units: 'gallons', status: 'bought' }],
    });

    await addFromMeals();

    // Bought Items is collapsed, so only rows under Items to Buy are accessible
    expect(screen.getByRole('textbox', { name: 'item name' })).toHaveValue('Milk');
    expect(screen.getByRole('spinbutton', { name: 'quantity' })).toHaveValue(2);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(screen.getAllByRole('textbox', { name: 'item name', hidden: true })).toHaveLength(1);
  });

  test('adds to a matching item still to buy rather than a bought duplicate', async () => {
    renderWithUserData(<GroceryList />, {
      meals: [
        {
          id: 'cereal',
          name: 'Cereal',
          emoji: '🥣',
          ingredients: [{ name: 'Milk', quantity: 2, units: 'gallons' }],
        },
      ],
      schedule: [{ date: midnightPlus(1), breakfast: 'cereal', lunch: '', dinner: '' }],
      groceryList: [
        { id: 'old', name: 'Milk', quantity: 1, units: 'gallons', status: 'bought' },
        { id: 'new', name: 'Milk', quantity: 3, units: 'gallons', status: 'to buy' },
      ],
    });

    await addFromMeals();

    expect(screen.getByRole('spinbutton', { name: 'quantity' })).toHaveValue(5);
    const bought = within(screen.getByTestId('accordion-content'));
    expect(bought.getByRole('spinbutton', { name: 'quantity', hidden: true })).toHaveValue(1);
  });
});
