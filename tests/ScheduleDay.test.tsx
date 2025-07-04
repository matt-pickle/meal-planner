import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { type UserData } from '../firebase/firebase.ts';
import ScheduleDay from '../src/components/ScheduleDay';

describe('ScheduleDay Component', () => {
  const mockMeals: UserData['meals'] = [
    { name: 'Cereal', emoji: '🥣', ingredients: [] },
    { name: 'Turkey sandwich', emoji: '🥪', ingredients: [] },
    { name: 'Hamburger', emoji: '🍔', ingredients: [] },
  ];
  const mockSetModalIsOpen = vi.fn();
  const mockSetCurrentMealType = vi.fn();
  const mockSetCurrentDay = vi.fn();

  beforeEach(() => {
    render(
      <ScheduleDay
        date={Date.now()}
        breakfast="Cereal"
        lunch="Turkey sandwich"
        dinner="Hamburger"
        meals={mockMeals}
        setModalIsOpen={mockSetModalIsOpen}
        setMealToEdit={mockSetCurrentMealType}
        setDateToEdit={mockSetCurrentDay}
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

  test('renders edit buttons for each meal', () => {
    const editButtons = screen.getAllByRole('button', { name: 'edit' });
    expect(editButtons.length).toBe(3);
  });
});
