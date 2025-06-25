import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';
import { MemoryRouter } from 'react-router';
import { onAuthStateChanged } from 'firebase/auth';

vi.mock('firebase/auth', () => {
  return {
    onAuthStateChanged: vi.fn(),
  };
});

vi.mock('../firebase/firebase', () => {
  const mockUser = { uid: '123', email: 'test@test.com' };
  return {
    auth: { currentUser: mockUser },
    getUserData: vi.fn(),
    logOut: vi.fn(),
  };
});

function renderWithRouter(component: React.ReactNode, initialPath: string) {
  return render(<MemoryRouter initialEntries={[initialPath]}>{component}</MemoryRouter>);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe ('App Component', () => {
  describe('when user is logged in', () => {
    test('redirects "/" to Meals page', async () => {
      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        const mockUser = { uid: '123', email: 'test@test.com' };
        callback(mockUser);
        return vi.fn();
      });

      renderWithRouter(<App />, '/');

      await waitFor(() => {
        expect(screen.getByText('Meals Page')).toBeVisible();
      });
    });

    test('renders Meals page', async () => {
      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        const mockUser = { uid: '123', email: 'test@test.com' };
        callback(mockUser);
        return vi.fn();
      });

      renderWithRouter(<App />, '/meals');

      await waitFor(() => {
        expect(screen.getByText('Meals Page')).toBeVisible();
      });
    });

    test('renders Schedule page', async () => {
      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        const mockUser = { uid: '123', email: 'test@test.com' };
        callback(mockUser);
        return vi.fn();
      });

      renderWithRouter(<App />, '/schedule');

      await waitFor(() => {
        expect(screen.getByText('Schedule Page')).toBeVisible();
      });
    });

    test('renders Grocery List page', async () => {
      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        const mockUser = { uid: '123', email: 'test@test.com' };
        callback(mockUser);
        return vi.fn();
      });

      renderWithRouter(<App />, '/grocery-list');

      await waitFor(() => {
        expect(screen.getByText('Grocery List Page')).toBeVisible();
      });
    });

    test('renders Settings page', async () => {
      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        const mockUser = { uid: '123', email: 'test@test.com' };
        callback(mockUser);
        return vi.fn();
      });

      renderWithRouter(<App />, '/settings');

      await waitFor(() => {
        expect(screen.getByText('Settings Page')).toBeVisible();
      });
    });
  });

  describe('when user is not logged in', () => {
    test('redirects "/" to Login page', async () => {
      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        callback(null);
        return vi.fn();
      });

      renderWithRouter(<App />, '/');

      await waitFor(() => {
        expect(screen.getByText('Log In with Google')).toBeVisible();
      });
    });

    test('redirects "/meals" to Login page', async () => {
      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        callback(null);
        return vi.fn();
      });

      renderWithRouter(<App />, '/meals');

      await waitFor(() => {
        expect(screen.getByText('Log In with Google')).toBeVisible();
      });
    });

    test('redirects "/schedule" to Login page', async () => {
      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        callback(null);
        return vi.fn();
      });

      renderWithRouter(<App />, '/schedule');

      await waitFor(() => {
        expect(screen.getByText('Log In with Google')).toBeVisible();
      });
    });

    test('redirects "/grocery-list" to Login page', async () => {
      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        callback(null);
        return vi.fn();
      });

      renderWithRouter(<App />, '/grocery-list');

      await waitFor(() => {
        expect(screen.getByText('Log In with Google')).toBeVisible();
      });
    });

    test('redirects "/settings" to Login page', async () => {
      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        callback(null);
        return vi.fn();
      });

      renderWithRouter(<App />, '/settings');

      await waitFor(() => {
        expect(screen.getByText('Log In with Google')).toBeVisible();
      });
    });
  });
});