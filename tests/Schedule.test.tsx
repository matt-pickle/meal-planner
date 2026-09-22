import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type UserData } from '../src/utils/types';
import Schedule from '../src/pages/Schedule';

// Schedule no longer mutates userData or writes to Firestore: App owns the
// schedule and persists it. This harness plays App's part and records what the
// page asked to persist.
const persisted: Array<UserData['schedule']> = [];

function ScheduleHarness({ initialUserData }: { initialUserData: UserData }) {
  const [userData, setUserData] = useState<UserData>(initialUserData);
  return (
    <Schedule
      userData={userData}
      setSchedule={schedule => {
        persisted.push(schedule);
        setUserData(current => ({ ...current, schedule }));
      }}
    />
  );
}

function lastPersisted() {
  return persisted[persisted.length - 1];
}

describe('Schedule Page', () => {

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
    persisted.length = 0;
    render(<ScheduleHarness initialUserData={mockUserData} />);
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
    const dropdowns = screen.getAllByRole('combobox');
    expect(dropdowns[0]).toHaveTextContent('🥣 Cereal');
    expect(dropdowns[1]).toHaveTextContent('🥪 Turkey sandwich');
    expect(dropdowns[2]).toHaveTextContent('🍝 Spaghetti');
    expect(dropdowns[3]).toHaveTextContent('🥓 Bacon and eggs');
    expect(dropdowns[4]).toHaveTextContent('🍔 Hamburger');
    expect(dropdowns[5]).toHaveTextContent('🍗 Chicken');
  });

  test('renders a dropdown for every meal of every day', () => {
    const dropdowns = screen.getAllByRole('combobox');
    expect(dropdowns.length).toBe(42);
  });

  test('assigns the selected meal and saves it', async () => {
    const dropdown = screen.getAllByRole('combobox')[0];
    const options = dropdown.parentElement as HTMLElement;

    await userEvent.click(dropdown);
    await userEvent.click(within(options).getByText(/Hamburger/));

    expect(dropdown).toHaveTextContent('🍔 Hamburger');
    const today = lastPersisted().find(day => day.date === midnightPlus(0));
    expect(today?.breakfast).toBe('hamburger');
    // the stored array itself is never mutated
    expect(mockUserData.schedule[0].breakfast).toBe('cereal');
  });
});

// Regression: the backfill assumed stored future days ran contiguously from
// today, deriving new dates from how many there were. With a gap it generated
// timestamps that collided with existing days, so the page rendered duplicate
// cards and assignMeal's findIndex edited the first of them.
describe('Schedule Page with a gap in the stored schedule', () => {

  function midnightPlus(days: number) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return date.getTime();
  }

  beforeEach(() => {
    persisted.length = 0;
  });

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
    render(<ScheduleHarness initialUserData={gappedUserData} />);

    const dayHeadings = screen.getAllByRole('heading', { level: 2 });
    const dates = dayHeadings.map(heading => heading.textContent);
    expect(dates).toHaveLength(14);
    expect(new Set(dates).size).toBe(14);
  });

  test('keeps the stored days in place rather than duplicating them', () => {
    render(<ScheduleHarness initialUserData={gappedUserData} />);

    const dropdowns = screen.getAllByRole('combobox');
    // day index 3, breakfast slot -> the stored 'cereal' assignment
    expect(dropdowns[3 * 3]).toHaveTextContent('🥣 Cereal');
    // day index 9, lunch slot
    expect(dropdowns[9 * 3 + 1]).toHaveTextContent('🥣 Cereal');
    expect(lastPersisted().filter(day => day.date === midnightPlus(3))).toHaveLength(1);
  });
});

// Regression: days were generated by adding 86400000 ms. The day US clocks fall
// back is 25 hours long, so that increment lands at 23:00 the same calendar day
// — a repeated date, and timestamps that no longer match the midnight-aligned
// values used for lookups. Stepping calendar days with setDate() is exact.
// The timezone is pinned to America/New_York in vite.config.ts.
describe('Schedule Page across a daylight-saving transition', () => {
  const emptyUserData: UserData = { meals: [], groceryList: [], schedule: [] };

  beforeEach(() => {
    persisted.length = 0;
    vi.useFakeTimers();
    // US clocks fall back on 2026-11-01, inside the next 14 days
    vi.setSystemTime(new Date(2026, 9, 30, 9, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders 14 consecutive calendar days', () => {
    render(<ScheduleHarness initialUserData={emptyUserData} />);

    const dates = screen
      .getAllByRole('heading', { level: 2 })
      .map(heading => heading.textContent?.replace(/^[A-Z]+ /, ''));

    expect(dates).toEqual([
      '10/30/26', '10/31/26', '11/1/26', '11/2/26', '11/3/26', '11/4/26', '11/5/26',
      '11/6/26', '11/7/26', '11/8/26', '11/9/26', '11/10/26', '11/11/26', '11/12/26',
    ]);
  });

  test('generates midnight-aligned timestamps on both sides of the change', () => {
    render(<ScheduleHarness initialUserData={emptyUserData} />);

    lastPersisted().forEach(day => {
      const date = new Date(day.date);
      expect([date.getHours(), date.getMinutes()]).toEqual([0, 0]);
    });
  });
});

// Regression: the page used to push missing days into userData.schedule from
// inside the render body — a side effect during render, and one that was never
// persisted unless the user happened to assign a meal.
describe('Schedule Page side effects', () => {
  beforeEach(() => {
    persisted.length = 0;
  });

  test('does not mutate the schedule it was given while rendering', () => {
    const frozen: UserData = {
      meals: [],
      groceryList: [],
      schedule: Object.freeze([]) as unknown as UserData['schedule'],
    };

    expect(() => render(<ScheduleHarness initialUserData={frozen} />)).not.toThrow();
  });

  test('persists the days it creates', () => {
    render(<ScheduleHarness initialUserData={{ meals: [], groceryList: [], schedule: [] }} />);

    expect(persisted).toHaveLength(1);
    expect(lastPersisted()).toHaveLength(14);
    expect(lastPersisted().every(day => day.breakfast === '')).toBe(true);
  });

  test('creates only the days that are missing', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = { date: today.getTime(), breakfast: 'x', lunch: '', dinner: '' };

    render(
      <ScheduleHarness
        initialUserData={{ meals: [], groceryList: [], schedule: [existing] }}
      />
    );

    expect(lastPersisted()).toHaveLength(14);
    expect(lastPersisted().filter(day => day.date === existing.date)).toEqual([existing]);
  });
});
