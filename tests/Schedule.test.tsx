import { describe, test, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type UserData } from '../firebase/firebase.ts'
import Schedule from '../src/pages/Schedule';


describe('Schedule Page', () => {
  const mockUserData: UserData = {
    meals: [],
    groceryList: [],
    schedule: [
      {
        date: new Date(Date.now()),
        breakfast: 'Cereal',
        lunch: 'Turkey sandwich',
        dinner: 'Spaghetti',
      },
      {
        date: new Date(Date.now() + 86400),
        breakfast: 'Bacon and eggs',
        lunch: 'Hamburger',
        dinner: 'Chicken',
      },
    ],
  };

  test('renders correct number of days', async () => {
    render(<Schedule userData={mockUserData} />);

    const daysRendered = screen.getAllByText(/Date:/);

    expect(daysRendered.length).toBe(14);
  });

  test('renders meals from userData', () => {
    render(<Schedule userData={mockUserData} />);

    expect(screen.getByText(/Cereal/)).toBeVisible();
    expect(screen.getByText(/Bacon and eggs/)).toBeVisible();
    expect(screen.getByText(/Turkey sandwich/)).toBeVisible();
    expect(screen.getByText(/Spaghetti/)).toBeVisible();
    expect(screen.getByText(/Hamburger/)).toBeVisible();
    expect(screen.getByText(/Chicken/)).toBeVisible();
  });

  test('opens edit modal on edit button click', async () => {
    render(<Schedule userData={mockUserData} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/ });

    await userEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/BREAKFAST on/)).toBeVisible();
    });
  });
});