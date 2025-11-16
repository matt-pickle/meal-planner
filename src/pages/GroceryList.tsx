import { useState, useEffect } from 'react';
import { updateUserData } from '../../firebase/firebase';
import { type User } from 'firebase/auth';
import { type UserData, type GroceryItemType } from '../utils/types';
import Button from '../components/Button';
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
    <div>
      <h1 className="text-blue-300">Grocery List</h1>
      <h2 className="text-blue-200">Items to Buy</h2>
      {itemsToBuy.length > 0 ? itemsToBuy : <p>Your grocery list is empty.</p>}
      <Button text="Add Item" onClick={addGroceryItem} ariaLabel="add item" />
      <Button
        text="Add Ingredients from Upcoming Meals"
        onClick={addIngredientsFromMeals}
        ariaLabel="add ingredients from upcoming meals"
      />
      <Accordion heading="Bought Items" content={boughtItems} />
    </div>
  );
}
