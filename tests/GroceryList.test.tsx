import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroceryList from '../src/pages/GroceryList';
import { type UserData } from '../src/utils/types';

describe('GroceryList Component', () => {
  beforeEach(async () => {
    const mockUser: any = { uid: '123', email: 'test@example.com' };
    const mockUserData: UserData = {
      meals: [
        {
          name: 'Spaghetti',
          emoji: '🍝',
          ingredients: [
            { name: 'Noodles', quantity: 1, units: 'boxes' },
            { name: 'Sauce', quantity: 2, units: 'jars' },
            { name: 'Ground Beef', quantity: 2, units: 'lbs' },
          ],
        },
        {
          name: 'Hamburger',
          emoji: '🍔',
          ingredients: [
            { name: 'Buns', quantity: 1, units: 'package' },
            { name: 'Ground Beef', quantity: 2, units: 'lbs' },
          ],
        },
      ],
      schedule: [{ date: Date.now() + 86400000, breakfast: '', lunch: '🍝 Spaghetti', dinner: '🍔 Hamburger' }],
      groceryList: [
        { name: 'Cheese', quantity: 1, units: 'lbs', status: 'to buy' },
        { name: 'Apples', quantity: 6, units: 'apples', status: 'bought' },
      ],
    };

    render(<GroceryList userData={mockUserData} user={mockUser} />);
  });

  test('renders all elements', async () => {
    const title = screen.getByText(/Grocery List/);
    const addItemButton = screen.getByRole('button', { name: 'add item' });
    const addIngredientsButton = screen.getByRole('button', { name: 'add ingredients from upcoming meals' });
    const toBuySection = screen.getByText(/Items to Buy/);
    const cheeseItem = screen.getByText(/Cheese/);
    const applesItem = screen.getByText(/Apples/);
    const boughtSection = screen.getByText(/Bought Items/);
    const boughtToggle = screen.getByRole('button', { name: 'toggle bought items' });

    expect(title).toBeVisible();
    expect(addItemButton).toBeVisible();
    expect(addIngredientsButton).toBeVisible();
    expect(toBuySection).toBeVisible();
    expect(cheeseItem).toBeVisible();
    expect(applesItem).toBeVisible();
    expect(boughtSection).toBeVisible();
    expect(boughtToggle).toBeVisible();
  });

  test('Toggles bought items section on toggle click', async () => {
    const boughtSection = screen.getByText(/Bought Items/);
    const boughtToggle = screen.getByRole('button', { name: 'toggle bought items' });
    const applesItem = screen.getByText(/Apples/);

    // Initially visible
    expect(applesItem).toBeVisible();

    // Click to hide
    await userEvent.click(boughtToggle);
    expect(boughtSection).toHaveClass('opacity-50');
    expect(applesItem).not.toBeVisible();

    // Click to show
    await userEvent.click(boughtToggle);
    expect(boughtSection).toHaveClass('opacity-100');
    expect(applesItem).toBeVisible();
  });

  test('Opens add item modal on add item button click', async () => {
    const addItemButton = screen.getByRole('button', { name: 'add item' });
    await userEvent.click(addItemButton);
    const modalTitle = screen.getByText(/Add Grocery Item/);
    expect(modalTitle).toBeVisible();
  });

  test('Adds ingredients on "Add Ingredients from Upcoming Meals" click', async () => {
    const addIngredientsButton = screen.getByRole('button', { name: 'add ingredients from upcoming meals' });
    await userEvent.click(addIngredientsButton);

    expect(screen.getByText(/Noodles/)).toBeVisible();
    expect(screen.getByText(/Sauce/)).toBeVisible();
    expect(screen.getByText(/Buns/)).toBeVisible();
    expect(screen.getByText(/Ground Beef/)).toBeVisible();
    expect(screen.getByText(/4 lbs/)).toBeVisible();
  });
});