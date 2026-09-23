import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Meal from '../src/components/Meal';
import { type MealType } from '../src/utils/types';

const spaghetti: MealType = {
  id: 'spaghetti',
  name: 'Spaghetti',
  emoji: '🍝',
  ingredients: [
    { name: 'Noodles', quantity: 1, units: 'boxes' },
    { name: 'Salt', quantity: undefined, units: '' },
  ],
};

function renderMeal() {
  const props = {
    setEditMealModalIsOpen: vi.fn(),
    setMealToEdit: vi.fn(),
    setDeleteMealModalIsOpen: vi.fn(),
    setMealToDelete: vi.fn(),
  };
  render(
    <>
      <Meal meal={spaghetti} {...props} />
      <p>elsewhere</p>
    </>,
  );
  return props;
}

const optionsButton = () => screen.getByRole('button', { name: 'options for Spaghetti' });

describe('Meal Component', () => {
  test('shows the meal and its ingredients', () => {
    renderMeal();

    expect(screen.getByRole('heading', { name: /Spaghetti/ })).toBeVisible();
    expect(screen.getByText(/Noodles/)).toBeVisible();
    expect(screen.getByText(/Salt/)).toBeVisible();
  });

  // Issue 16: the dots button had no name, and the collapsed menu was hidden
  // only by max-height, so EDIT and DELETE stayed tabbable and were read out
  // for every card while invisible
  test('names the options button and reports it as collapsed', () => {
    renderMeal();

    expect(optionsButton()).toHaveAttribute('aria-expanded', 'false');
    expect(optionsButton()).toHaveAttribute('type', 'button');
  });

  test('keeps Edit and Delete out of the page while the menu is closed', () => {
    renderMeal();

    expect(screen.queryByRole('button', { name: 'edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'delete' })).not.toBeInTheDocument();
  });

  test('opens the menu it controls', async () => {
    renderMeal();

    await userEvent.click(optionsButton());

    expect(optionsButton()).toHaveAttribute('aria-expanded', 'true');
    const menu = document.getElementById(optionsButton().getAttribute('aria-controls')!);
    expect(menu).toContainElement(screen.getByRole('button', { name: 'edit' }));
    expect(menu).toContainElement(screen.getByRole('button', { name: 'delete' }));
  });

  test('reaches Edit and Delete with Tab once open', async () => {
    renderMeal();
    await userEvent.tab();
    expect(optionsButton()).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'edit' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'delete' })).toHaveFocus();
  });

  test('closes on Escape and returns focus to the options button', async () => {
    renderMeal();
    await userEvent.click(optionsButton());
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'edit' })).toHaveFocus();

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('button', { name: 'edit' })).not.toBeInTheDocument();
    expect(optionsButton()).toHaveAttribute('aria-expanded', 'false');
    expect(optionsButton()).toHaveFocus();
  });

  test('closes when clicking elsewhere on the page', async () => {
    renderMeal();
    await userEvent.click(optionsButton());

    fireEvent.mouseDown(screen.getByText('elsewhere'));

    expect(screen.queryByRole('button', { name: 'edit' })).not.toBeInTheDocument();
  });

  test('Edit opens the edit modal for this meal and closes the menu', async () => {
    const props = renderMeal();
    await userEvent.click(optionsButton());

    await userEvent.click(screen.getByRole('button', { name: 'edit' }));

    expect(props.setMealToEdit).toHaveBeenCalledWith(spaghetti);
    expect(props.setEditMealModalIsOpen).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('button', { name: 'edit' })).not.toBeInTheDocument();
  });

  test('Delete opens the delete modal for this meal and closes the menu', async () => {
    const props = renderMeal();
    await userEvent.click(optionsButton());

    await userEvent.click(screen.getByRole('button', { name: 'delete' }));

    expect(props.setMealToDelete).toHaveBeenCalledWith(spaghetti);
    expect(props.setDeleteMealModalIsOpen).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('button', { name: 'delete' })).not.toBeInTheDocument();
  });
});
