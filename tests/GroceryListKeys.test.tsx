import { describe, test, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroceryList from '../src/pages/GroceryList';
import { renderWithUserData } from './userDataHarness';
import { type UserData } from '../src/utils/types';

// Regression: the two lists were keyed by the index *within the filtered list*.
// Checking an item off moves it between them and reshuffles every later key, so
// React reused the wrong DOM nodes for the items that shifted up.
describe('GroceryList item keys', () => {

  function userData(): UserData {
    return {
      meals: [],
      schedule: [],
      groceryList: [
        { id: 'a', name: 'Apples', quantity: 1, units: 'bags', status: 'to buy' },
        { id: 'b', name: 'Bananas', quantity: 2, units: 'bunches', status: 'to buy' },
        { id: 'c', name: 'Carrots', quantity: 3, units: 'lbs', status: 'to buy' },
      ],
    };
  }

  function rowOf(name: string) {
    return screen.getByDisplayValue(name).closest('.grocery-item') as HTMLElement;
  }

  test('keeps each item on its own DOM node when one is checked off', async () => {
    renderWithUserData(<GroceryList />, userData());
    const carrotsInput = screen.getByDisplayValue('Carrots');

    await userEvent.click(
      within(rowOf('Bananas')).getByRole('checkbox', { name: 'mark as bought' })
    );

    // Carrots shifted up a position; with index keys it would be re-rendered
    // into the node that belonged to Bananas.
    expect(screen.getByDisplayValue('Carrots')).toBe(carrotsInput);
  });

  test('moves only the checked item to the bought list', async () => {
    renderWithUserData(<GroceryList />, userData());

    await userEvent.click(
      within(rowOf('Bananas')).getByRole('checkbox', { name: 'mark as bought' })
    );

    // the bought section is collapsed by default
    await userEvent.click(screen.getByRole('button', { name: 'toggle accordion' }));

    const boughtCheckboxes = screen
      .getAllByRole('checkbox', { name: 'mark as bought' })
      .filter(checkbox => (checkbox as HTMLInputElement).checked);
    expect(boughtCheckboxes).toHaveLength(1);
    expect(within(rowOf('Bananas')).getByRole('checkbox')).toBeChecked();
    expect(within(rowOf('Apples')).getByRole('checkbox')).not.toBeChecked();
    expect(within(rowOf('Carrots')).getByRole('checkbox')).not.toBeChecked();
  });
});
