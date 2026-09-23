import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation, useNavigate } from 'react-router';
import { type User } from 'firebase/auth';
import userEvent from '@testing-library/user-event';
import Login from '../src/pages/Login';
import { logIn } from '../firebase/firebase';
import { onError } from '../src/utils/errors';

describe('Login Page', () => {
  const reported = vi.fn();
  let unsubscribe: () => void;

  beforeEach(() => {
    reported.mockClear();
    vi.mocked(logIn).mockReset();
    unsubscribe?.();
    unsubscribe = onError(reported);
  });

  test('signs in when the button is clicked', async () => {
    vi.mocked(logIn).mockResolvedValue(undefined as never);
    render(<Login user={null} />);

    await userEvent.click(screen.getByRole('button', { name: 'log in with google' }));

    expect(logIn).toHaveBeenCalled();
    expect(reported).not.toHaveBeenCalled();
  });

  // Regression: logIn never returned its promise, so this catch could not fire
  test('reports a failed sign-in', async () => {
    vi.mocked(logIn).mockRejectedValue(new Error('boom'));
    render(<Login user={null} />);

    await userEvent.click(screen.getByRole('button', { name: 'log in with google' }));

    expect(reported).toHaveBeenCalledWith("Sign-in didn't work. Please try again.");
  });

  test('explains a blocked popup', async () => {
    vi.mocked(logIn).mockRejectedValue({ code: 'auth/popup-blocked' });
    render(<Login user={null} />);

    await userEvent.click(screen.getByRole('button', { name: 'log in with google' }));

    expect(reported.mock.calls[0][0]).toMatch(/blocked the sign-in window/);
  });

  test('stays quiet when the user closes the popup', async () => {
    vi.mocked(logIn).mockRejectedValue({ code: 'auth/popup-closed-by-user' });
    render(<Login user={null} />);

    await userEvent.click(screen.getByRole('button', { name: 'log in with google' }));

    expect(reported).not.toHaveBeenCalled();
  });
});

// Issue 10: after signing in, Back could return to the login page, which had
// no redirect of its own and offered a signed-in user the sign-in button
describe('Login Page when already signed in', () => {
  function HistoryProbe() {
    const navigate = useNavigate();
    return (
      <>
        <div data-testid="path">{useLocation().pathname}</div>
        <button onClick={() => navigate(-1)}>back</button>
      </>
    );
  }

  test('sends the user to the schedule, replacing the login page', async () => {
    const user = { uid: '123' } as unknown as User;
    render(
      <MemoryRouter initialEntries={['/previous', '/login']} initialIndex={1}>
        <Routes>
          <Route path="/login" element={<Login user={user} />} />
          <Route path="*" element={null} />
        </Routes>
        <HistoryProbe />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('path')).toHaveTextContent('/schedule');
    expect(screen.queryByRole('button', { name: 'log in with google' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'back' }));
    expect(screen.getByTestId('path')).toHaveTextContent('/previous');
  });
});
