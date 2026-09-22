import { describe, test, expect, vi, beforeEach, type MockInstance } from 'vitest';
import { useState } from 'react';
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
    // Dropdown is fully controlled: the parent owns the value and updates it
    // from onSelect, which is what ScheduleDay -> App does in the app.
    function ControlledDropdown() {
      const [value, setValue] = useState('');
      return (
        <Dropdown
          placeholder="Select an option"
          options={mockOptions}
          value={value}
          onSelect={next => {
            setValue(next);
            mockOnSelect(next);
          }}
        />
      );
    }
    render(<ControlledDropdown />);
  });

  test('renders dropdown with correct placeholder', () => {
    const placeholder = screen.getByText('Select an option');
    expect(placeholder).toBeVisible();
  });

  test('opens and closes dropdown when clicked', async () => {
    const dropdown = screen.getByRole('combobox');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(dropdown).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(dropdown);
    expect(screen.getByRole('listbox')).toBeVisible();
    expect(dropdown).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(dropdown);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(dropdown).toHaveAttribute('aria-expanded', 'false');
  });

  test('selects option, calls onSelect handler, and closes dropdown when clicked', async () => {
    const dropdown = screen.getByRole('combobox');
    await userEvent.click(dropdown);
    await userEvent.click(screen.getByRole('option', { name: 'Option 1' }));

    expect(dropdown).toHaveTextContent('Option 1');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });
});

// Regression: the dropdown was built from divs with onClick and an aria-label
// on a non-interactive element, so it could not be reached or operated from
// the keyboard and exposed no combobox/listbox semantics.
describe('Dropdown keyboard support', () => {
  const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
  ];

  function ControlledDropdown({ onSelect = vi.fn() }: { onSelect?: (value: string) => void }) {
    const [value, setValue] = useState('');
    return (
      <Dropdown
        options={options}
        ariaLabel="meal"
        value={value}
        onSelect={next => {
          setValue(next);
          onSelect(next);
        }}
      />
    );
  }

  test('is reachable by tabbing', async () => {
    render(<ControlledDropdown />);

    await userEvent.tab();

    expect(screen.getByRole('combobox', { name: 'meal' })).toHaveFocus();
  });

  test('opens with the keyboard and selects with Enter', async () => {
    const onSelect = vi.fn();
    render(<ControlledDropdown onSelect={onSelect} />);

    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeVisible();

    await userEvent.keyboard('{ArrowDown}{Enter}');

    expect(onSelect).toHaveBeenCalledWith('2');
    expect(screen.getByRole('combobox', { name: 'meal' })).toHaveTextContent('Option 2');
  });

  test('closes on Escape and returns focus to the trigger', async () => {
    render(<ControlledDropdown />);
    const trigger = screen.getByRole('combobox', { name: 'meal' });

    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  test('marks the selected option for assistive technology', async () => {
    render(<ControlledDropdown />);

    await userEvent.click(screen.getByRole('combobox', { name: 'meal' }));
    await userEvent.click(screen.getByRole('option', { name: 'Option 3' }));
    await userEvent.click(screen.getByRole('combobox', { name: 'meal' }));

    expect(screen.getByRole('option', { name: 'Option 3' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('option', { name: 'Option 1' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });
});

// Issue 36: a slot could only be swapped, never emptied
describe('Dropdown clear option', () => {
  const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
  ];

  function ControlledDropdown({ startValue = '' }: { startValue?: string }) {
    const [value, setValue] = useState(startValue);
    return (
      <Dropdown
        options={options}
        ariaLabel="meal"
        placeholder="Select an option"
        clearLabel="— none —"
        value={value}
        onSelect={setValue}
      />
    );
  }

  test('is absent unless a clear label is given', async () => {
    render(<Dropdown options={options} ariaLabel="meal" onSelect={vi.fn()} />);

    await userEvent.click(screen.getByRole('combobox', { name: 'meal' }));

    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  test('offers the clear entry first', async () => {
    render(<ControlledDropdown />);

    await userEvent.click(screen.getByRole('combobox', { name: 'meal' }));

    expect(screen.getAllByRole('option')[0]).toHaveTextContent('— none —');
  });

  test('empties a chosen value', async () => {
    render(<ControlledDropdown startValue="2" />);
    const trigger = screen.getByRole('combobox', { name: 'meal' });
    expect(trigger).toHaveTextContent('Option 2');

    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('option', { name: '— none —' }));

    expect(trigger).toHaveTextContent('Select an option');
  });

  test('shows the placeholder rather than the clear label when nothing is chosen', () => {
    render(<ControlledDropdown />);

    expect(screen.getByRole('combobox', { name: 'meal' })).toHaveTextContent('Select an option');
  });

  test('marks the clear entry as the selected one while empty', async () => {
    render(<ControlledDropdown />);

    await userEvent.click(screen.getByRole('combobox', { name: 'meal' }));

    expect(screen.getByRole('option', { name: '— none —' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});

// Issue 41: each dropdown kept a document mousedown listener for its whole
// life, open or not. The schedule renders 42 of them, so every click on that
// page ran 42 handlers.
describe('Dropdown outside-click listener', () => {
  const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
  ];

  function mousedownListeners(spy: MockInstance) {
    return spy.mock.calls.filter(call => call[0] === 'mousedown');
  }

  test('listens on the document only while open', async () => {
    const addListener = vi.spyOn(document, 'addEventListener');
    const removeListener = vi.spyOn(document, 'removeEventListener');

    render(<Dropdown options={options} ariaLabel="meal" onSelect={vi.fn()} />);
    expect(mousedownListeners(addListener)).toHaveLength(0);

    await userEvent.click(screen.getByRole('combobox', { name: 'meal' }));
    expect(mousedownListeners(addListener)).toHaveLength(1);
    expect(mousedownListeners(removeListener)).toHaveLength(0);

    await userEvent.keyboard('{Escape}');
    expect(mousedownListeners(removeListener)).toHaveLength(1);

    addListener.mockRestore();
    removeListener.mockRestore();
  });

  test('still closes when a click lands outside it', async () => {
    render(
      <div>
        <p>elsewhere</p>
        <Dropdown options={options} ariaLabel="meal" onSelect={vi.fn()} />
      </div>,
    );

    await userEvent.click(screen.getByRole('combobox', { name: 'meal' }));
    expect(screen.getByRole('listbox')).toBeVisible();

    await userEvent.click(screen.getByText('elsewhere'));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
