import { describe, test, expect, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type UserData } from '../src/utils/types';
import Meals from '../src/pages/Meals';
import { renderWithUserData } from './userDataHarness';

describe('Meals Page', () => {
  const mockUserData: UserData = {
    meals: [
      {
        id: 'cereal',
        name: 'Cereal',
        emoji: '🥣',
        ingredients: [
          {
            name: 'Oats',
            quantity: 1,
            units: 'cups',
          },
          {
            name: 'Milk',
            quantity: 1,
            units: 'cups',
          },
        ],
      },
      {
        id: 'bacon-and-eggs',
        name: 'Bacon and eggs',
        emoji: '🥓🍳',
        ingredients: [
          {
            name: 'Bacon',
            quantity: 2,
            units: 'slices',
          },
          {
            name: 'Eggs',
            quantity: 2,
            units: 'eggs',
          },
        ],
      },
      {
        id: 'turkey-sandwich',
        name: 'Turkey sandwich',
        emoji: '🥪',
        ingredients: [
          {
            name: 'Turkey',
            quantity: 1,
            units: 'slices',
          },
          {
            name: 'Bread',
            quantity: 2,
            units: 'slices',
          },
          {
            name: 'Lettuce',
            quantity: 1,
            units: 'leaves',
          },
        ],
      },
      {
        id: 'spaghetti',
        name: 'Spaghetti',
        emoji: '🍝',
        ingredients: [
          {
            name: 'Pasta',
            quantity: 1,
            units: 'boxes',
          },
          {
            name: 'Tomato sauce',
            quantity: 1,
            units: 'jars',
          },
        ],
      },
      {
        id: 'hamburger',
        name: 'Hamburger',
        emoji: '🍔',
        ingredients: [
          {
            name: 'Beef patty',
            quantity: 1,
            units: 'patties',
          },
          {
            name: 'Bun',
            quantity: 1,
            units: 'buns',
          },
          {
            name: 'Lettuce',
            quantity: 1,
            units: 'leaves',
          },
        ],
      },
    ],
    groceryList: [],
    schedule: [],
  };

  beforeEach(() => {
    renderWithUserData(<Meals />, mockUserData);
  });

  test('renders meals from userData', () => {
    expect(screen.getByText(/Cereal/)).toBeVisible();
    expect(screen.getByText(/Bacon and eggs/)).toBeVisible();
    expect(screen.getByText(/Turkey sandwich/)).toBeVisible();
    expect(screen.getByText(/Spaghetti/)).toBeVisible();
    expect(screen.getByText(/Hamburger/)).toBeVisible();
  });

  test('opens edit modal on edit button click', async () => {
    const editButtons = screen.getAllByRole('button', { name: 'edit' });
    await userEvent.click(editButtons[0]);
    expect(screen.getByText(/Edit Meal/)).toBeVisible();
  });

  test('opens delete modal on delete button click', async () => {
    const deleteButtons = screen.getAllByRole('button', { name: 'delete' });
    await userEvent.click(deleteButtons[0]);
    expect(screen.getByText(/Delete Meal/)).toBeVisible();
  });

  // Regression: creating a meal then editing or deleting another used to rebuild
  // the list from a stale userData.meals, silently dropping the new meal.
  async function createMeal(name: string) {
    await userEvent.click(screen.getByRole('button', { name: 'add new meal' }));
    await userEvent.type(screen.getByLabelText(/Meal Name/), name);
    await userEvent.click(screen.getByRole('button', { name: 'save meal' }));
  }

  test('a newly created meal survives deleting a different meal', async () => {
    await createMeal('Pancakes');
    expect(screen.getByText(/Pancakes/)).toBeVisible();

    const cerealCard = screen.getByText(/Cereal/).closest('div')!;
    await userEvent.click(within(cerealCard).getByRole('button', { name: 'delete' }));
    await userEvent.click(screen.getByRole('button', { name: 'delete meal' }));

    expect(screen.queryByText(/Cereal/)).not.toBeInTheDocument();
    expect(screen.getByText(/Pancakes/)).toBeVisible();
  });

  test('two meals created in a row both survive', async () => {
    await createMeal('Pancakes');
    await createMeal('Waffles');

    expect(screen.getByText(/Pancakes/)).toBeVisible();
    expect(screen.getByText(/Waffles/)).toBeVisible();
  });

  test('opens new meal modal on add button click', async () => {
    const addButtons = screen.getAllByRole('button', { name: 'add new meal' });
    await userEvent.click(addButtons[0]);
    expect(screen.getByText(/Create New Meal/)).toBeVisible();
  });
});
