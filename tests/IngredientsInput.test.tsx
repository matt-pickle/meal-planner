import { useState } from 'react';
import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IngredientsInput from '../src/components/IngredientsInput';
import { type Ingredient } from '../src/utils/types';

describe('IngredientsInput Component', () => {
  beforeEach(async () => {
    const mockStartingIngredients: Array<Ingredient> = [
      { name: 'Milk', quantity: 1, units: "cup" },
      { name: 'Eggs', quantity: 1, units: "egg" },
      { name: 'Flour', quantity: 1, units: "cup" },
    ];
    function IngredientsInputTestWrapper() {
      const [ingredients, setIngredients] = useState<Array<Ingredient>>(mockStartingIngredients);
      return <IngredientsInput ingredients={ingredients} setIngredients={setIngredients} />;
    }
    render(<IngredientsInputTestWrapper />);
  });

  test('renders starting ingredients', () => {
    const milk = screen.getByDisplayValue('Milk');
    const eggs = screen.getByDisplayValue('Eggs');
    const flour = screen.getByDisplayValue('Flour');
    expect(milk).toBeVisible();
    expect(eggs).toBeVisible();
    expect(flour).toBeVisible();
  });

  test('adds new input row when "Add Ingredient" button is clicked', async () => {
    const addButton = screen.getByRole('button', { name: 'add ingredient' });
    await userEvent.click(addButton);
    const removeButtons = screen.getAllByRole('button', { name: 'remove ingredient' });
    expect(removeButtons).toHaveLength(4);
  });

  test('removes input row when remove button is clicked', async () => {
    const removeButtons = screen.getAllByRole('button', { name: 'remove ingredient' });
    await userEvent.click(removeButtons[0]);
    const milk = screen.queryByText('Milk');
    expect(milk).not.toBeInTheDocument();
  });
});