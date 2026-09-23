import { describe, test, expect } from 'vitest';
import {
  withoutPastDays,
  isDuplicateMealName,
  startOfToday,
  parseQuantity,
} from '../src/utils/utils';

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

describe('startOfToday', () => {
  test('is local midnight at the start of today', () => {
    const today = new Date(startOfToday());
    const now = new Date();

    expect([today.getHours(), today.getMinutes(), today.getSeconds()]).toEqual([0, 0, 0]);
    expect(today.toDateString()).toBe(now.toDateString());
  });
});

// Issue 17: this logic was copied between the grocery and ingredient inputs
describe('parseQuantity', () => {
  test('reads an empty field as no quantity', () => {
    expect(parseQuantity('')).toBeUndefined();
  });

  test('reads numbers, including 0 and decimals', () => {
    expect(parseQuantity('3')).toBe(3);
    expect(parseQuantity('0')).toBe(0);
    expect(parseQuantity('1.5')).toBe(1.5);
  });

  test('rejects a negative amount or something that is not a number', () => {
    expect(parseQuantity('-1')).toBeNull();
    expect(parseQuantity('abc')).toBeNull();
  });
});
