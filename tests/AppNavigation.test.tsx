import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import App from '../src/App';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getUserData } from '../firebase/firebase';
import { type UserData } from '../src/utils/types';

vi.mock('firebase/auth', () => ({ onAuthStateChanged: vi.fn() }));

function midnightPlus(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.getTime();
}

// Regression: the auth listener depended on `navigate`, whose identity changes
// on every navigation. Re-subscribing re-fired the listener, which refetched
// the document and replaced the in-memory copy — so anything changed since the
// last fetch was thrown away just by moving between pages.
describe('App navigation', () => {
  const mockUser = { uid: '123' } as unknown as User;

  function storedData(): UserData {
    return {
      meals: [{ id: 'cereal', name: 'Cereal', emoji: '🥣', ingredients: [] }],
      groceryList: [{ id: 'cheese', name: 'Cheese', quantity: 1, units: 'lbs', status: 'to buy' }],
      schedule: Array.from({ length: 14 }, (_, index) => ({
        date: midnightPlus(index),
        breakfast: '',
        lunch: '',
        dinner: '',
      })),
    };
  }

  beforeEach(() => {
    vi.mocked(onAuthStateChanged).mockImplementation(((_auth: unknown, callback: unknown) => {
      (callback as (user: User) => void)(mockUser);
      return vi.fn();
    }) as unknown as typeof onAuthStateChanged);
    vi.mocked(getUserData).mockReset();
    vi.mocked(getUserData).mockResolvedValue(storedData());
  });

  async function goTo(page: 'Schedule' | 'Meals' | 'Grocery List') {
    await userEvent.click(screen.getByRole('link', { name: page }));
    await screen.findByRole('heading', { name: page, level: 1 });
  }

  test('keeps a schedule assignment when leaving the page and coming back', async () => {
    render(
      <MemoryRouter initialEntries={['/schedule']}>
        <App />
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0));

    const breakfast = screen.getAllByRole('combobox')[0];
    await userEvent.click(breakfast);
    await userEvent.click(within(breakfast.parentElement!).getByRole('option', { name: /Cereal/ }));
    expect(screen.getAllByRole('combobox')[0]).toHaveTextContent('Cereal');

    await goTo('Meals');
    await goTo('Schedule');

    expect(screen.getAllByRole('combobox')[0]).toHaveTextContent('Cereal');
  });

  test('fetches the user document once, not on every navigation', async () => {
    render(
      <MemoryRouter initialEntries={['/schedule']}>
        <App />
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0));

    await goTo('Meals');
    await goTo('Grocery List');
    await goTo('Schedule');

    expect(getUserData).toHaveBeenCalledTimes(1);
  });

  test('keeps a grocery edit when leaving the page and coming back', async () => {
    render(
      <MemoryRouter initialEntries={['/schedule']}>
        <App />
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0));
    await goTo('Grocery List');

    await userEvent.click(screen.getByRole('button', { name: 'add item' }));
    expect(screen.getAllByRole('textbox', { name: 'item name' })).toHaveLength(2);

    await goTo('Meals');
    await goTo('Grocery List');

    expect(screen.getAllByRole('textbox', { name: 'item name' })).toHaveLength(2);
  });
});

// Regression: Firebase reports no user for the first few hundred ms after a
// page load. PrivateRoutes treated that as signed out and redirected to
// /login, and the auth listener then forwarded /login to /schedule — so
// refreshing on another page, or following a deep link, never landed there.
describe('App deep links', () => {
  const mockUser = { uid: '123' } as unknown as User;

  function storedData(): UserData {
    return { meals: [], groceryList: [], schedule: [] };
  }

  function signInAfterRestore() {
    // as Firebase does: the listener fires once the session is restored, a
    // tick after the first render rather than during it
    vi.mocked(onAuthStateChanged).mockImplementation(((_auth: unknown, callback: unknown) => {
      setTimeout(() => (callback as (user: User) => void)(mockUser), 0);
      return vi.fn();
    }) as unknown as typeof onAuthStateChanged);
    vi.mocked(getUserData).mockResolvedValue(storedData());
  }

  test('lands on the page that was asked for', async () => {
    signInAfterRestore();

    render(
      <MemoryRouter initialEntries={['/grocery-list']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Grocery List', level: 1 })).toBeVisible();
  });

  test('shows a loading state rather than the login page while auth is pending', async () => {
    signInAfterRestore();

    render(
      <MemoryRouter initialEntries={['/meals']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('status')).toHaveTextContent(/Loading/);
    expect(screen.queryByRole('heading', { name: 'Log In' })).not.toBeInTheDocument();

    expect(await screen.findByRole('heading', { name: 'Meals', level: 1 })).toBeVisible();
  });

  test('still sends a signed-out visitor to the login page', async () => {
    vi.mocked(onAuthStateChanged).mockImplementation(((_auth: unknown, callback: unknown) => {
      setTimeout(() => (callback as (user: User | null) => void)(null), 0);
      return vi.fn();
    }) as unknown as typeof onAuthStateChanged);

    render(
      <MemoryRouter initialEntries={['/meals']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Log In' })).toBeVisible();
  });
});
