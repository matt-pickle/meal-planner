import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../src/pages/Meals';

describe('Meals Page', () => {
  test('renders Meals page with title', () => {
    render(<Button />);
    const title = screen.getByText('Meals Page');
    expect(title).toBeInTheDocument();
  });

  test('renders Add Meal button', () => {
    render(<Button />);
    const addMealButton = screen.getByRole('button', { name: 'Add Meal' });
    expect(addMealButton).toBeInTheDocument();
  });

  test('calls onClick handler when Add Meal button is clicked', async () => {
    const mock = vi.fn();
    render(<Button onClick={mock} />);
    const addMealButton = screen.getByRole('button', { name: 'Add Meal' });
    await userEvent.click(addMealButton);
    expect(mock).toHaveBeenCalledTimes(1);
  });
}