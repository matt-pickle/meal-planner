import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';
import { MemoryRouter, useLocation } from 'react-router';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getUserData, updateUserData } from '../firebase/firebase';
import { type UserData } from '../src/utils/types';

vi.mock('firebase/auth', () => {
  return {
    onAuthStateChanged: vi.fn(),
  };
});

vi.mock('../firebase/firebase', () => {
  const mockUser = { uid: '123', email: 'test@test.com' };
  return {
    auth: { currentUser: mockUser },
    getUserData: vi.fn(async () => ({ meals: [], schedule: [], groceryList: [] })),
    updateUserData: vi.fn(),
    logOut: vi.fn(),
  };
});

function renderWithRouter(component: React.ReactNode, initialPath: string) {
  return render(<MemoryRouter initialEntries={[initialPath]}>{component}</MemoryRouter>);
}

// Renders the current path so a test can assert where the app settled, rather
// than catching a transient render mid-navigation.
function LocationProbe() {
  return <div data-testid="path">{useLocation().pathname}</div>;
}

function renderWithProbe(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
      <LocationProbe />
    </MemoryRouter>,
  );
}

// Lets every queued promise continuation and the renders they cause run
async function settle() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('App Component', () => {
  describe('when user is logged in', () => {
    beforeEach(() => {
      vi.mocked(onAuthStateChanged).mockImplementation(((_auth: unknown, callback: unknown) => {
        const mockUser = { uid: '321', email: 'test@test.com' } as unknown as User;
        (callback as (user: User | null) => void)(mockUser);
        return vi.fn();
      }) as unknown as typeof onAuthStateChanged);
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

    // Regression: data pages used to mount before getUserData resolved, seeding
    // their state from undefined and autosaving that over the saved document.
    test('shows a loading state instead of a data page until userData arrives', async () => {
      vi.mocked(getUserData).mockImplementationOnce(() => new Promise(() => {}));
      renderWithRouter(<App />, '/grocery-list');

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(/Loading/);
      });
      expect(
        screen.queryByRole('heading', { name: 'Grocery List', level: 1 }),
      ).not.toBeInTheDocument();
    });

    // Regression: past days were never pruned, so they accumulated in the
    // document forever and were carried on every read and write.
    test('drops past schedule days when the schedule is written', async () => {
      function midnightPlus(days: number) {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + days);
        return date.getTime();
      }
      vi.mocked(getUserData).mockImplementationOnce(async () => ({
        meals: [],
        groceryList: [],
        schedule: [
          { date: midnightPlus(-30), breakfast: 'old', lunch: '', dinner: '' },
          { date: midnightPlus(-1), breakfast: 'old', lunch: '', dinner: '' },
          { date: midnightPlus(0), breakfast: 'keep', lunch: '', dinner: '' },
        ],
      }));

      renderWithRouter(<App />, '/schedule');

      // the page fills in the missing days of the window, which triggers a write
      await waitFor(() => expect(updateUserData).toHaveBeenCalled());
      const written = vi.mocked(updateUserData).mock.calls.at(-1)![1].schedule!;
      expect(written.filter(day => day.date < midnightPlus(0))).toEqual([]);
      expect(written).toHaveLength(14);
      expect(written.find(day => day.date === midnightPlus(0))?.breakfast).toBe('keep');
    });

    // Regression: every auth-state firing navigated to /schedule, so a refresh
    // on another page, or a deep link, bounced the user away.
    test('leaves a deep link where it is', async () => {
      renderWithProbe('/meals');
      await settle();

      expect(screen.getByTestId('path')).toHaveTextContent('/meals');
      expect(screen.getByRole('heading', { name: 'Meals', level: 1 })).toBeVisible();
    });

    test('still sends a user landing on / to the schedule', async () => {
      renderWithProbe('/');
      await settle();

      expect(screen.getByTestId('path')).toHaveTextContent('/schedule');
    });

    test('still sends a user landing on /login to the schedule', async () => {
      renderWithProbe('/login');
      await settle();

      expect(screen.getByTestId('path')).toHaveTextContent('/schedule');
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
      vi.mocked(onAuthStateChanged).mockImplementation(((_auth: unknown, callback: unknown) => {
        (callback as (user: User | null) => void)(null);
        return vi.fn();
      }) as unknown as typeof onAuthStateChanged);
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

// Regression: nothing checked, once getUserData resolved, that the same user
// was still signed in. A fetch that finished after an account switch put the
// previous user's data on screen, and the Schedule page's backfill then wrote
// it into the new user's document.
describe('App account switching', () => {
  const alice = { uid: 'alice' } as unknown as User;
  const bob = { uid: 'bob' } as unknown as User;

  // Each user's fetch stays pending until the test resolves it
  const fetches = new Map<string, (data: UserData) => void>();
  let emit: (user: User | null) => void;

  // One meal, planned for today's breakfast, so a saved schedule shows whose
  // data it came from
  function dataWithMeal(id: string, name: string): UserData {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      meals: [{ id, name, emoji: '🍽️', ingredients: [] }],
      groceryList: [],
      schedule: [{ date: today.getTime(), breakfast: id, lunch: '', dinner: '' }],
    };
  }

  // Resolves a pending fetch and waits a task, so a React update it causes has
  // rendered before the test looks
  async function finishFetch(uid: string, data: UserData) {
    await act(async () => {
      fetches.get(uid)!(data);
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  }

  function savedBreakfasts() {
    return vi
      .mocked(updateUserData)
      .mock.calls.flatMap(([uid, data]) =>
        (data.schedule ?? []).map(day => `${uid}:${day.breakfast}`),
      )
      .filter(entry => !entry.endsWith(':'));
  }

  beforeEach(() => {
    fetches.clear();
    vi.mocked(onAuthStateChanged).mockImplementation(((_auth: unknown, callback: unknown) => {
      emit = callback as (user: User | null) => void;
      return vi.fn();
    }) as unknown as typeof onAuthStateChanged);
    vi.mocked(getUserData).mockImplementation(
      uid => new Promise(resolve => fetches.set(uid, resolve)),
    );
  });

  afterEach(() => {
    vi.mocked(getUserData).mockReset();
  });

  test("ignores the previous user's fetch when it finishes after they sign out", async () => {
    renderWithRouter(<App />, '/schedule');
    act(() => {
      emit(alice);
    });
    act(() => {
      emit(null);
    });
    act(() => {
      emit(bob);
    });

    await finishFetch('alice', dataWithMeal('alice-cereal', "Alice's Cereal"));

    expect(screen.getByRole('status')).toHaveTextContent(/Loading/);
    expect(updateUserData).not.toHaveBeenCalled();

    await finishFetch('bob', dataWithMeal('bob-toast', "Bob's Toast"));

    // the schedule backfill saves Bob's own schedule, and nothing of Alice's
    await waitFor(() => expect(savedBreakfasts()).toContain('bob:bob-toast'));
    expect(savedBreakfasts()).toEqual(['bob:bob-toast']);
  });

  test("stops showing the previous user's data as soon as another user signs in", async () => {
    renderWithRouter(<App />, '/meals');
    act(() => {
      emit(alice);
    });
    await finishFetch('alice', dataWithMeal('alice-cereal', "Alice's Cereal"));
    expect(screen.getByText(/Alice's Cereal/)).toBeVisible();

    act(() => {
      emit(bob);
    });

    expect(screen.getByRole('status')).toHaveTextContent(/Loading/);
    expect(screen.queryByText(/Alice's Cereal/)).not.toBeInTheDocument();
  });
});
