import { useState } from 'react';
import { updateUserData } from '../../firebase/firebase';
import { type User } from 'firebase/auth';
import { type UserData, type GroceryItem } from '../utils/types';
import Button from '../components/Button';
import Accordion from '../components/Accordion';

type Props = {
  user: User | null;
  userData: UserData | undefined;
};

export default function GroceryList({ user, userData }: Props) {
  const [groceryItems, setGroceryItems] = useState<Array<GroceryItem>>(userData?.groceryList || []);
  const [addItemModalIsOpen, setAddItemModalIsOpen] = useState(false);

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

    const ingredientsToAdd: Array<GroceryItem> = [];
    upcomingMeals.forEach(meal => {
      if (!meal) return;
      meal.ingredients.forEach(ingredient => {
        const existingItem = ingredientsToAdd.find(
          item => item.name === ingredient.name && item.units === ingredient.units
        );
        if (existingItem) {
          console.log('Existing item found:', existingItem);
          existingItem.quantity += ingredient.quantity;
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
        existingItem.quantity += ingredient.quantity;
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
      return <div key={index}>{item.name} {item.quantity} {item.units}</div>;
    });

  const boughtItems = groceryItems
    .filter(item => item.status === 'bought')
    .map((item, index) => {
      return <div key={index}>{item.name} {item.quantity} {item.units}</div>;
    });

  return (
    <div>
      <h1 className="text-blue-300">Grocery List</h1>
      <h2 className="text-blue-200">Items to Buy</h2>
      {itemsToBuy.length > 0 ? itemsToBuy : <p>Your grocery list is empty.</p>}
      <Button text="Add Item" onClick={() => setAddItemModalIsOpen(true)} ariaLabel="add item" />
      <Button
        text="Add Ingredients from Upcoming Meals"
        onClick={addIngredientsFromMeals}
        ariaLabel="add ingredients from upcoming meals"
      />
      <Accordion heading="Bought Items" content={boughtItems} />
    </div>
  );
}
