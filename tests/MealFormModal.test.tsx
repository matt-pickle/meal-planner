import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Meals from '../src/pages/Meals';
import MealFormModal from '../src/components/MealFormModal';
import { type UserData, type MealType } from '../src/utils/types';

describe('MealFormModal editing an existing meal', () => {
  // Meals no longer owns the list: App does. This harness plays App's part so
  // the page re-renders with the updated meals, as it does in the real app.
  function MealsHarness({ initialUserData }: { initialUserData: UserData }) {
    const [userData, setUserData] = useState<UserData>(initialUserData);
    return (
      <Meals
        userData={userData}
        setMeals={meals => setUserData(current => ({ ...current, meals }))}
      />
    );
  }

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
          ],
        },
      ],
      schedule: [{ date: Date.now(), breakfast: '', lunch: '', dinner: '' }],
      groceryList: [],
    };

    render(<MealsHarness initialUserData={mockUserData} />);
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

describe('MealFormModal meal matching', () => {
  // Regression: the modal used to find its meal with `m === meal`, which stops
  // matching as soon as the array holds equal-but-distinct objects (a refetch,
  // or any immutable update).
  test('edits the right meal when the object reference has changed', async () => {
    const meal: MealType = { id: 'spaghetti', name: 'Spaghetti', emoji: '🍝', ingredients: [] };
    const other: MealType = { id: 'tacos', name: 'Tacos', emoji: '🌮', ingredients: [] };
    const meals = [{ ...meal }, other];
    const setMeals = vi.fn();

    render(
      <MealFormModal
        title="Edit Meal"
        initialMeal={meal}
        meals={meals}
        onClose={vi.fn()}
        onSave={meal => setMeals(meals.map(m => (m.id === meal.id ? meal : m)))}
      />
    );
    await userEvent.clear(screen.getByLabelText(/Meal Name/));
    await userEvent.type(screen.getByLabelText(/Meal Name/), 'Linguine');
    await userEvent.click(screen.getByRole('button', { name: 'save meal' }));

    expect(setMeals).toHaveBeenCalledWith([
      { id: 'spaghetti', name: 'Linguine', emoji: '🍝', ingredients: [] },
      other,
    ]);
  });
});

// Regression: IngredientsInput edited ingredient objects in place, and the
// modal seeded its state from meal.ingredients — the very objects held in
// userData. Typing applied the change immediately, and Cancel left it applied.
describe('MealFormModal cancelling', () => {
  const storedMeal: MealType = {
    id: 'spaghetti',
    name: 'Spaghetti',
    emoji: '🍝',
    ingredients: [{ name: 'Noodles', quantity: 1, units: 'boxes' }],
  };

  test('leaves the stored meal untouched while the user types', async () => {
    const setMeals = vi.fn();
    render(
      <MealFormModal
        title="Edit Meal"
        initialMeal={storedMeal}
        meals={[storedMeal]}
        onClose={vi.fn()}
        onSave={meal => setMeals([storedMeal].map(m => (m.id === meal.id ? meal : m)))}
      />
    );

    await userEvent.clear(screen.getByRole('textbox', { name: 'ingredient name' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'ingredient name' }), 'Linguine');

    expect(storedMeal.ingredients[0].name).toBe('Noodles');
    expect(setMeals).not.toHaveBeenCalled();
  });

  test('discards ingredient edits on cancel', async () => {
    const setMeals = vi.fn();
    const setOpen = vi.fn();
    render(
      <MealFormModal
        title="Edit Meal"
        initialMeal={storedMeal}
        meals={[storedMeal]}
        onClose={setOpen}
        onSave={meal => setMeals([storedMeal].map(m => (m.id === meal.id ? meal : m)))}
      />
    );

    await userEvent.clear(screen.getByRole('spinbutton', { name: 'ingredient quantity' }));
    await userEvent.type(screen.getByRole('spinbutton', { name: 'ingredient quantity' }), '9');
    await userEvent.click(screen.getByRole('button', { name: 'cancel' }));

    expect(setOpen).toHaveBeenCalledTimes(1);
    expect(setMeals).not.toHaveBeenCalled();
    expect(storedMeal.ingredients[0].quantity).toBe(1);
  });
});
