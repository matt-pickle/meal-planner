import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../src/components/Button';

describe('Button Component', () => {
  test('renders button with correct label', () => {
    render(<Button text="Click Me" />);
    const button = screen.getByText('Click Me');
    expect(button).toBeInTheDocument();
  });

  test('renders button with icon', () => {
    const icon = (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z" />
      </svg>
    );
    render(<Button icon={icon} />);
    const button = screen.getByRole('button');
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  test('calls onClick handler when clicked', async () => {
    const mock = vi.fn();
    render(<Button onClick={mock} />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(mock).toHaveBeenCalledTimes(1);
  });

  test('applies custom class overrides', () => {
    render(<Button classOverrides="text-red-950" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-red-950');
  });
});

// Issue 19: an omitted classOverrides was interpolated as the literal class
// "undefined"
describe('Button classOverrides', () => {
  test('adds no stray class when classOverrides is omitted', () => {
    render(<Button text="Click Me" />);

    expect(screen.getByRole('button')).not.toHaveClass('undefined');
  });

  test('adds the classes it is given', () => {
    render(<Button text="Click Me" classOverrides="mt-4 ml-9" />);

    expect(screen.getByRole('button')).toHaveClass('mt-4', 'ml-9');
  });
});
