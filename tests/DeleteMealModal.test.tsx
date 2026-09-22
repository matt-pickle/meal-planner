import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Meals from '../src/pages/Meals';
import { renderWithUserData } from './userDataHarness';
import DeleteMealModal from '../src/components/DeleteMealModal';
import { type UserData, type MealType } from '../src/utils/types';

describe('DeleteMealModal Component', () => {
  beforeEach(async () => {
    const mockUserData: UserData = {
      meals: [
        {
          id: 'spaghetti',
          name: 'Spaghetti',
          emoji: '🍝',
          ingredients: [],
        },
      ],
      schedule: [{ date: Date.now(), breakfast: '', lunch: '', dinner: '' }],
      groceryList: [],
    };

    renderWithUserData(<Meals />, mockUserData);
    const deleteButton = screen.getByRole('button', { name: 'delete' });
    await userEvent.click(deleteButton);
  });

  test('renders all elements', () => {
    const title = screen.getByText(/Delete Meal/);
    const message = screen.getByText(/Are you sure you want to delete the meal "Spaghetti"\?/);
    const cancelButton = screen.getByRole('button', { name: 'cancel' });
    const deleteButton = screen.getByRole('button', { name: 'delete meal' });

    expect(title).toBeVisible();
    expect(message).toBeVisible();
    expect(cancelButton).toBeVisible();
    expect(deleteButton).toBeVisible();
  });

  test('modal closes on cancel', async () => {
    const title = screen.getByText(/Delete Meal/);
    const cancelButton = screen.getByRole('button', { name: 'cancel' });
    await userEvent.click(cancelButton);

    expect(title).not.toBeVisible();
  });

  test('deletes meal on submit', async () => {
    const modalTitle = screen.getByText(/Delete Meal/);
    const deleteMealButton = screen.getByRole('button', { name: 'delete meal' });

    await userEvent.click(deleteMealButton);

    expect(modalTitle).not.toBeVisible();
    const deletedMeal = screen.queryByText(/Spaghetti/);
    expect(deletedMeal).not.toBeInTheDocument();
  });
});

describe('DeleteMealModal meal matching', () => {
  // Regression: `m !== meal` silently deleted nothing once the array held
  // equal-but-distinct objects.
  test('deletes the right meal when the object reference has changed', async () => {
    const meal: MealType = { id: 'spaghetti', name: 'Spaghetti', emoji: '🍝', ingredients: [] };
    const other: MealType = { id: 'tacos', name: 'Tacos', emoji: '🌮', ingredients: [] };
    const setMeals = vi.fn();

    render(
      <DeleteMealModal
        meal={meal}
        meals={[{ ...meal }, other]}
        setDeleteMealModalIsOpen={vi.fn()}
        setMeals={setMeals}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'delete meal' }));

    expect(setMeals).toHaveBeenCalledWith([other]);
  });
});
