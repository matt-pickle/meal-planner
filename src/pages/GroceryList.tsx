import { useState, useEffect, useRef } from 'react';
import { updateUserData } from '../../firebase/firebase';
import { type User } from 'firebase/auth';
import { type UserData, type GroceryItemType, type MealSlot } from '../utils/types';
import Button from '../components/Button';
import { icon } from '../utils/utils';
import Accordion from '../components/Accordion';
import GroceryItem from '../components/GroceryItem';
import AddFromMealsModal from '../components/AddFromMealsModal';

type Props = {
  user: User | null;
  userData: UserData | undefined;
};

export default function GroceryList({ user, userData }: Props) {
  const [groceryItems, setGroceryItems] = useState<Array<GroceryItemType>>(userData?.groceryList || []);
  const [addFromMealsModalIsOpen, setAddFromMealsModalIsOpen] = useState(false);
  const [ingredientsToAdd, setIngredientsToAdd] = useState<Array<GroceryItemType>>([]);

  // The effect below runs on mount too. Writing then would persist the seeded
  // state before the user has touched anything, so skip that first run.
  const isFirstRun = useRef(true);

  // Debounced database updates when groceryItems change
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const timer = setTimeout(() => {
      if (user) {
        updateUserData(user.uid, { groceryList: groceryItems });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [groceryItems, user]);

  function addGroceryItem() {
    const newItem: GroceryItemType = {
      id: crypto.randomUUID(),
      name: '',
      quantity: undefined,
      units: '',
      status: 'to buy',
    };
    const updatedItems = [...groceryItems, newItem];
    setGroceryItems(updatedItems);
  }

  // Totals up the ingredients for every meal scheduled from today onward
  function getIngredientsFromMeals(): Array<GroceryItemType> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingDays = userData?.schedule.filter(day => day.date >= today.getTime());
    const slots: Array<MealSlot> = ['breakfast', 'lunch', 'dinner'];
    const upcomingMealIds: Array<string> = [];
    upcomingDays?.forEach(day => {
      slots.forEach(slot => {
        if (day[slot]) {
          upcomingMealIds.push(day[slot]);
        }
      });
    });
    const upcomingMeals = upcomingMealIds.map(mealId => {
      return userData?.meals.find(meal => meal.id === mealId);
    });

    const ingredientsToAdd: Array<GroceryItemType> = [];
    upcomingMeals.forEach(meal => {
      if (!meal) return;
      meal.ingredients.forEach(ingredient => {
        const existingItem = ingredientsToAdd.find(
          item => item.name === ingredient.name && item.units === ingredient.units
        );
        if (existingItem) {
          // Sum explicitly: a truthiness test treats a quantity of 0 as missing
          existingItem.quantity = (existingItem.quantity ?? 0) + (ingredient.quantity ?? 0);
        } else {
          ingredientsToAdd.push({
            id: crypto.randomUUID(),
            name: ingredient.name,
            quantity: ingredient.quantity,
            units: ingredient.units,
            status: 'to buy',
          });
        }
      });
    });

    return ingredientsToAdd;
  }

  function openAddFromMealsModal() {
    setIngredientsToAdd(getIngredientsFromMeals());
    setAddFromMealsModalIsOpen(true);
  }

  function addIngredientsFromMeals() {
    const updatedGroceryList = [...groceryItems];
    ingredientsToAdd.forEach(ingredient => {
      const existingIndex = updatedGroceryList.findIndex(
        item => item.name === ingredient.name && item.units === ingredient.units
      );
      if (existingIndex === -1) {
        updatedGroceryList.push({ ...ingredient });
      } else {
        // Replace rather than edit in place: the existing item is the object
        // held in state, and in-place edits skip the re-render
        const existingItem = updatedGroceryList[existingIndex];
        updatedGroceryList[existingIndex] = {
          ...existingItem,
          quantity: (existingItem.quantity ?? 0) + (ingredient.quantity ?? 0),
        };
      }
    });

    setGroceryItems(updatedGroceryList);
    if (user) {
      updateUserData(user.uid, { groceryList: updatedGroceryList });
    }
  }

  const itemsToBuy = groceryItems
    .filter(item => item.status === 'to buy')
    .map(item => {
      return (
        <GroceryItem
          key={item.id}
          item={item}
          groceryItems={groceryItems}
          setGroceryItems={setGroceryItems}
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
          setGroceryItems={setGroceryItems}
        />
      );
    });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-8 mb-8">
        <h1 className="flex items-center gap-3 text-title text-4xl font-semibold">
          {icon('list', undefined, '30px')} Grocery List
        </h1>
        <Button
          icon={icon('plus')}
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
          icon={icon('plus')}
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
