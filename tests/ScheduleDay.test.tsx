import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type UserData } from '../firebase/firebase.ts';
import ScheduleDay from '../src/components/ScheduleDay';

describe('ScheduleDay Component', () => {
  const mockMeals: UserData['meals'] = [
    { name: 'Cereal', emoji: '🥣', ingredients: [] },
    { name: 'Turkey sandwich', emoji: '🥪', ingredients: [] },
    { name: 'Hamburger', emoji: '🍔', ingredients: [] },
  ];

  beforeEach(() => {
    render(
      <ScheduleDay
        date={Date.now()}
        breakfast="Cereal"
        lunch="Turkey sandwich"
        dinner="Hamburger"
        meals={mockMeals}
      />
    );
  });

  test('renders the date with MM/DD/YY format', async () => {
    const dates = screen.getAllByText(/Date:/);
    const dateFormatIsCorrect = dates[0].textContent?.match(/\d{1,2}\/\d{1,2}\/\d{2}/);
    expect(dateFormatIsCorrect).toBeTruthy();
  });

  test('renders breakfast with emoji', () => {
    const breakfast = screen.getByText(/Breakfast:/);
    expect(breakfast).toHaveTextContent('🥣 Cereal');
  });

  test('renders lunch with emoji', () => {
    const lunch = screen.getByText(/Lunch:/);
    expect(lunch).toHaveTextContent('🥪 Turkey sandwich');
  });

  test('renders dinner with emoji', () => {
    const dinner = screen.getByText(/Dinner:/);
    expect(dinner).toHaveTextContent('🍔 Hamburger');
  });
});
