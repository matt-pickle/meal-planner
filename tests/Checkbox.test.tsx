import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Checkbox from '../src/components/Checkbox';



describe('Checkbox Component', () => {
  test('renders checkbox', () => {
    render(<Checkbox id="test-checkbox" onChange={vi.fn()} ariaLabel="test checkbox" />);
    const checkbox = screen.getByRole('checkbox', { name: 'test checkbox' });

    expect(checkbox).toBeInTheDocument();
  });

  test('calls onChange when clicked', async () => {
    const mock = vi.fn();
    render(<Checkbox id="test-checkbox" onChange={mock} ariaLabel="test checkbox" />);
    const checkboxContainer = screen.getByRole('checkbox', { name: 'test checkbox' }).parentElement;
    await userEvent.click(checkboxContainer!);

    expect(mock).toHaveBeenCalledTimes(1);
  });

  test('shows icon when checked', async () => {
    render(<Checkbox id="test-checkbox" onChange={vi.fn()} ariaLabel="test checkbox" />);
    const checkboxContainer = screen.getByRole('checkbox', { name: 'test checkbox' }).parentElement;
    await userEvent.click(checkboxContainer!);

    const svg = checkboxContainer?.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  test('is checked when initialChecked prop is true', () => {
    render(<Checkbox id="test-checkbox" onChange={vi.fn()} initialChecked={true} ariaLabel="test checkbox" />);
    const checkbox = screen.getByRole('checkbox', { name: 'test checkbox' });

    expect(checkbox).toBeChecked();
  });

  test('size prop correctly sets the size', () => {
    render(<Checkbox id="test-checkbox" onChange={vi.fn()} size="50px" ariaLabel="test checkbox" />);
    const checkboxContainer = screen.getByRole('checkbox', { name: 'test checkbox' }).parentElement;

    expect(checkboxContainer).toHaveStyle({ width: '50px', height: '50px' });
  });

  test('color prop correctly sets the color', async () => {
    render(<Checkbox id="test-checkbox" onChange={vi.fn()} color="#ffbb00" ariaLabel="test checkbox" initialChecked={true} />);
    const checkboxContainer = screen.getByRole('checkbox', { name: 'test checkbox' }).parentElement;
    const svg = checkboxContainer?.querySelector('svg');

    expect(svg).toHaveStyle({ color: '#ffbb00' });
  });
});