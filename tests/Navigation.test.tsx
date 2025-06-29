import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import Navigation from '../src/components/Navigation';

function renderWithRouter(component: React.ReactNode) {
  return render(<BrowserRouter>{component}</BrowserRouter>);
}

describe('Navigation Component', () => {
  beforeEach(() => {
    renderWithRouter(<Navigation />);
  });

  test('renders navigation links', () => {
    const scheduleLink = screen.getByText('Schedule');
    const mealsLink = screen.getByText('Meals');
    const groceryListLink = screen.getByText('Grocery List');
    const settingsLink = screen.getByText('Settings');

    expect(scheduleLink).toBeInTheDocument();
    expect(mealsLink).toBeInTheDocument();
    expect(groceryListLink).toBeInTheDocument();
    expect(settingsLink).toBeInTheDocument();
  });

  test('Meals link goes to correct route on click', async () => {
    const model = screen.getByText('Meals');
    await userEvent.click(model);
    expect(window.location.pathname).toBe('/meals');
  });

  test('Schedule link goes to correct route on click', async () => {
    const model = screen.getByText('Schedule');
    await userEvent.click(model);
    expect(window.location.pathname).toBe('/schedule');
  });

  test('Grocery List link goes to correct route on click', async () => {
    const model = screen.getByText('Grocery List');
    await userEvent.click(model);
    expect(window.location.pathname).toBe('/grocery-list');
  });

  test('Settings link goes to correct route on click', async () => {
    const model = screen.getByText('Settings');
    await userEvent.click(model);
    expect(window.location.pathname).toBe('/settings');
  });
});
