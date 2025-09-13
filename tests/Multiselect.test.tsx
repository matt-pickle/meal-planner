import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Multiselect from '../src/components/Multiselect';

describe('Multiselect Component', () => {
  const mockOnSelect = vi.fn();

  beforeEach(async () => {
    const mockOptions = [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' },
    ];
    render(
      <Multiselect placeholder="Select option(s)" options={mockOptions} onSelect={mockOnSelect} />
    );
  });

  test('renders dropdown with correct placeholder', () => {
    const placeholder = screen.getByText('Select option(s)');
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

  test('selects option and calls onSelect handler when clicked', async () => {
    const dropdown = screen.getByRole('generic', { name: 'dropdown' });
    const option = screen.getByText('Option 1');
    const icon = within(option).getByRole('generic', { name: 'check icon' });
    await userEvent.click(dropdown);
    await userEvent.click(option);
    expect(option).toHaveClass('selected');
    expect(icon).toBeVisible();
    expect(dropdown).toHaveTextContent('Option 1');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  test('deselects option when clicked again', async () => {
    const dropdown = screen.getByRole('generic', { name: 'dropdown' });
    const option = screen.getByText('Option 1');
    const icon = within(option).getByRole('generic', { name: 'check icon' });
    await userEvent.click(dropdown);
    await userEvent.click(option);
    await userEvent.click(option);
    expect(option).not.toHaveClass('selected');
    expect(icon).toHaveClass('invisible');
    expect(dropdown).toHaveTextContent('Select option(s)');
  });
});
