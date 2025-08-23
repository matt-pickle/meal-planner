import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type UserData } from '../firebase/firebase.ts'
import Meals from '../src/pages/Meals';


describe('Meals Page', () => {
  const mockUser: any = { uid: '123', email: 'test@example.com' };

  const mockUserData: UserData = {
    meals: [
      {
        name: 'Cereal',
        emoji: '🥣',
        ingredients: [
          {
            name: 'Oats',
            emoji: '🌾',
            quantity: 1,
          },
          {
            name: 'Milk',
            emoji: '🥛',
            quantity: 1,
          },
        ],
      },
      {
        name: 'Bacon and eggs',
        emoji: '🥓🍳',
        ingredients: [
          {
            name: 'Bacon',
            emoji: '🥓',
            quantity: 2,
          },
          {
            name: 'Eggs',
            emoji: '🥚',
            quantity: 2,
          },
        ],
      },
      {
        name: 'Turkey sandwich',
        emoji: '🥪',
        ingredients: [
          {
            name: 'Turkey',
            emoji: '🦃',
            quantity: 1,
          },
          {
            name: 'Bread',
            emoji: '🍞',
            quantity: 2,
          },
          {
            name: 'Lettuce',
            emoji: '🥬',
            quantity: 1,
          },
        ],
      },
      {
        name: 'Spaghetti',
        emoji: '🍝',
        ingredients: [
          {
            name: 'Pasta',
            emoji: '🍝',
            quantity: 1,
          },
          {
            name: 'Tomato sauce',
            emoji: '🍅',
            quantity: 1,
          },
        ],
      },
      {
        name: 'Hamburger',
        emoji: '🍔',
        ingredients: [
          {
            name: 'Beef patty',
            emoji: '🍖',
            quantity: 1,
          },
          {
            name: 'Bun',
            emoji: '🍞',
            quantity: 1,
          },
          {
            name: 'Lettuce',
            emoji: '🥬',
            quantity: 1,
          },
        ],
      },
      {
        name: 'Chicken',
        emoji: '🍗',
        ingredients: [
          {
            name: 'Chicken breast',
            emoji: '🍗',
            quantity: 1,
          },
          {
            name: 'Spices',
            emoji: '🧂',
            quantity: 1,
          },
        ],
      }
    ],
    groceryList: [],
    schedule: [],
  };

  beforeEach(() => {
    render(<Meals userData={mockUserData} user={mockUser} />);
  });

  test('renders meals from userData', () => {
    expect(screen.getByText(/Cereal/)).toBeVisible();
    expect(screen.getByText(/Bacon and eggs/)).toBeVisible();
    expect(screen.getByText(/Turkey sandwich/)).toBeVisible();
    expect(screen.getByText(/Spaghetti/)).toBeVisible();
    expect(screen.getByText(/Hamburger/)).toBeVisible();
    expect(screen.getByText(/Chicken/)).toBeVisible();
  });

  test('opens edit modal on edit button click', async () => {
    const editButtons = screen.getAllByRole('button', { name: 'edit' });
    await userEvent.click(editButtons[0]);
    expect(screen.getByText(/Edit Cereal/)).toBeVisible();
  });

  test('opens delete modal on delete button click', async () => {
    const deleteButtons = screen.getAllByRole('button', { name: 'delete' });
    await userEvent.click(deleteButtons[0]);
    expect(screen.getByText(/Delete Cereal/)).toBeVisible();
  });

  test('opens new meal modal on add button click', async () => {
    const addButtons = screen.getAllByRole('button', { name: 'add new meal' });
    await userEvent.click(addButtons[0]);
    expect(screen.getByText(/Add New Meal/)).toBeVisible();
  });
});