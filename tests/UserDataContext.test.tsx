import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserDataProvider, useUserData } from '../src/state/UserDataContext';
import { updateUserData } from '../firebase/firebase';
import { type UserData } from '../src/utils/types';
import { testUser } from './userDataHarness';

function initialData(): UserData {
  return {
    meals: [{ id: 'a', name: 'Cereal', emoji: '🥣', ingredients: [] }],
    schedule: [],
    groceryList: [{ id: 'x', name: 'Cheese', quantity: 1, units: 'lbs', status: 'to buy' }],
  };
}

// Reads the one copy and writes through the store, the way a page does
function Consumer() {
  const { userData, setMeals, setGroceryList } = useUserData();
  return (
    <div>
      <p data-testid="meals">{userData.meals.map(meal => meal.name).join(',')}</p>
      <p data-testid="grocery">{userData.groceryList.map(item => item.name).join(',')}</p>
      <button
        onClick={() =>
          setMeals([...userData.meals, { id: 'b', name: 'Toast', emoji: '🍞', ingredients: [] }])
        }
      >
        add meal
      </button>
      <button
        onClick={() =>
          setGroceryList([
            ...userData.groceryList,
            { id: 'y', name: 'Milk', quantity: 1, units: 'cups', status: 'to buy' },
          ])
        }
      >
        add item
      </button>
    </div>
  );
}

function renderStore() {
  function Harness() {
    const [userData, setUserData] = useState<UserData | undefined>(initialData());
    if (!userData) return null;
    return (
      <UserDataProvider user={testUser} userData={userData} setUserData={setUserData}>
        <Consumer />
      </UserDataProvider>
    );
  }
  render(<Harness />);
}

describe('UserDataContext', () => {
  beforeEach(() => {
    vi.mocked(updateUserData).mockClear();
  });

  test('a meal change updates the copy on screen and persists it in one step', async () => {
    renderStore();

    await userEvent.click(screen.getByRole('button', { name: 'add meal' }));

    expect(screen.getByTestId('meals')).toHaveTextContent('Cereal,Toast');
    expect(updateUserData).toHaveBeenCalledWith('123', {
      meals: [
        expect.objectContaining({ name: 'Cereal' }),
        expect.objectContaining({ name: 'Toast' }),
      ],
    });
  });

  test('a grocery change shows at once but its write is debounced', async () => {
    renderStore();

    await userEvent.click(screen.getByRole('button', { name: 'add item' }));

    expect(screen.getByTestId('grocery')).toHaveTextContent('Cheese,Milk');
    expect(updateUserData).not.toHaveBeenCalled();

    await waitFor(() => expect(updateUserData).toHaveBeenCalledTimes(1));
  });

  test('using the store outside a provider is a clear error', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Consumer />)).toThrow(/UserDataProvider/);

    consoleError.mockRestore();
  });
});
