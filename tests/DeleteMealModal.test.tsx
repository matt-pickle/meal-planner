import { describe, test, expect, beforeEach } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Meals from '../src/pages/Meals';
import { type UserData } from '../src/utils/types';

describe('DeleteMealModal Component', () => {
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
          name: 'Spaghetti',
          emoji: '🍝',
          ingredients: [],
        },
      ],
      schedule: [{ date: Date.now(), breakfast: '', lunch: '', dinner: '' }],
      groceryList: [],
    };

    render(<MealsHarness initialUserData={mockUserData} />);
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
