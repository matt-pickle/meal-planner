import { describe, test, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroceryList from '../src/pages/GroceryList';
import { renderWithUserData } from './userDataHarness';
import { type UserData } from '../src/utils/types';

const mockMeals: UserData['meals'] = [
  {
    id: 'spaghetti',
    name: 'Spaghetti',
    emoji: '🍝',
    ingredients: [
      { name: 'Noodles', quantity: 1, units: 'boxes' },
      { name: 'Sauce', quantity: 2, units: 'jars' },
    ],
  },
  {
    id: 'tacos',
    name: 'Tacos',
    emoji: '🌮',
    ingredients: [{ name: 'Ground Beef', quantity: 1, units: 'lbs' }],
  },
  {
    id: 'pancakes',
    name: 'Pancakes',
    emoji: '🥞',
    ingredients: [{ name: 'Syrup', quantity: 1, units: 'bottles' }],
  },
];

async function openModal(userData: UserData) {
  renderWithUserData(<GroceryList />, userData);
  await userEvent.click(
    screen.getByRole('button', { name: 'add ingredients from upcoming meals' })
  );
}

describe('AddFromMealsModal Component', () => {
  beforeEach(async () => {
    await openModal({
      meals: mockMeals,
      schedule: [
        // yesterday - already eaten, so its ingredients are not wanted
        { date: Date.now() - 86400000, breakfast: 'pancakes', lunch: '', dinner: '' },
        { date: Date.now() + 86400000, breakfast: '', lunch: 'spaghetti', dinner: 'tacos' },
        { date: Date.now() + 172800000, breakfast: '', lunch: 'spaghetti', dinner: '' },
      ],
      groceryList: [{ id: 'cheese', name: 'Cheese', quantity: 1, units: 'lbs', status: 'to buy' }],
    });
  });

  test('renders all elements', () => {
    const title = screen.getByText(/Add Ingredients from Meals/);
    const cancelButton = screen.getByRole('button', { name: 'cancel' });
    const confirmButton = screen.getByRole('button', { name: 'confirm add ingredients' });

    expect(title).toBeVisible();
    expect(cancelButton).toBeVisible();
    expect(confirmButton).toBeVisible();
  });

  test('lists the ingredients to be added with totalled quantities and units', () => {
    // Spaghetti is scheduled twice, so its ingredients are doubled
    expect(screen.getByText(/Noodles - 2 boxes/)).toBeVisible();
    expect(screen.getByText(/Sauce - 4 jars/)).toBeVisible();
    expect(screen.getByText(/Ground Beef - 1 lbs/)).toBeVisible();
  });

  test('leaves out meals scheduled in the past', () => {
    expect(screen.queryByText(/Syrup/)).not.toBeInTheDocument();
  });

  test('does not add ingredients until confirmed', () => {
    expect(screen.queryByDisplayValue('Noodles')).not.toBeInTheDocument();
  });

  test('modal closes on cancel and leaves the list alone', async () => {
    const title = screen.getByText(/Add Ingredients from Meals/);
    await userEvent.click(screen.getByRole('button', { name: 'cancel' }));

    expect(title).not.toBeVisible();
    expect(screen.queryByDisplayValue('Noodles')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Cheese')).toBeVisible();
  });

  test('modal closes and ingredients are added on confirm', async () => {
    const title = screen.getByText(/Add Ingredients from Meals/);
    await userEvent.click(screen.getByRole('button', { name: 'confirm add ingredients' }));

    expect(title).not.toBeVisible();
    expect(screen.getByDisplayValue('Noodles')).toBeVisible();
    expect(screen.getByDisplayValue('2')).toBeVisible();
    // existing items are kept, not replaced
    expect(screen.getByDisplayValue('Cheese')).toBeVisible();
  });
});

describe('AddFromMealsModal Component with nothing scheduled', () => {
  beforeEach(async () => {
    await openModal({ meals: mockMeals, schedule: [], groceryList: [] });
  });

  test('says there is nothing to add and disables the confirm button', () => {
    expect(screen.getByText(/no ingredients to add/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'confirm add ingredients' })).toBeDisabled();
  });
});
