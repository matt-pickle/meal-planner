import { useState, useEffect } from 'react';
import { updateUserData } from '../../firebase/firebase';
import { type User } from 'firebase/auth';
import { type UserData, type GroceryItemType } from '../utils/types';
import Button from '../components/Button';
import { icon } from '../utils/utils';
import Accordion from '../components/Accordion';
import GroceryItem from '../components/GroceryItem';

type Props = {
  user: User | null;
  userData: UserData | undefined;
};

export default function GroceryList({ user, userData }: Props) {
  const [groceryItems, setGroceryItems] = useState<Array<GroceryItemType>>(userData?.groceryList || []);

  // Debounced database updates when groceryItems change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        updateUserData(user.uid, { groceryList: groceryItems });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [groceryItems, user]);

  function addGroceryItem() {
    const newItem: GroceryItemType = { name: '', quantity: undefined, units: '', status: 'to buy' };
    const updatedItems = [...groceryItems, newItem];
    setGroceryItems(updatedItems);
  }

  function addIngredientsFromMeals() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingDays = userData?.schedule.filter(day => day.date >= today.getTime());
    const upcomingMealNames: Array<string> = [];
    upcomingDays?.forEach(day => {
      if (day.breakfast) {
        const mealName = day.breakfast.slice(2).trim();
        upcomingMealNames.push(mealName);
      }
      if (day.lunch) {
        const mealName = day.lunch.slice(2).trim();
        upcomingMealNames.push(mealName);
      }
      if (day.dinner) {
        const mealName = day.dinner.slice(2).trim();
        upcomingMealNames.push(mealName);
      }
    });
    const upcomingMeals = upcomingMealNames.map(mealName => {
      return userData?.meals.find(meal => meal.name === mealName);
    });

    const ingredientsToAdd: Array<GroceryItemType> = [];
    upcomingMeals.forEach(meal => {
      if (!meal) return;
      meal.ingredients.forEach(ingredient => {
        const existingItem = ingredientsToAdd.find(
          item => item.name === ingredient.name && item.units === ingredient.units
        );
        if (existingItem) {
          console.log('Existing item found:', existingItem);
          existingItem.quantity
            ? (existingItem.quantity += ingredient.quantity)
            : (existingItem.quantity = ingredient.quantity);
        } else {
          console.log('New item found:', ingredient);
          ingredientsToAdd.push({
            name: ingredient.name,
            quantity: ingredient.quantity,
            units: ingredient.units,
            status: 'to buy',
          });
        }
      });
    });

    const updatedGroceryList = [...groceryItems];
    ingredientsToAdd.forEach(ingredient => {
      const existingItem = updatedGroceryList.find(
        item => item.name === ingredient.name && item.units === ingredient.units
      );
      if (existingItem) {
          existingItem.quantity
            ? (existingItem.quantity += ingredient.quantity ?? 0)
            : (existingItem.quantity = ingredient.quantity);
      } else {
        updatedGroceryList.push({ ...ingredient });
      }
    });

    setGroceryItems(updatedGroceryList);
    if (user) {
      updateUserData(user.uid, { groceryList: updatedGroceryList });
    }
  }

  const itemsToBuy = groceryItems
    .filter(item => item.status === 'to buy')
    .map((item, index) => {
      return (
        <GroceryItem
          key={index}
          item={item}
          groceryItems={groceryItems}
          setGroceryItems={setGroceryItems}
        />
      );
    });

  const boughtItems = groceryItems
    .filter(item => item.status === 'bought')
    .map((item, index) => {
      return (
        <GroceryItem
          key={index}
          item={item}
          groceryItems={groceryItems}
          setGroceryItems={setGroceryItems}
        />
      );
    });

  return (
    <>
      <h1 className="flex items-center gap-3 text-title text-4xl font-semibold mb-8">
        {icon('list', undefined, '30px')} Grocery List
      </h1>
      <Button
        icon={icon('plus')}
        text="Add Ingredients from Upcoming Meals"
        onClick={addIngredientsFromMeals}
        ariaLabel="add ingredients from upcoming meals"
        classOverrides="mb-4"
      />
      <div className="bg-dark rounded-md p-6 mb-4">
        <h2 className="text-subtitle text-xl font-semibold mb-4">Items to Buy</h2>
        {itemsToBuy.length > 0 ? (
          <div className="flex flex-col gap-2">{itemsToBuy}</div>
        ) : (
          <p className="text-light">Your grocery list is empty.</p>
        )}
        <Button
          icon={icon('plus')}
          text="Add Item"
          onClick={addGroceryItem}
          ariaLabel="add item"
          classOverrides="mt-4"
        />
      </div>
      <div className="bg-dark rounded-md p-6">
        <Accordion heading="Bought Items" content={boughtItems} />
      </div>
    </>
  );
}
