import { useEffect, useState } from 'react';
import { useUserData } from '../state/UserDataContext';
import { type GroceryItemType, type MealSlot } from '../utils/types';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Accordion from '../components/Accordion';
import GroceryItem from '../components/GroceryItem';
import AddFromMealsModal from '../components/AddFromMealsModal';

// Grocery items are matched on name + units, ignoring case and surrounding
// spaces, so "Eggs" and "eggs " share a row. The separator cannot appear in
// either, so "Salt|tsp" as a name can't collide with Salt in tsp.
function itemKey(name: string, units: string) {
  return `${name.trim().toLowerCase()}\u0000${units.trim().toLowerCase()}`;
}

// A missing quantity counts as 0 only beside a real one; two missing ones stay
// missing, since a 0 on the list reads as "buy none". Summed explicitly because
// a truthiness test treats a quantity of 0 as missing.
function addQuantities(a: number | undefined, b: number | undefined) {
  if (a === undefined && b === undefined) return undefined;
  return (a ?? 0) + (b ?? 0);
}

export default function GroceryList() {
  // The list itself lives in the store, which debounces the write for us
  const { userData, setGroceryList, flushGroceryList } = useUserData();
  const groceryItems = userData.groceryList;

  // Leaving the page counts as walking away: write a pending edit now rather
  // than letting it sit out the debounce. Nothing waits on the write here.
  useEffect(() => () => void flushGroceryList(), [flushGroceryList]);
  const [addFromMealsModalIsOpen, setAddFromMealsModalIsOpen] = useState(false);
  const [ingredientsToAdd, setIngredientsToAdd] = useState<Array<GroceryItemType>>([]);

  function addGroceryItem() {
    const newItem: GroceryItemType = {
      id: crypto.randomUUID(),
      name: '',
      quantity: undefined,
      units: '',
      status: 'to buy',
    };
    const updatedItems = [...groceryItems, newItem];
    setGroceryList(updatedItems);
  }

  // Totals up the ingredients for every meal scheduled from today onward
  function getIngredientsFromMeals(): Array<GroceryItemType> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingDays = userData.schedule.filter(day => day.date >= today.getTime());
    const slots: Array<MealSlot> = ['breakfast', 'lunch', 'dinner'];
    const mealsById = new Map(userData.meals.map(meal => [meal.id, meal]));

    // Totals keyed by name + units, so each ingredient is found in one step
    // rather than by scanning what has been gathered so far
    const totals = new Map<string, GroceryItemType>();

    upcomingDays.forEach(day => {
      slots.forEach(slot => {
        const meal = mealsById.get(day[slot]);
        if (!meal) return;

        meal.ingredients.forEach(ingredient => {
          const key = itemKey(ingredient.name, ingredient.units);
          const existingItem = totals.get(key);
          if (existingItem) {
            existingItem.quantity = addQuantities(existingItem.quantity, ingredient.quantity);
          } else {
            totals.set(key, {
              id: crypto.randomUUID(),
              name: ingredient.name,
              quantity: ingredient.quantity,
              units: ingredient.units,
              status: 'to buy',
            });
          }
        });
      });
    });

    return [...totals.values()];
  }

  function openAddFromMealsModal() {
    setIngredientsToAdd(getIngredientsFromMeals());
    setAddFromMealsModalIsOpen(true);
  }

  function addIngredientsFromMeals() {
    const updatedGroceryList = [...groceryItems];

    // Where each name + units already sits on the list, so the merge below is
    // one lookup per ingredient. The first item still to buy wins; a bought
    // item is only used when no such item exists.
    const indexByKey = new Map<string, number>();
    updatedGroceryList.forEach((item, index) => {
      const key = itemKey(item.name, item.units);
      const current = indexByKey.get(key);
      const replacesBought =
        current !== undefined &&
        updatedGroceryList[current].status === 'bought' &&
        item.status === 'to buy';
      if (current === undefined || replacesBought) indexByKey.set(key, index);
    });

    ingredientsToAdd.forEach(ingredient => {
      const key = itemKey(ingredient.name, ingredient.units);
      const existingIndex = indexByKey.get(key);

      if (existingIndex === undefined) {
        indexByKey.set(key, updatedGroceryList.length);
        updatedGroceryList.push({ ...ingredient });
      } else {
        // Replace rather than edit in place: the existing item is the object
        // held in state, and in-place edits skip the re-render
        const existingItem = updatedGroceryList[existingIndex];
        updatedGroceryList[existingIndex] =
          existingItem.status === 'bought'
            ? // What was bought is used up; this is a fresh need, so it goes back
              // under Items to Buy with only the new quantity
              { ...existingItem, quantity: ingredient.quantity, status: 'to buy' }
            : {
                ...existingItem,
                quantity: addQuantities(existingItem.quantity, ingredient.quantity),
              };
      }
    });

    setGroceryList(updatedGroceryList);
  }

  const itemsToBuy = groceryItems
    .filter(item => item.status === 'to buy')
    .map(item => {
      return (
        <GroceryItem
          key={item.id}
          item={item}
          groceryItems={groceryItems}
          setGroceryItems={setGroceryList}
        />
      );
    });

  const boughtItems = groceryItems
    .filter(item => item.status === 'bought')
    .map(item => {
      return (
        <GroceryItem
          key={item.id}
          item={item}
          groceryItems={groceryItems}
          setGroceryItems={setGroceryList}
        />
      );
    });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-8 mb-8">
        <h1 className="flex items-center gap-3 text-title text-4xl font-semibold">
          {<Icon name="list" size="30px" />} Grocery List
        </h1>
        <Button
          icon={<Icon name="plus" />}
          text="Add From Meals"
          onClick={openAddFromMealsModal}
          ariaLabel="add ingredients from upcoming meals"
        />
      </div>
      <div className="bg-dark rounded-md p-6 mb-4">
        <h2 className="text-subtitle text-xl font-semibold mb-4">Items to Buy</h2>
        {itemsToBuy.length > 0 ? (
          <div className="flex flex-col gap-4 sm:gap-2">{itemsToBuy}</div>
        ) : (
          <p className="text-light">Your grocery list is empty.</p>
        )}
        {/* ml-9 clears the checkbox column so the button lines up with the item name inputs */}
        <Button
          icon={<Icon name="plus" />}
          text="Add Item"
          onClick={addGroceryItem}
          ariaLabel="add item"
          classOverrides="mt-4 ml-9"
        />
      </div>
      <div className="bg-dark rounded-md p-6">
        <Accordion heading="Bought Items" content={boughtItems} />
      </div>
      {addFromMealsModalIsOpen && (
        <AddFromMealsModal
          ingredients={ingredientsToAdd}
          setAddFromMealsModalIsOpen={setAddFromMealsModalIsOpen}
          addIngredientsFromMeals={addIngredientsFromMeals}
        />
      )}
    </>
  );
}
