import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    render(<Login />);

    await userEvent.click(screen.getByRole('button', { name: 'log in with google' }));

    expect(logIn).toHaveBeenCalled();
    expect(reported).not.toHaveBeenCalled();
  });

  // Regression: logIn never returned its promise, so this catch could not fire
  test('reports a failed sign-in', async () => {
    vi.mocked(logIn).mockRejectedValue(new Error('boom'));
    render(<Login />);

    await userEvent.click(screen.getByRole('button', { name: 'log in with google' }));

    expect(reported).toHaveBeenCalledWith("Sign-in didn't work. Please try again.");
  });

  test('explains a blocked popup', async () => {
    vi.mocked(logIn).mockRejectedValue({ code: 'auth/popup-blocked' });
    render(<Login />);

    await userEvent.click(screen.getByRole('button', { name: 'log in with google' }));

    expect(reported.mock.calls[0][0]).toMatch(/blocked the sign-in window/);
  });

  test('stays quiet when the user closes the popup', async () => {
    vi.mocked(logIn).mockRejectedValue({ code: 'auth/popup-closed-by-user' });
    render(<Login />);

    await userEvent.click(screen.getByRole('button', { name: 'log in with google' }));

    expect(reported).not.toHaveBeenCalled();
  });
});
