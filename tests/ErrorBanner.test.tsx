import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBanner from '../src/components/ErrorBanner';

describe('ErrorBanner Component', () => {
  test('renders nothing when there is no message', () => {
    const { container } = render(<ErrorBanner message={null} onDismiss={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('announces the message as an alert', () => {
    render(<ErrorBanner message="Couldn't save your changes." onDismiss={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't save your changes.");
  });

  test('calls onDismiss when the dismiss button is clicked', async () => {
    const onDismiss = vi.fn();
    render(<ErrorBanner message="Something went wrong." onDismiss={onDismiss} />);
    await userEvent.click(screen.getByRole('button', { name: 'dismiss error' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
