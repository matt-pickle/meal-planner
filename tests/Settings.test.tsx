import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from '../src/pages/Settings';
import { logOut } from '../firebase/firebase';

vi.mock('../firebase/firebase', () => {
  return {
    logOut: vi.fn(),
  };
});

describe('Settings Page', () => {
  test('displays the display name and email when the user has both', () => {
    const mockUser = { uid: '123', email: 'test@test.com', displayName: 'Test User' };
    // @ts-expect-error -- a partial stand-in for the Firebase User
    render(<Settings user={mockUser} />);
    expect(screen.getByText('Logged in as Test User (test@test.com)')).toBeVisible();
  });

  test('falls back to the email when the user has no display name', () => {
    const mockUser = { uid: '123', email: 'test@test.com', displayName: null };
    // @ts-expect-error -- a partial stand-in for the Firebase User
    render(<Settings user={mockUser} />);
    expect(screen.getByText('Logged in as test@test.com')).toBeVisible();
  });

  test('omits the line when there is no user', () => {
    render(<Settings user={null} />);
    expect(screen.queryByText(/Logged in as/)).not.toBeInTheDocument();
  });

  test('logs out on button click', async () => {
    const mockUser = { uid: '123', email: 'test@test.com', displayName: 'Test User' };
    // @ts-expect-error -- a partial stand-in for the Firebase User
    render(<Settings user={mockUser} />);

    await userEvent.click(screen.getByRole('button', { name: 'log out' }));

    expect(logOut).toHaveBeenCalled();
  });
});
