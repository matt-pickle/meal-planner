import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type UserData } from '../firebase/firebase.ts';
import Schedule from '../src/pages/Schedule';

describe('MealSelectModal Component', () => {

  beforeEach(() => {
    const mockUser: any = { uid: '123', email: 'test@example.com' };
    const mockUserData: UserData = {
      meals: [
        { name: 'Eggs', emoji: '🥚', ingredients: [] },
        { name: 'Salad', emoji: '🥗', ingredients: [] },
        { name: 'Hot dogs', emoji: '🌭', ingredients: [] },
      ],
      schedule: [],
      groceryList: [],
    };

    render(<Schedule userData={mockUserData} user={mockUser} />);
    const editButtons = screen.getAllByRole('button', { name: 'edit' });
    userEvent.click(editButtons[0]);
  });

  test('renders meal options', () => {
    const eggs = screen.getByText(/Eggs/);
    expect(eggs).toHaveTextContent('🥚 Eggs');
    const salad = screen.getByText(/Salad/);
    expect(salad).toHaveTextContent('🥗 Salad');
    const hotDogs = screen.getByText(/Hot dogs/);
    expect(hotDogs).toHaveTextContent('🌭 Hot dogs');
  });

  test('highlights meal when selected', async () => {
    const eggs = screen.getByText(/Eggs/);
    userEvent.click(eggs);
    
    await waitFor(() => {
      expect(eggs).toHaveClass('selected');
    });
  });

  test('modal closes on cancel', async () => {
    const title = screen.getByText(/BREAKFAST on/);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    userEvent.click(cancelButton);

    await waitFor(() => {
      expect(title).not.toBeVisible();
    });
  });

  test('modal closes and meal is correctly assigned on submit', async () => {
    const title = screen.getByText(/BREAKFAST on/);
    const eggs = screen.getByText(/Eggs/);
    userEvent.click(eggs);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(title).not.toBeVisible();
      const breakfast = screen.getByText(/Breakfast:/);
      expect(breakfast).toHaveTextContent('🥚 Eggs');
    });
  });
});
