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
    updateUserData: vi.fn(),
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
      //@ts-ignore
      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback: any) => {
        const mockUser = { uid: '321', email: 'test@test.com' };
        callback(mockUser);
        return vi.fn();
      });
    });

    test('redirects "/" to Schedule page', async () => {
      renderWithRouter(<App />, '/');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Schedule', level: 1 })).toBeVisible();
      });
    });

    test('renders Meals page', async () => {
      renderWithRouter(<App />, '/meals');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Meals', level: 1 })).toBeVisible();
      });
    });

    test('renders Schedule page', async () => {
      renderWithRouter(<App />, '/schedule');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Schedule', level: 1 })).toBeVisible();
      });
    });

    test('renders Grocery List page', async () => {
      renderWithRouter(<App />, '/grocery-list');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Grocery List', level: 1 })).toBeVisible();
      });
    });

    test('renders Settings page', async () => {
      renderWithRouter(<App />, '/settings');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();
      });
    });

    test('renders navigation links', async () => {
      renderWithRouter(<App />, '/');

      const scheduleLink = screen.getByRole('link', { name: 'Schedule' });
      const mealsLink = screen.getByRole('link', { name: 'Meals' });
      const groceryListLink = screen.getByRole('link', { name: 'Grocery List' });
      const settingsLink = screen.getByRole('link', { name: 'Settings' });
      expect(scheduleLink).toBeVisible();
      expect(mealsLink).toBeVisible();
      expect(groceryListLink).toBeVisible();
      expect(settingsLink).toBeVisible();
    });

    test('Meals link renders Meals Page', async () => {
      renderWithRouter(<App />, '/');

      await userEvent.click(screen.getByRole('link', { name: 'Meals' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Meals', level: 1 })).toBeVisible();
      });
    });

    test('Schedule link renders Schedule Page', async () => {
      renderWithRouter(<App />, '/');

      await userEvent.click(screen.getByRole('link', { name: 'Schedule' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Schedule', level: 1 })).toBeVisible();
      });
    });

    test('Grocery List link renders Grocery List Page', async () => {
      renderWithRouter(<App />, '/');

      await userEvent.click(screen.getByRole('link', { name: 'Grocery List' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Grocery List', level: 1 })).toBeVisible();
      });
    });

    test('Settings link renders Settings Page', async () => {
      renderWithRouter(<App />, '/');

      await userEvent.click(screen.getByRole('link', { name: 'Settings' }));

      expect(screen.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();

    });
  });

  describe('when user is not logged in', () => {
    beforeEach(() => {
      //@ts-ignore
      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback: any) => {
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
        const scheduleLink = screen.getByRole('link', { name: 'Schedule' });
        const mealsLink = screen.getByRole('link', { name: 'Meals' });
        const groceryListLink = screen.getByRole('link', { name: 'Grocery List' });
        const settingsLink = screen.getByRole('link', { name: 'Settings' });
        expect(scheduleLink).toBeVisible();
        expect(mealsLink).toBeVisible();
        expect(groceryListLink).toBeVisible();
        expect(settingsLink).toBeVisible();
      });
    });

    test('Meals link redirects to Login Page', async () => {
      renderWithRouter(<App />, '/');

      await userEvent.click(screen.getByRole('link', { name: 'Meals' }));

      await waitFor(() => {
        expect(screen.getByText('Log In with Google')).toBeVisible();
      });
    });

    test('Schedule link redirects to Login Page', async () => {
      renderWithRouter(<App />, '/');

      await userEvent.click(screen.getByRole('link', { name: 'Schedule' }));

      await waitFor(() => {
        expect(screen.getByText('Log In with Google')).toBeVisible();
      });
    });

    test('Grocery List link redirects to Login Page', async () => {
      renderWithRouter(<App />, '/');

      await userEvent.click(screen.getByRole('link', { name: 'Grocery List' }));

      await waitFor(() => {
        expect(screen.getByText('Log In with Google')).toBeVisible();
      });
    });

    test('Settings link redirects to Login Page', async () => {
      renderWithRouter(<App />, '/');

      await userEvent.click(screen.getByRole('link', { name: 'Settings' }));

      await waitFor(() => {
        expect(screen.getByText('Log In with Google')).toBeVisible();
      });
    });
  });
});