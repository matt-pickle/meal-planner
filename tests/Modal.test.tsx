import { describe, test, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../src/components/Modal';

// The modal shell was copy-pasted across four components and implemented no
// dialog semantics: no role, no focus trap, no Escape, no backdrop click, and
// the page behind stayed scrollable.
describe('Modal', () => {
  function open(onClose = vi.fn()) {
    render(
      <Modal title="Edit Meal" onClose={onClose}>
        <button>First</button>
        <button>Second</button>
      </Modal>
    );
    return onClose;
  }

  test('exposes dialog semantics labelled by its title', () => {
    open();
    const dialog = screen.getByRole('dialog');

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Edit Meal');
  });

  test('moves focus into the dialog', () => {
    open();

    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
  });

  test('keeps Tab inside the dialog', async () => {
    open();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();

    await userEvent.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();
  });

  test('closes on Escape', async () => {
    const onClose = open();

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('closes on a backdrop click but not on a click inside the card', async () => {
    const onClose = open();

    await userEvent.click(screen.getByRole('button', { name: 'First' }));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('dialog').parentElement!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('locks scrolling behind it and restores it on close', async () => {
    function Harness() {
      const [isOpen, setIsOpen] = useState(true);
      return isOpen ? (
        <Modal title="Edit Meal" onClose={() => setIsOpen(false)}>
          <button>Close me</button>
        </Modal>
      ) : null;
    }
    render(<Harness />);
    expect(document.body.style.overflow).toBe('hidden');

    await userEvent.keyboard('{Escape}');

    expect(document.body.style.overflow).toBe('');
  });

  test('restores focus to whatever opened it', async () => {
    function Harness() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <button onClick={() => setIsOpen(true)}>Open</button>
          {isOpen && (
            <Modal title="Edit Meal" onClose={() => setIsOpen(false)}>
              <button>Inside</button>
            </Modal>
          )}
        </>
      );
    }
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Open' });

    await userEvent.click(opener);
    await userEvent.keyboard('{Escape}');

    expect(opener).toHaveFocus();
  });
});
