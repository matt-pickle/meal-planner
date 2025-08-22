import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type UserData } from '../firebase/firebase.ts';
import Schedule from '../src/pages/Schedule';

describe('MealSelectModal Component', () => {

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

    render(<Schedule userData={mockUserData} user={mockUser} />);
    const editButtons = screen.getAllByRole('button', { name: 'edit' });
    await userEvent.click(editButtons[0]);
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
    await userEvent.click(eggs);
    
    expect(eggs).toHaveClass('selected');
  });

  test('modal closes on cancel', async () => {
    const title = screen.getByText(/BREAKFAST on/);
    const cancelButton = screen.getByRole('button', { name: 'cancel' });
    await userEvent.click(cancelButton);

    expect(title).not.toBeVisible();
  });

  test('modal closes and meal is correctly assigned on submit', async () => {
    const title = screen.getByText(/BREAKFAST on/);
    const eggs = screen.getByText(/Eggs/);
    await userEvent.click(eggs);

    const assignButton = screen.getByRole('button', { name: 'assign' });
    await userEvent.click(assignButton);

    expect(title).not.toBeVisible();
    const breakfast = screen.getAllByText(/Breakfast:/)[0];
    expect(breakfast).toHaveTextContent('🥚 Eggs');
  });
});
