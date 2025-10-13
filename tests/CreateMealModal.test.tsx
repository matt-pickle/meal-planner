import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Meals from '../src/pages/Meals';
import { type UserData } from '../src/utils/types';

describe('CreateMealModal Component', () => {

  beforeEach(async () => {
    const mockUser: any = { uid: '123', email: 'test@example.com' };
    const mockUserData: UserData = {
      meals: [
        { name: 'Eggs', emoji: '🥚', ingredients: [] },
        { name: 'Salad', emoji: '🥗', ingredients: [] },
        { name: 'Hot dogs', emoji: '🌭', ingredients: [] },
      ],
      schedule: [{ date: Date.now(), breakfast: '', lunch: '', dinner: '' }],
      groceryList: [],
    };

    render(<Meals userData={mockUserData} user={mockUser} />);
    const createButton = screen.getByRole('button', { name: 'add new meal' });
    await userEvent.click(createButton);
  });

  test('renders all inputs', () => {
    const chooseEmojiButton = screen.getByRole('button', { name: 'choose emoji' });
    const nameInput = screen.getByLabelText(/Meal Name/);
    const addIngredientButton = screen.getByRole('button', { name: 'add ingredient' });

    expect(chooseEmojiButton).toBeVisible();
    expect(nameInput).toBeVisible();
    expect(addIngredientButton).toBeVisible();
  });

  test('modal closes on cancel', async () => {
    const title = screen.getByText(/Create New Meal/);
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
    const modalTitle = screen.getByText(/Create New Meal/);
    const nameInput = screen.getByLabelText(/Meal Name/);
    // const chooseEmojiButton = screen.getByRole('button', { name: 'choose emoji' });
    const addIngredientButton = screen.getByRole('button', { name: 'add ingredient' });

    await userEvent.type(nameInput, 'Pancakes');
    // await userEvent.click(chooseEmojiButton);
    // const pancakeEmoji = screen.getByRole('button', { name: 'pancakes' });
    // await userEvent.click(pancakeEmoji);
    await userEvent.click(addIngredientButton);
    const ingredientNameInput = screen.getByRole('textbox', { name: 'ingredient name' });
    const quantityInput = screen.getByRole('spinbutton', { name: 'ingredient quantity' });
    const unitsInput = screen.getByRole('textbox', { name: 'ingredient units' });
    await userEvent.type(ingredientNameInput, 'Milk');
    await userEvent.type(quantityInput, '1');
    await userEvent.type(unitsInput, 'cup');

    const saveButton = screen.getByRole('button', { name: 'save meal' });
    await userEvent.click(saveButton);

    expect(modalTitle).not.toBeVisible();
    const pancakes = screen.getByText(/Pancakes/);
    expect(pancakes).toBeVisible();
  });
});