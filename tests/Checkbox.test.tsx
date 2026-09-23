import { describe, test, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Checkbox from '../src/components/Checkbox';

// Checkbox is controlled: the parent owns `checked` and updates it from onChange.
function ControlledCheckbox({ startChecked = false }: { startChecked?: boolean }) {
  const [checked, setChecked] = useState(startChecked);
  return (
    <Checkbox
      id="test-checkbox"
      ariaLabel="test checkbox"
      checked={checked}
      onChange={setChecked}
    />
  );
}

describe('Checkbox Component', () => {
  test('renders checkbox', () => {
    render(
      <Checkbox id="test-checkbox" checked={false} onChange={vi.fn()} ariaLabel="test checkbox" />,
    );

    expect(screen.getByRole('checkbox', { name: 'test checkbox' })).toBeInTheDocument();
  });

  test('calls onChange with the new value when clicked', async () => {
    const mock = vi.fn();
    render(
      <Checkbox id="test-checkbox" checked={false} onChange={mock} ariaLabel="test checkbox" />,
    );
    const checkboxContainer = screen.getByRole('checkbox', { name: 'test checkbox' }).parentElement;

    await userEvent.click(checkboxContainer!);

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(true);
  });

  test('is checked when the checked prop is true', () => {
    render(
      <Checkbox id="test-checkbox" checked={true} onChange={vi.fn()} ariaLabel="test checkbox" />,
    );

    expect(screen.getByRole('checkbox', { name: 'test checkbox' })).toBeChecked();
  });

  test('shows icon when checked', () => {
    render(
      <Checkbox id="test-checkbox" checked={true} onChange={vi.fn()} ariaLabel="test checkbox" />,
    );
    const checkboxContainer = screen.getByRole('checkbox', { name: 'test checkbox' }).parentElement;

    expect(checkboxContainer?.querySelector('svg')).toBeInTheDocument();
  });

  test('does not move on its own when the parent keeps the value unchanged', async () => {
    render(
      <Checkbox id="test-checkbox" checked={false} onChange={vi.fn()} ariaLabel="test checkbox" />,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'test checkbox' });

    await userEvent.click(checkbox.parentElement!);

    expect(checkbox).not.toBeChecked();
  });

  test('follows the parent through a toggle', async () => {
    render(<ControlledCheckbox />);
    const checkbox = screen.getByRole('checkbox', { name: 'test checkbox' });

    await userEvent.click(checkbox.parentElement!);
    expect(checkbox).toBeChecked();

    await userEvent.click(checkbox.parentElement!);
    expect(checkbox).not.toBeChecked();
  });

  // Issue 15: the input was hidden with Tailwind's `hidden` (display: none),
  // which takes it out of the tab order and the accessibility tree. jsdom
  // applies no Tailwind CSS, so the keyboard test below passes either way; the
  // class check is what catches that regression here.
  test('keeps the input focusable, hidden only visually', () => {
    render(<ControlledCheckbox />);

    const checkbox = screen.getByRole('checkbox', { name: 'test checkbox' });
    expect(checkbox).not.toHaveClass('hidden');
    expect(checkbox).toHaveClass('sr-only');
  });

  test('can be reached with Tab and toggled with Space', async () => {
    render(<ControlledCheckbox />);
    const checkbox = screen.getByRole('checkbox', { name: 'test checkbox' });

    await userEvent.tab();
    expect(checkbox).toHaveFocus();

    await userEvent.keyboard(' ');
    expect(checkbox).toBeChecked();

    await userEvent.keyboard(' ');
    expect(checkbox).not.toBeChecked();
  });

  test('size prop correctly sets the size', () => {
    render(
      <Checkbox
        id="test-checkbox"
        checked={false}
        onChange={vi.fn()}
        size="50px"
        ariaLabel="test checkbox"
      />,
    );
    const checkboxContainer = screen.getByRole('checkbox', { name: 'test checkbox' }).parentElement;

    expect(checkboxContainer).toHaveStyle({ width: '50px', height: '50px' });
  });

  test('color prop correctly sets the color', () => {
    render(
      <Checkbox
        id="test-checkbox"
        checked={true}
        onChange={vi.fn()}
        color="#ffbb00"
        ariaLabel="test checkbox"
      />,
    );
    const svg = screen
      .getByRole('checkbox', { name: 'test checkbox' })
      .parentElement?.querySelector('svg');

    expect(svg).toHaveStyle({ color: '#ffbb00' });
  });
});
