import { describe, test, expect } from 'vitest';
import { withoutPastDays, isDuplicateMealName } from '../src/utils/utils';

function midnightPlus(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.getTime();
}

describe('withoutPastDays', () => {
  test('drops days before today and keeps today onward', () => {
    const schedule = [
      { date: midnightPlus(-400) },
      { date: midnightPlus(-1) },
      { date: midnightPlus(0) },
      { date: midnightPlus(13) },
    ];

    expect(withoutPastDays(schedule)).toEqual([
      { date: midnightPlus(0) },
      { date: midnightPlus(13) },
    ]);
  });

  test('keeps today even when the clock has moved past midnight', () => {
    expect(withoutPastDays([{ date: midnightPlus(0) }])).toHaveLength(1);
  });

  test('returns a new array rather than mutating its argument', () => {
    const schedule = [{ date: midnightPlus(-1) }, { date: midnightPlus(1) }];
    const result = withoutPastDays(schedule);

    expect(schedule).toHaveLength(2);
    expect(result).not.toBe(schedule);
  });
});

describe('isDuplicateMealName', () => {
  const meals = [
    { id: 'a', name: 'Spaghetti' },
    { id: 'b', name: 'Tacos' },
  ];

  test('matches regardless of case and surrounding space', () => {
    expect(isDuplicateMealName('  spaghetti ', meals)).toBe(true);
  });

  test('does not count the meal being edited as a duplicate', () => {
    expect(isDuplicateMealName('Spaghetti', meals, 'a')).toBe(false);
  });

  test('allows an unused name', () => {
    expect(isDuplicateMealName('Pancakes', meals)).toBe(false);
  });
});
