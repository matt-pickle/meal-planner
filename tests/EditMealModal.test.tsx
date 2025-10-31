import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Meals from '../src/pages/Meals';
import { type UserData } from '../src/utils/types';

describe('EditMealModal Component', () => {
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
          ],
        },
      ],
      schedule: [{ date: Date.now(), breakfast: '', lunch: '', dinner: '' }],
      groceryList: [],
    };

    render(<Meals userData={mockUserData} user={mockUser} />);
    const editButton = screen.getByRole('button', { name: 'edit' });
    await userEvent.click(editButton);
  });

  test('renders all elements', () => {
    const chooseEmojiButton = screen.getByRole('button', { name: 'choose emoji' });
    const nameInput = screen.getByLabelText(/Meal Name/);
    const firstIngredientNameInput = screen.getByDisplayValue(/Noodles/);
    const firstIngredientQuantityInput = screen.getByDisplayValue('1');
    const firstIngredientUnitsInput = screen.getByDisplayValue(/boxes/);
    const secondIngredientNameInput = screen.getByDisplayValue(/Sauce/);
    const secondIngredientQuantityInput = screen.getByDisplayValue('2');
    const secondIngredientUnitsInput = screen.getByDisplayValue(/jars/);
    const addIngredientButton = screen.getByRole('button', { name: 'add ingredient' });

    expect(chooseEmojiButton).toBeVisible();
    expect(nameInput).toBeVisible();
    expect(firstIngredientNameInput).toBeVisible();
    expect(firstIngredientQuantityInput).toBeVisible();
    expect(firstIngredientUnitsInput).toBeVisible();
    expect(secondIngredientNameInput).toBeVisible();
    expect(secondIngredientQuantityInput).toBeVisible();
    expect(secondIngredientUnitsInput).toBeVisible();
    expect(addIngredientButton).toBeVisible();
  });

  test('modal closes on cancel', async () => {
    const title = screen.getByText(/Edit Meal/);
    const cancelButton = screen.getByRole('button', { name: 'cancel' });
    await userEvent.click(cancelButton);

    expect(title).not.toBeVisible();
  });

  // test('opens emoji picker when choose emoji button is clicked', async () => {
  //   const chooseEmojiButton = screen.getByRole('button', { name: 'choose emoji' });
  //   await userEvent.click(chooseEmojiButton);
  // const emojiButtons = document.body.querySelectorAll('.epr-btn');
  // expect(emojiButtons.length).toBeGreaterThan(0);
  // });

  test('saves meal on submit', async () => {
    const modalTitle = screen.getByText(/Edit Meal/);
    const nameInput = screen.getByLabelText(/Meal Name/);
    // const chooseEmojiButton = screen.getByRole('button', { name: 'choose emoji' });

    await userEvent.type(nameInput, 'Pancakes');
    // await userEvent.click(chooseEmojiButton);
    // const pancakeEmoji = screen.getByRole('button', { name: 'pancakes' });
    // await userEvent.click(pancakeEmoji);
    const firstIngredientNameInput = screen.getByDisplayValue(/Noodles/);
    const firstIngredientQuantityInput = screen.getByDisplayValue('1');
    const firstIngredientUnitsInput = screen.getByDisplayValue(/boxes/);
    const secondIngredientNameInput = screen.getByDisplayValue(/Sauce/);
    const secondIngredientQuantityInput = screen.getByDisplayValue('2');
    const secondIngredientUnitsInput = screen.getByDisplayValue(/jars/);

    await userEvent.clear(firstIngredientNameInput);
    await userEvent.type(firstIngredientNameInput, 'Milk');
    await userEvent.clear(firstIngredientQuantityInput);
    await userEvent.type(firstIngredientQuantityInput, '1');
    await userEvent.clear(firstIngredientUnitsInput);
    await userEvent.type(firstIngredientUnitsInput, 'cups');

    await userEvent.clear(secondIngredientNameInput);
    await userEvent.type(secondIngredientNameInput, 'Eggs');
    await userEvent.clear(secondIngredientQuantityInput);
    await userEvent.type(secondIngredientQuantityInput, '2');
    await userEvent.clear(secondIngredientUnitsInput);
    await userEvent.type(secondIngredientUnitsInput, 'eggs');

    const saveButton = screen.getByRole('button', { name: 'save meal' });
    await userEvent.click(saveButton);

    expect(modalTitle).not.toBeVisible();
    const pancakes = screen.getByText(/Pancakes/);
    const milk = screen.getByText(/Milk/);
    const one = screen.getByText(/1/);
    const cups = screen.getByText(/cups/);
    const eggs = screen.getByText(/Eggs/);
    const two = screen.getByText(/2/);
    const eggUnits = screen.getByText(/eggs/);
    expect(pancakes).toBeVisible();
    expect(milk).toBeVisible();
    expect(eggs).toBeVisible();
    expect(one).toBeVisible();
    expect(cups).toBeVisible();
    expect(two).toBeVisible();
    expect(eggUnits).toBeVisible();
  });
});
