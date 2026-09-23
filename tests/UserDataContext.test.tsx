import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { memo, useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserDataProvider, useUserData } from '../src/state/UserDataContext';
import { updateUserData } from '../firebase/firebase';
import { type UserData } from '../src/utils/types';
import { signIn, testUser } from './userDataHarness';

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
  signIn();
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

  // Issue 9: signing out in another tab signs this one out too, and the store
  // unmounts after that. Firestore would reject the write, and the user would
  // see a save failure on the login page.
  test('drops a pending edit quietly when the user has signed out elsewhere', async () => {
    const { unmount } = renderStore();
    await userEvent.click(screen.getByRole('button', { name: 'add item' }));

    signIn(null);
    unmount();

    expect(updateUserData).not.toHaveBeenCalled();
  });

  test('drops a pending edit when a different user is now signed in', async () => {
    const { unmount } = renderStore();
    await userEvent.click(screen.getByRole('button', { name: 'add item' }));

    signIn({ uid: 'someone-else' } as unknown as typeof testUser);
    unmount();

    expect(updateUserData).not.toHaveBeenCalled();
  });

  test('writes nothing when there is no pending edit', () => {
    const { unmount } = renderStore();

    unmount();

    expect(updateUserData).not.toHaveBeenCalled();
  });

  // Issue 23: the store handed out a new object on every render, so a memoized
  // component reading it re-rendered whenever the provider did, even with the
  // same data
  test('keeps the same store while the data is unchanged', async () => {
    signIn();
    let renders = 0;
    const MemoReader = memo(function MemoReader() {
      renders += 1;
      return <p>{useUserData().userData.meals.length} meals</p>;
    });
    function Parent() {
      // Unrelated state, like App's error banner, re-renders the provider
      const [, setTick] = useState(0);
      const [userData, setUserData] = useState<UserData | undefined>(initialData());
      return (
        <>
          <button onClick={() => setTick(tick => tick + 1)}>unrelated change</button>
          <button onClick={() => setUserData(current => current && { ...current, meals: [] })}>
            clear meals
          </button>
          <UserDataProvider user={testUser} userData={userData!} setUserData={setUserData}>
            <MemoReader />
          </UserDataProvider>
        </>
      );
    }
    render(<Parent />);
    expect(renders).toBe(1);

    await userEvent.click(screen.getByRole('button', { name: 'unrelated change' }));
    expect(renders).toBe(1);

    // a real change still reaches the reader
    await userEvent.click(screen.getByRole('button', { name: 'clear meals' }));
    expect(renders).toBe(2);
    expect(screen.getByText('0 meals')).toBeVisible();
  });

  test('using the store outside a provider is a clear error', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Consumer />)).toThrow(/UserDataProvider/);

    consoleError.mockRestore();
  });
});
