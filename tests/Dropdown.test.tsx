import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dropdown from '../src/components/Dropdown';

describe('Dropdown Component', () => {
  const mockOnSelect = vi.fn();
  
  beforeEach(async () => {
    const mockOptions = [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' },
    ];
    render(<Dropdown placeholder="Select an option" options={mockOptions} onSelect={mockOnSelect} />);
  });

  test('renders dropdown with correct placeholder', () => {
    const placeholder = screen.getByText('Select an option');
    expect(placeholder).toBeVisible();
  });

  test('opens and closes dropdown when clicked', async () => {
    const dropdown = screen.getByRole('generic', { name: 'dropdown' });
    const optionsContainer = screen.getByText('Option 1').parentElement;
    await userEvent.click(dropdown);
    expect(optionsContainer).toHaveClass('max-h-48');
    expect(optionsContainer).toHaveClass('opacity-100');
    await userEvent.click(dropdown);
    expect(optionsContainer).toHaveClass('max-h-0');
    expect(optionsContainer).toHaveClass('opacity-0');

  });

  test('selects option, calls onSelect handler, and closes dropdown when clicked', async () => {
    const dropdown = screen.getByRole('generic', { name: 'dropdown' });
    const option = screen.getByText('Option 1');
    const optionsContainer = option.parentElement;
    await userEvent.click(dropdown);
    await userEvent.click(option);
    expect(dropdown).toHaveTextContent('Option 1');
    expect(optionsContainer).toHaveClass('max-h-0');
    expect(optionsContainer).toHaveClass('opacity-0');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });
});