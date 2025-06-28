import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
    beforeEach(() => {
      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        const mockUser = { uid: '123', email: 'test@test.com' };
        callback(mockUser);
        return vi.fn();
      });
    });

    test('redirects "/" to Meals page', async () => {
      renderWithRouter(<App />, '/');

      await waitFor(() => {
        expect(screen.getByText('Meals Page')).toBeVisible();
      });
    });

    test('renders Meals page', async () => {
      renderWithRouter(<App />, '/meals');

      await waitFor(() => {
        expect(screen.getByText('Meals Page')).toBeVisible();
      });
    });

    test('renders Schedule page', async () => {
      renderWithRouter(<App />, '/schedule');

      await waitFor(() => {
        expect(screen.getByText('Schedule Page')).toBeVisible();
      });
    });

    test('renders Grocery List page', async () => {
      renderWithRouter(<App />, '/grocery-list');

      await waitFor(() => {
        expect(screen.getByText('Grocery List Page')).toBeVisible();
      });
    });

    test('renders Settings page', async () => {
      renderWithRouter(<App />, '/settings');

      await waitFor(() => {
        expect(screen.getByText('Settings Page')).toBeVisible();
      });
    });

    test('renders navigation links', async () => {
      renderWithRouter(<App />, '/');

      await waitFor(() => {
        const mealsLink = screen.getByText('Meals');
        const scheduleLink = screen.getByText('Schedule');
        const groceryListLink = screen.getByText('Grocery List');
        const settingsLink = screen.getByText('Settings');
        expect(mealsLink).toBeVisible();
        expect(scheduleLink).toBeVisible();
        expect(groceryListLink).toBeVisible();
        expect(settingsLink).toBeVisible();
      });
    });

    test('Meals link renders Meals Page', async () => {
      renderWithRouter(<App />, '/');

      userEvent.click(screen.getByText('Meals'));

      await waitFor(() => {
        expect(screen.getByText('Meals Page')).toBeVisible();
      });
    });

    test('Schedule link renders Schedule Page', async () => {
      renderWithRouter(<App />, '/');

      userEvent.click(screen.getByText('Schedule'));

      await waitFor(() => {
        expect(screen.getByText('Schedule Page')).toBeVisible();
      });
    });

    test('Grocery List link renders Grocery List Page', async () => {
      renderWithRouter(<App />, '/');

      userEvent.click(screen.getByText('Grocery List'));

      await waitFor(() => {
        expect(screen.getByText('Grocery List Page')).toBeVisible();
      });
    });

    test('Settings link renders Settings Page', async () => {
      renderWithRouter(<App />, '/');

      userEvent.click(screen.getByText('Settings'));

      await waitFor(() => {
        expect(screen.getByText('Settings Page')).toBeVisible();
      });
    });
  });

  describe('when user is not logged in', () => {
    beforeEach(() => {
      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        callback(null);
        return vi.fn();
      });
    });

    test('redirects "/" to Login page', async () => {
      renderWithRouter(<App />, '/');

      await waitFor(() => {
        expect(screen.getByText('Log In with Google')).toBeVisible();
      });
    });

    test('redirects "/meals" to Login page', async () => {
      renderWithRouter(<App />, '/meals');

      await waitFor(() => {
        expect(screen.getByText('Log In with Google')).toBeVisible();
      });
    });

    test('redirects "/schedule" to Login page', async () => {
      renderWithRouter(<App />, '/schedule');

      await waitFor(() => {
        expect(screen.getByText('Log In with Google')).toBeVisible();
      });
    });

    test('redirects "/grocery-list" to Login page', async () => {
      renderWithRouter(<App />, '/grocery-list');

      await waitFor(() => {
        expect(screen.getByText('Log In with Google')).toBeVisible();
      });
    });

    test('redirects "/settings" to Login page', async () => {
      renderWithRouter(<App />, '/settings');

      await waitFor(() => {
        expect(screen.getByText('Log In with Google')).toBeVisible();
      });
    });

    test('renders navigation links', async () => {
      renderWithRouter(<App />, '/');

      await waitFor(() => {
        const mealsLink = screen.getByText('Meals');
        const scheduleLink = screen.getByText('Schedule');
        const groceryListLink = screen.getByText('Grocery List');
        const settingsLink = screen.getByText('Settings');
        expect(mealsLink).toBeVisible();
        expect(scheduleLink).toBeVisible();
        expect(groceryListLink).toBeVisible();
        expect(settingsLink).toBeVisible();
      });
    });

    test('Meals link redirects to Login Page', async () => {
      renderWithRouter(<App />, '/');

      userEvent.click(screen.getByText('Meals'));

      await waitFor(() => {
        expect(screen.getByText('Log In with Google')).toBeVisible();
      });
    });

    test('Schedule link redirects to Login Page', async () => {
      renderWithRouter(<App />, '/');

      userEvent.click(screen.getByText('Schedule'));

      await waitFor(() => {
        expect(screen.getByText('Log In with Google')).toBeVisible();
      });
    });

    test('Grocery List link redirects to Login Page', async () => {
      renderWithRouter(<App />, '/');

      userEvent.click(screen.getByText('Grocery List'));

      await waitFor(() => {
        expect(screen.getByText('Log In with Google')).toBeVisible();
      });
    });

    test('Settings link redirects to Login Page', async () => {
      renderWithRouter(<App />, '/');

      userEvent.click(screen.getByText('Settings'));

      await waitFor(() => {
        expect(screen.getByText('Log In with Google')).toBeVisible();
      });
    });
  });
});