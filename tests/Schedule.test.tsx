import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type UserData } from '../firebase/firebase.ts'
import Schedule from '../src/pages/Schedule';
import { before } from 'node:test';


describe('Schedule Page', () => {
  const mockUser: any = { uid: '123', email: 'test@example.com' };

  const mockUserData: UserData = {
    meals: [],
    groceryList: [],
    schedule: [
      {
        date: Date.now(),
        breakfast: 'Cereal',
        lunch: 'Turkey sandwich',
        dinner: 'Spaghetti',
      },
      {
        date: Date.now() + 86400,
        breakfast: 'Bacon and eggs',
        lunch: 'Hamburger',
        dinner: 'Chicken',
      },
    ],
  };

  beforeEach(() => {
    render(<Schedule userData={mockUserData} user={mockUser} />);
  });

  test('renders correct number of days', async () => {
    const daysRendered = screen.getAllByText(/Date:/);
    expect(daysRendered.length).toBe(14);
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

    await waitFor(() => {
      expect(screen.getByText(/BREAKFAST on/)).toBeVisible();
    });
  });
});