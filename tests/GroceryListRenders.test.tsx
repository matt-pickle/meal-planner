import { describe, test, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroceryList from '../src/pages/GroceryList';
import { renderWithUserData } from './userDataHarness';
import { type UserData } from '../src/utils/types';

// Issue 22: every keystroke in one grocery row re-rendered every row, because
// each row was handed the whole list and a setter that changed with it.
//
// Each row renders exactly one Checkbox, so a stand-in that records its renders
// counts row renders. It lives in its own file so the stand-in replaces the
// real Checkbox here only.
const checkboxRenders = vi.hoisted(() => [] as Array<string>);
vi.mock('../src/components/Checkbox', () => ({
  default: ({ id }: { id: string }) => {
    checkboxRenders.push(id);
    return <span data-testid={id} />;
  },
}));

const userData: UserData = {
  meals: [],
  schedule: [],
  groceryList: [
    { id: 'cheese', name: 'Cheese', quantity: 1, units: 'lbs', status: 'to buy' },
    { id: 'milk', name: 'Milk', quantity: 2, units: 'cups', status: 'to buy' },
    { id: 'eggs', name: 'Eggs', quantity: 12, units: 'eggs', status: 'to buy' },
  ],
};

describe('GroceryList row rendering', () => {
  beforeEach(() => {
    renderWithUserData(<GroceryList />, userData);
    checkboxRenders.length = 0;
  });

  test('typing in one row re-renders only that row', async () => {
    await userEvent.type(screen.getByDisplayValue('Cheese'), 'y');

    expect(checkboxRenders).toEqual(['checkbox-cheese']);
  });

  test('deleting a row re-renders none of the others', async () => {
    const [deleteCheese] = screen.getAllByRole('button', { name: 'delete item' });

    await userEvent.click(deleteCheese);

    expect(screen.queryByDisplayValue('Cheese')).not.toBeInTheDocument();
    expect(checkboxRenders).toEqual([]);
  });

  // The row callbacks keep one identity by reading the latest list rather than
  // closing over it, so they must never work from a stale copy
  test('keeps every edit when several rows are changed in turn', async () => {
    await userEvent.type(screen.getByDisplayValue('Cheese'), 'y');
    await userEvent.type(screen.getByDisplayValue('Milk'), 'shake');
    await userEvent.click(screen.getAllByRole('button', { name: 'delete item' })[2]);
    await userEvent.type(screen.getByDisplayValue('Cheesey'), 's');

    expect(
      screen
        .getAllByRole('textbox', { name: 'item name' })
        .map(input => input.getAttribute('value')),
    ).toEqual(['Cheeseys', 'Milkshake']);
  });
});
