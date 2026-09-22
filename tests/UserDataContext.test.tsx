import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
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
  return render(<Harness />);
}

describe('UserDataContext', () => {
  beforeEach(() => {
    vi.mocked(updateUserData).mockClear();
  });

  afterEach(() => {
    // a failed timer test must not leave fake timers installed for the rest
    vi.useRealTimers();
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

  test('a grocery change shows at once but its write waits for the debounce', () => {
    vi.useFakeTimers();
    renderStore();

    fireEvent.click(screen.getByRole('button', { name: 'add item' }));

    expect(screen.getByTestId('grocery')).toHaveTextContent('Cheese,Milk');
    expect(updateUserData).not.toHaveBeenCalled();

    // still quiet most of the way through
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(updateUserData).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(updateUserData).toHaveBeenCalledTimes(1);
  });

  test('repeated edits cost one write, not one each', () => {
    vi.useFakeTimers();
    renderStore();

    const addItem = screen.getByRole('button', { name: 'add item' });
    fireEvent.click(addItem);
    fireEvent.click(addItem);
    fireEvent.click(addItem);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(updateUserData).toHaveBeenCalledTimes(1);
  });

  test('writes a pending edit when the tab is hidden', async () => {
    renderStore();
    await userEvent.click(screen.getByRole('button', { name: 'add item' }));
    expect(updateUserData).not.toHaveBeenCalled();

    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(updateUserData).toHaveBeenCalledTimes(1);
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
  });

  test('writes a pending edit when the page is going away', async () => {
    renderStore();
    await userEvent.click(screen.getByRole('button', { name: 'add item' }));

    act(() => {
      window.dispatchEvent(new Event('pagehide'));
    });

    expect(updateUserData).toHaveBeenCalledTimes(1);
  });

  test('writes a pending edit when the store unmounts', async () => {
    const { unmount } = renderStore();
    await userEvent.click(screen.getByRole('button', { name: 'add item' }));

    unmount();

    expect(updateUserData).toHaveBeenCalledTimes(1);
  });

  test('writes nothing when there is no pending edit', () => {
    const { unmount } = renderStore();

    unmount();

    expect(updateUserData).not.toHaveBeenCalled();
  });

  test('using the store outside a provider is a clear error', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Consumer />)).toThrow(/UserDataProvider/);

    consoleError.mockRestore();
  });
});
