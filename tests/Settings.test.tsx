import { describe, test, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type User } from 'firebase/auth';
import Settings from '../src/pages/Settings';
import { logOut, updateUserData } from '../firebase/firebase';
import { useUserData } from '../src/state/UserDataContext';
import { renderWithUserData } from './userDataHarness';
import { type UserData } from '../src/utils/types';

const emptyData: UserData = { meals: [], schedule: [], groceryList: [] };

function renderSettings(user: Partial<User> | null) {
  return renderWithUserData(<Settings user={user as User | null} />, emptyData);
}

describe('Settings Page', () => {
  beforeEach(() => {
    vi.mocked(logOut).mockClear();
    vi.mocked(updateUserData).mockClear();
  });

  test('displays the display name and email when the user has both', () => {
    renderSettings({ uid: '123', email: 'test@test.com', displayName: 'Test User' });
    expect(screen.getByText('Logged in as Test User (test@test.com)')).toBeVisible();
  });

  test('falls back to the email when the user has no display name', () => {
    renderSettings({ uid: '123', email: 'test@test.com', displayName: null });
    expect(screen.getByText('Logged in as test@test.com')).toBeVisible();
  });

  test('omits the line when there is no user', () => {
    renderSettings(null);
    expect(screen.queryByText(/Logged in as/)).not.toBeInTheDocument();
  });

  test('logs out on button click', async () => {
    renderSettings({ uid: '123', email: 'test@test.com', displayName: 'Test User' });

    await userEvent.click(screen.getByRole('button', { name: 'log out' }));

    expect(logOut).toHaveBeenCalled();
  });

  // Issue 9: once signed out, Firestore rejects the write, so a pending grocery
  // edit has to be written before signing out, not after.
  test('writes a pending grocery edit before signing out', async () => {
    function EditThenSettings() {
      const { userData, setGroceryList } = useUserData();
      return (
        <>
          <button
            onClick={() =>
              setGroceryList([
                ...userData.groceryList,
                { id: 'milk', name: 'Milk', quantity: 1, units: 'cups', status: 'to buy' },
              ])
            }
          >
            add item
          </button>
          <Settings user={null} />
        </>
      );
    }
    renderWithUserData(<EditThenSettings />, emptyData);
    await userEvent.click(screen.getByRole('button', { name: 'add item' }));
    expect(updateUserData).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'log out' }));

    expect(updateUserData).toHaveBeenCalledTimes(1);
    expect(vi.mocked(updateUserData).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(logOut).mock.invocationCallOrder[0],
    );
  });
});
