import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Meals from '../src/pages/Meals';
import { renderWithUserData } from './userDataHarness';
import MealFormModal from '../src/components/MealFormModal';
import { type UserData, type MealType } from '../src/utils/types';

// Stand in for the picker chunk: the real one fetches emoji data over the
// network, which jsdom has none of.
vi.mock('../src/components/emojiPicker', () => ({
  loadEmojiPicker: vi.fn(() => Promise.resolve({ default: () => <div>emoji picker</div> })),
}));

// Opened from the Meals page's "add new meal" button, as a user creates a meal
describe('MealFormModal creating a meal', () => {
  beforeEach(async () => {
    const mockUserData: UserData = {
      meals: [
        { id: 'eggs', name: 'Eggs', emoji: '🥚', ingredients: [] },
        { id: 'salad', name: 'Salad', emoji: '🥗', ingredients: [] },
        { id: 'hot-dogs', name: 'Hot dogs', emoji: '🌭', ingredients: [] },
      ],
      schedule: [{ date: Date.now(), breakfast: '', lunch: '', dinner: '' }],
      groceryList: [],
    };

    renderWithUserData(<Meals />, mockUserData);
    const createButton = screen.getByRole('button', { name: 'add new meal' });
    await userEvent.click(createButton);
  });

  test('renders all inputs', () => {
    const chooseEmojiButton = screen.getByRole('button', { name: 'choose emoji' });
    const nameInput = screen.getByLabelText(/Meal Name/);
    const addIngredientButton = screen.getByRole('button', { name: 'add ingredient' });

    expect(chooseEmojiButton).toBeVisible();
    expect(nameInput).toBeVisible();
    expect(addIngredientButton).toBeVisible();
  });

  test('modal closes on cancel', async () => {
    const title = screen.getByText(/Create New Meal/);
    const cancelButton = screen.getByRole('button', { name: 'cancel' });
    await userEvent.click(cancelButton);

    expect(title).not.toBeVisible();
  });

  test('saves meal on submit', async () => {
    const modalTitle = screen.getByText(/Create New Meal/);
    const nameInput = screen.getByLabelText(/Meal Name/);
    const addIngredientButton = screen.getByRole('button', { name: 'add ingredient' });

    await userEvent.type(nameInput, 'Pancakes');
    await userEvent.click(addIngredientButton);
    const ingredientNameInput = screen.getByRole('textbox', { name: 'ingredient name' });
    const quantityInput = screen.getByRole('spinbutton', { name: 'ingredient quantity' });
    const unitsInput = screen.getByRole('textbox', { name: 'ingredient units' });
    await userEvent.type(ingredientNameInput, 'Milk');
    await userEvent.type(quantityInput, '1');
    await userEvent.type(unitsInput, 'cup');

    const saveButton = screen.getByRole('button', { name: 'save meal' });
    await userEvent.click(saveButton);

    expect(modalTitle).not.toBeVisible();
    const pancakes = screen.getByText(/Pancakes/);
    expect(pancakes).toBeVisible();
  });

  // Two meals with the same name are indistinguishable in the schedule dropdown
  test('refuses to save a meal whose name is already taken', async () => {
    await userEvent.type(screen.getByLabelText(/Meal Name/), 'salad');

    // the clash is called out as the user types, not after a failed save
    expect(screen.getByRole('alert')).toHaveTextContent('You already have a meal called "salad"');
    expect(screen.getByRole('button', { name: 'save meal' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'save meal' }));
    expect(screen.getByText(/Create New Meal/)).toBeVisible();
  });

  test('refuses to save a meal with no name', async () => {
    expect(screen.getByRole('button', { name: 'save meal' })).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/Meal Name/), '   ');
    expect(screen.getByRole('button', { name: 'save meal' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'save meal' }));
    expect(screen.getByText(/Create New Meal/)).toBeVisible();
  });

  test('enables save once the name is present and unique', async () => {
    await userEvent.type(screen.getByLabelText(/Meal Name/), 'Pancakes');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'save meal' })).toBeEnabled();
  });

  test('re-enables save when a clashing name is corrected', async () => {
    const nameInput = screen.getByLabelText(/Meal Name/);
    await userEvent.type(nameInput, 'Salad');
    expect(screen.getByRole('button', { name: 'save meal' })).toBeDisabled();

    await userEvent.type(nameInput, ' rolls');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'save meal' })).toBeEnabled();
  });
});

describe('MealFormModal editing an existing meal', () => {
  beforeEach(async () => {
    const mockUserData: UserData = {
      meals: [
        {
          id: 'spaghetti',
          name: 'Spaghetti',
          emoji: '🍝',
          ingredients: [
            { name: 'Noodles', quantity: 1, units: 'boxes' },
            { name: 'Sauce', quantity: 2, units: 'jars' },
          ],
        },
      ],
      schedule: [{ date: Date.now(), breakfast: '', lunch: '', dinner: '' }],
      groceryList: [],
    };

    renderWithUserData(<Meals />, mockUserData);
    await userEvent.click(screen.getByRole('button', { name: 'options for Spaghetti' }));
    const editButton = screen.getByRole('button', { name: 'edit' });
    await userEvent.click(editButton);
  });

  test('renders all elements', () => {
    const chooseEmojiButton = screen.getByRole('button', { name: 'choose emoji' });
    const nameInput = screen.getByLabelText(/Meal Name/);
    const firstIngredientNameInput = screen.getByDisplayValue(/Noodles/);
    const firstIngredientQuantityInput = screen.getByDisplayValue('1');
    const firstIngredientUnitsInput = screen.getByDisplayValue(/boxes/);
    const secondIngredientNameInput = screen.getByDisplayValue(/Sauce/);
    const secondIngredientQuantityInput = screen.getByDisplayValue('2');
    const secondIngredientUnitsInput = screen.getByDisplayValue(/jars/);
    const addIngredientButton = screen.getByRole('button', { name: 'add ingredient' });

    expect(chooseEmojiButton).toBeVisible();
    expect(nameInput).toBeVisible();
    expect(firstIngredientNameInput).toBeVisible();
    expect(firstIngredientQuantityInput).toBeVisible();
    expect(firstIngredientUnitsInput).toBeVisible();
    expect(secondIngredientNameInput).toBeVisible();
    expect(secondIngredientQuantityInput).toBeVisible();
    expect(secondIngredientUnitsInput).toBeVisible();
    expect(addIngredientButton).toBeVisible();
  });

  test('modal closes on cancel', async () => {
    const title = screen.getByText(/Edit Meal/);
    const cancelButton = screen.getByRole('button', { name: 'cancel' });
    await userEvent.click(cancelButton);

    expect(title).not.toBeVisible();
  });

  // test('opens emoji picker when choose emoji button is clicked', async () => {
  //   const chooseEmojiButton = screen.getByRole('button', { name: 'choose emoji' });
  //   await userEvent.click(chooseEmojiButton);
  // const emojiButtons = document.body.querySelectorAll('.epr-btn');
  // expect(emojiButtons.length).toBeGreaterThan(0);
  // });

  test('saves meal on submit', async () => {
    const modalTitle = screen.getByText(/Edit Meal/);
    const nameInput = screen.getByLabelText(/Meal Name/);
    // const chooseEmojiButton = screen.getByRole('button', { name: 'choose emoji' });

    await userEvent.type(nameInput, 'Pancakes');
    // await userEvent.click(chooseEmojiButton);
    // const pancakeEmoji = screen.getByRole('button', { name: 'pancakes' });
    // await userEvent.click(pancakeEmoji);
    const firstIngredientNameInput = screen.getByDisplayValue(/Noodles/);
    const firstIngredientQuantityInput = screen.getByDisplayValue('1');
    const firstIngredientUnitsInput = screen.getByDisplayValue(/boxes/);
    const secondIngredientNameInput = screen.getByDisplayValue(/Sauce/);
    const secondIngredientQuantityInput = screen.getByDisplayValue('2');
    const secondIngredientUnitsInput = screen.getByDisplayValue(/jars/);

    await userEvent.clear(firstIngredientNameInput);
    await userEvent.type(firstIngredientNameInput, 'Milk');
    await userEvent.clear(firstIngredientQuantityInput);
    await userEvent.type(firstIngredientQuantityInput, '1');
    await userEvent.clear(firstIngredientUnitsInput);
    await userEvent.type(firstIngredientUnitsInput, 'cups');

    await userEvent.clear(secondIngredientNameInput);
    await userEvent.type(secondIngredientNameInput, 'Eggs');
    await userEvent.clear(secondIngredientQuantityInput);
    await userEvent.type(secondIngredientQuantityInput, '2');
    await userEvent.clear(secondIngredientUnitsInput);
    await userEvent.type(secondIngredientUnitsInput, 'eggs');

    const saveButton = screen.getByRole('button', { name: 'save meal' });
    await userEvent.click(saveButton);

    expect(modalTitle).not.toBeVisible();
    const pancakes = screen.getByText(/Pancakes/);
    const milk = screen.getByText(/Milk/);
    const one = screen.getByText(/1/);
    const cups = screen.getByText(/cups/);
    const eggs = screen.getByText(/Eggs/);
    const two = screen.getByText(/2/);
    const eggUnits = screen.getByText(/eggs/);
    expect(pancakes).toBeVisible();
    expect(milk).toBeVisible();
    expect(eggs).toBeVisible();
    expect(one).toBeVisible();
    expect(cups).toBeVisible();
    expect(two).toBeVisible();
    expect(eggUnits).toBeVisible();
  });
});

describe('MealFormModal meal matching', () => {
  // Regression: the modal used to find its meal with `m === meal`, which stops
  // matching as soon as the array holds equal-but-distinct objects (a refetch,
  // or any immutable update).
  test('edits the right meal when the object reference has changed', async () => {
    const meal: MealType = { id: 'spaghetti', name: 'Spaghetti', emoji: '🍝', ingredients: [] };
    const other: MealType = { id: 'tacos', name: 'Tacos', emoji: '🌮', ingredients: [] };
    const meals = [{ ...meal }, other];
    const setMeals = vi.fn();

    render(
      <MealFormModal
        title="Edit Meal"
        initialMeal={meal}
        meals={meals}
        onClose={vi.fn()}
        onSave={meal => setMeals(meals.map(m => (m.id === meal.id ? meal : m)))}
      />,
    );
    await userEvent.clear(screen.getByLabelText(/Meal Name/));
    await userEvent.type(screen.getByLabelText(/Meal Name/), 'Linguine');
    await userEvent.click(screen.getByRole('button', { name: 'save meal' }));

    expect(setMeals).toHaveBeenCalledWith([
      { id: 'spaghetti', name: 'Linguine', emoji: '🍝', ingredients: [] },
      other,
    ]);
  });
});

// Regression: IngredientsInput edited ingredient objects in place, and the
// modal seeded its state from meal.ingredients — the very objects held in
// userData. Typing applied the change immediately, and Cancel left it applied.
describe('MealFormModal cancelling', () => {
  const storedMeal: MealType = {
    id: 'spaghetti',
    name: 'Spaghetti',
    emoji: '🍝',
    ingredients: [{ name: 'Noodles', quantity: 1, units: 'boxes' }],
  };

  test('leaves the stored meal untouched while the user types', async () => {
    const setMeals = vi.fn();
    render(
      <MealFormModal
        title="Edit Meal"
        initialMeal={storedMeal}
        meals={[storedMeal]}
        onClose={vi.fn()}
        onSave={meal => setMeals([storedMeal].map(m => (m.id === meal.id ? meal : m)))}
      />,
    );

    await userEvent.clear(screen.getByRole('textbox', { name: 'ingredient name' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'ingredient name' }), 'Linguine');

    expect(storedMeal.ingredients[0].name).toBe('Noodles');
    expect(setMeals).not.toHaveBeenCalled();
  });

  test('discards ingredient edits on cancel', async () => {
    const setMeals = vi.fn();
    const setOpen = vi.fn();
    render(
      <MealFormModal
        title="Edit Meal"
        initialMeal={storedMeal}
        meals={[storedMeal]}
        onClose={setOpen}
        onSave={meal => setMeals([storedMeal].map(m => (m.id === meal.id ? meal : m)))}
      />,
    );

    await userEvent.clear(screen.getByRole('spinbutton', { name: 'ingredient quantity' }));
    await userEvent.type(screen.getByRole('spinbutton', { name: 'ingredient quantity' }), '9');
    await userEvent.click(screen.getByRole('button', { name: 'cancel' }));

    expect(setOpen).toHaveBeenCalledTimes(1);
    expect(setMeals).not.toHaveBeenCalled();
    expect(storedMeal.ingredients[0].quantity).toBe(1);
  });
});

// Issue 37: emoji-picker-react shipped in the main bundle for every visitor.
// It now lives in its own chunk, fetched as soon as a meal form opens so the
// picker is ready before the user asks for it.
//
// Only its absence from the DOM is asserted here: once mounted, the picker
// fetches its emoji set from a CDN, and with no network in jsdom it tears its
// own UI down again, so anything about its rendered DOM is unreliable.
describe('MealFormModal emoji picker', () => {
  test('starts fetching the picker when the form opens, before any click', async () => {
    const { loadEmojiPicker } = await import('../src/components/emojiPicker');
    const load = vi.mocked(loadEmojiPicker);
    load.mockClear();

    render(<MealFormModal title="Create New Meal" meals={[]} onSave={vi.fn()} onClose={vi.fn()} />);

    expect(load).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'choose emoji' })).toBeVisible();
  });

  test('does not render the picker until it is opened', () => {
    render(<MealFormModal title="Create New Meal" meals={[]} onSave={vi.fn()} onClose={vi.fn()} />);

    expect(screen.queryByPlaceholderText(/search/i)).not.toBeInTheDocument();
    expect(document.querySelector('.EmojiPickerReact')).toBeNull();
  });
});

// Issue 8: the form saved the untrimmed meal name and every ingredient row as
// entered, so an untouched "Add Ingredient" row became a nameless item with a
// quantity of 0 on the meal card and the grocery list.
describe('MealFormModal saving', () => {
  function renderForm(onSave = vi.fn()) {
    render(<MealFormModal title="Create New Meal" meals={[]} onSave={onSave} onClose={vi.fn()} />);
    return onSave;
  }

  const saveButton = () => screen.getByRole('button', { name: 'save meal' });

  test('saves the meal name without surrounding spaces', async () => {
    const onSave = renderForm();

    await userEvent.type(screen.getByLabelText(/Meal Name/), '  Pancakes  ');
    await userEvent.click(saveButton());

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Pancakes' }));
  });

  test('disables save while an ingredient has no name', async () => {
    const onSave = renderForm();
    await userEvent.type(screen.getByLabelText(/Meal Name/), 'Pancakes');

    await userEvent.click(screen.getByRole('button', { name: 'add ingredient' }));

    expect(saveButton()).toBeDisabled();
    expect(screen.getByText(/Every ingredient needs a name/)).toBeVisible();
    await userEvent.click(saveButton());
    expect(onSave).not.toHaveBeenCalled();
  });

  test('treats an ingredient name of only spaces as blank', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText(/Meal Name/), 'Pancakes');
    await userEvent.click(screen.getByRole('button', { name: 'add ingredient' }));

    await userEvent.type(screen.getByRole('textbox', { name: 'ingredient name' }), '   ');

    expect(saveButton()).toBeDisabled();
  });

  test('re-enables save once the blank ingredient is named', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText(/Meal Name/), 'Pancakes');
    await userEvent.click(screen.getByRole('button', { name: 'add ingredient' }));

    await userEvent.type(screen.getByRole('textbox', { name: 'ingredient name' }), 'Milk');

    expect(saveButton()).toBeEnabled();
    expect(screen.queryByText(/Every ingredient needs a name/)).not.toBeInTheDocument();
  });

  test('re-enables save once the blank ingredient is removed', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText(/Meal Name/), 'Pancakes');
    await userEvent.click(screen.getByRole('button', { name: 'add ingredient' }));

    await userEvent.click(screen.getByRole('button', { name: 'remove ingredient' }));

    expect(saveButton()).toBeEnabled();
  });

  test('starts a new ingredient with no quantity rather than 0', async () => {
    const onSave = renderForm();
    await userEvent.type(screen.getByLabelText(/Meal Name/), 'Pancakes');
    await userEvent.click(screen.getByRole('button', { name: 'add ingredient' }));

    expect(screen.getByRole('spinbutton', { name: 'ingredient quantity' })).toHaveValue(null);

    await userEvent.type(screen.getByRole('textbox', { name: 'ingredient name' }), 'Salt');
    await userEvent.click(saveButton());

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ ingredients: [{ name: 'Salt', quantity: undefined, units: '' }] }),
    );
  });
});
