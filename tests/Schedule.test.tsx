import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { updateUserData } from '../firebase/firebase';
import { type UserData } from '../src/utils/types';
import Schedule from '../src/pages/Schedule';

vi.mock('../firebase/firebase', () => {
  return {
    updateUserData: vi.fn(),
  };
});

describe('Schedule Page', () => {
  const mockUser: any = { uid: '123', email: 'test@example.com' };

  // The app stores schedule days at midnight; the page looks them up by that
  // exact timestamp.
  function midnightPlus(days: number) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return date.getTime();
  }

  const mockUserData: UserData = {
    meals: [
      { id: 'cereal', name: 'Cereal', emoji: '🥣', ingredients: [] },
      { id: 'turkey-sandwich', name: 'Turkey sandwich', emoji: '🥪', ingredients: [] },
      { id: 'spaghetti', name: 'Spaghetti', emoji: '🍝', ingredients: [] },
      { id: 'bacon-and-eggs', name: 'Bacon and eggs', emoji: '🥓', ingredients: [] },
      { id: 'hamburger', name: 'Hamburger', emoji: '🍔', ingredients: [] },
      { id: 'chicken', name: 'Chicken', emoji: '🍗', ingredients: [] },
    ],
    groceryList: [],
    schedule: [
      {
        date: midnightPlus(0),
        breakfast: 'cereal',
        lunch: 'turkey-sandwich',
        dinner: 'spaghetti',
      },
      {
        date: midnightPlus(1),
        breakfast: 'bacon-and-eggs',
        lunch: 'hamburger',
        dinner: 'chicken',
      },
    ],
  };

  beforeEach(() => {
    vi.mocked(updateUserData).mockClear();
    render(<Schedule userData={mockUserData} user={mockUser} />);
  });

  test('renders correct number of days', async () => {
    const dayNames = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];
    const daysRendered = screen.getAllByText(new RegExp(dayNames.join('|')));
    expect(daysRendered.length).toBe(14);
  });

  test('renders meals from userData', () => {
    const dropdowns = screen.getAllByRole('generic', { name: 'dropdown' });
    expect(dropdowns[0]).toHaveTextContent('🥣 Cereal');
    expect(dropdowns[1]).toHaveTextContent('🥪 Turkey sandwich');
    expect(dropdowns[2]).toHaveTextContent('🍝 Spaghetti');
    expect(dropdowns[3]).toHaveTextContent('🥓 Bacon and eggs');
    expect(dropdowns[4]).toHaveTextContent('🍔 Hamburger');
    expect(dropdowns[5]).toHaveTextContent('🍗 Chicken');
  });

  test('renders a dropdown for every meal of every day', () => {
    const dropdowns = screen.getAllByRole('generic', { name: 'dropdown' });
    expect(dropdowns.length).toBe(42);
  });

  test('assigns the selected meal and saves it', async () => {
    const dropdown = screen.getAllByRole('generic', { name: 'dropdown' })[0];
    const options = dropdown.parentElement as HTMLElement;

    await userEvent.click(dropdown);
    await userEvent.click(within(options).getByText(/Hamburger/));

    expect(dropdown).toHaveTextContent('🍔 Hamburger');
    expect(mockUserData.schedule[0].breakfast).toBe('hamburger');
    expect(updateUserData).toHaveBeenCalledWith('123', {
      schedule: mockUserData.schedule,
      meals: mockUserData.meals,
      groceryList: mockUserData.groceryList,
    });
  });
});

// Regression: the backfill assumed stored future days ran contiguously from
// today, deriving new dates from how many there were. With a gap it generated
// timestamps that collided with existing days, so the page rendered duplicate
// cards and assignMeal's findIndex edited the first of them.
describe('Schedule Page with a gap in the stored schedule', () => {
  const mockUser: any = { uid: '123', email: 'test@example.com' };

  function midnightPlus(days: number) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return date.getTime();
  }

  const gappedUserData: UserData = {
    meals: [{ id: 'cereal', name: 'Cereal', emoji: '🥣', ingredients: [] }],
    groceryList: [],
    // nothing for today or tomorrow: the user has been away
    schedule: [
      { date: midnightPlus(3), breakfast: 'cereal', lunch: '', dinner: '' },
      { date: midnightPlus(9), breakfast: '', lunch: 'cereal', dinner: '' },
    ],
  };

  test('renders exactly 14 distinct days', () => {
    render(<Schedule userData={gappedUserData} user={mockUser} />);

    const dayHeadings = screen.getAllByRole('heading', { level: 2 });
    const dates = dayHeadings.map(heading => heading.textContent);
    expect(dates).toHaveLength(14);
    expect(new Set(dates).size).toBe(14);
  });

  test('keeps the stored days in place rather than duplicating them', () => {
    render(<Schedule userData={gappedUserData} user={mockUser} />);

    const dropdowns = screen.getAllByRole('generic', { name: 'dropdown' });
    // day index 3, breakfast slot -> the stored 'cereal' assignment
    expect(dropdowns[3 * 3]).toHaveTextContent('🥣 Cereal');
    // day index 9, lunch slot
    expect(dropdowns[9 * 3 + 1]).toHaveTextContent('🥣 Cereal');
    expect(gappedUserData.schedule.filter(day => day.date === midnightPlus(3))).toHaveLength(1);
  });
});
