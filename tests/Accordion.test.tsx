import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Accordion from '../src/components/Accordion';

describe('Accordion Component', () => {
  beforeEach(async () => {
    const mockHeading: string = 'Bought Items';
    const mockContent: Array<React.JSX.Element> = [
      <div key="item1">Item 1</div>,
      <div key="item2">Item 2</div>,
    ];

    render(<Accordion heading={mockHeading} content={mockContent} />);
  });

  test('renders all elements', () => {
    const heading = screen.getByText('Bought Items');
    const toggleButton = screen.getByRole('button', { name: 'toggle accordion' });

    expect(heading).toBeVisible();
    expect(toggleButton).toBeVisible();
  });

  test('rotates toggle button on click', async () => {
    const toggleButton = screen.getByRole('button', { name: 'toggle accordion' });

    // Initial state
    expect(toggleButton).toHaveClass('rotate-0');

    // Click to open
    await userEvent.click(toggleButton);
    expect(toggleButton).toHaveClass('rotate-180');

    // Click to close
    await userEvent.click(toggleButton);
    expect(toggleButton).toHaveClass('rotate-0');
  });

  test('toggles content visibility on button click', async () => {
    const toggleButton = screen.getByRole('button', { name: 'toggle accordion' });
    const container = screen.getByTestId('accordion-content');

    // Initially closed
    expect(container).not.toBeVisible();

    // Click to open
    await userEvent.click(toggleButton);
    expect(container).toBeVisible();

    // Click to close
    await userEvent.click(toggleButton);
    expect(container).not.toBeVisible();
  });

  test('describes its state for assistive technology', async () => {
    const toggleButton = screen.getByRole('button', { name: 'toggle accordion' });
    const container = screen.getByTestId('accordion-content');

    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(toggleButton).toHaveAttribute('aria-controls', container.id);

    await userEvent.click(toggleButton);

    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
  });

  test('keeps collapsed content out of the accessibility tree', () => {
    // hidden content must not be reachable: it used to stay focusable and
    // announced while collapsed to a zero-height grid row
    expect(screen.queryByText('Item 1')).not.toBeVisible();
  });
});
