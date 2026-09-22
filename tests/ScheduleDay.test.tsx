import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type UserData } from '../src/utils/types';
import ScheduleDay from '../src/components/ScheduleDay';

describe('ScheduleDay Component', () => {
  const mockMeals: UserData['meals'] = [
    { id: 'cereal', name: 'Cereal', emoji: '🥣', ingredients: [] },
    { id: 'turkey-sandwich', name: 'Turkey sandwich', emoji: '🥪', ingredients: [] },
    { id: 'hamburger', name: 'Hamburger', emoji: '🍔', ingredients: [] },
  ];
  const mockDate = 1764299759000;
  const mockOnMealChange = vi.fn();

  beforeEach(() => {
    mockOnMealChange.mockClear();
    render(
      <ScheduleDay
        date={mockDate}
        breakfast="cereal"
        lunch="turkey-sandwich"
        dinner="hamburger"
        meals={mockMeals}
        onMealChange={mockOnMealChange}
      />
    );
  });

  test('renders the date with MM/DD/YY format', async () => {
    const dates = screen.getAllByText(/THURSDAY/);
    const dateFormatIsCorrect = dates[0].parentElement?.textContent?.match(/\d{1,2}\/\d{1,2}\/\d{2}/);
    expect(dateFormatIsCorrect).toBeTruthy();
  });

  test('renders breakfast with emoji', () => {
    const breakfast = screen.getByText(/BREAKFAST:/).parentElement;
    expect(breakfast).toHaveTextContent('🥣 Cereal');
  });

  test('renders lunch with emoji', () => {
    const lunch = screen.getByText(/LUNCH:/).parentElement;
    expect(lunch).toHaveTextContent('🥪 Turkey sandwich');
  });

  test('renders dinner with emoji', () => {
    const dinner = screen.getByText(/DINNER:/).parentElement;
    expect(dinner).toHaveTextContent('🍔 Hamburger');
  });

  test('renders a dropdown for each meal', () => {
    const dropdowns = screen.getAllByRole('generic', { name: 'dropdown' });
    expect(dropdowns.length).toBe(3);
  });

  test('reports the new meal when an option is selected', async () => {
    const lunchSection = screen.getByText(/LUNCH:/).parentElement as HTMLElement;
    const dropdown = within(lunchSection).getByRole('generic', { name: 'dropdown' });

    await userEvent.click(dropdown);
    await userEvent.click(within(lunchSection).getByText(/Hamburger/));

    expect(mockOnMealChange).toHaveBeenCalledTimes(1);
    expect(mockOnMealChange).toHaveBeenCalledWith(mockDate, 'lunch', 'hamburger');
    expect(dropdown).toHaveTextContent('🍔 Hamburger');
  });

  // Regression: slots used to store the meal's name, so renaming a meal
  // orphaned every day it was assigned to and the card rendered blank.
  test('still shows the meal after it has been renamed', () => {
    const renamed: UserData['meals'] = [
      { id: 'turkey-sandwich', name: 'Club sandwich', emoji: '🥪', ingredients: [] },
    ];
    render(
      <ScheduleDay
        date={mockDate}
        breakfast=""
        lunch="turkey-sandwich"
        dinner=""
        meals={renamed}
        onMealChange={mockOnMealChange}
      />
    );

    // Assert on the dropdown's selected display, not the section: every option
    // label is always in the DOM, just visually collapsed.
    const lunches = screen.getAllByText(/LUNCH:/);
    const lunchSection = lunches[lunches.length - 1].parentElement as HTMLElement;
    const selected = within(lunchSection).getByRole('generic', { name: 'dropdown' });
    expect(selected).toHaveTextContent('🥪 Club sandwich');
  });
});
