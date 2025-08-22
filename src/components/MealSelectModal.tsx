import { useState } from 'react';
import { type UserData, updateUserData } from '../../firebase/firebase';
import { type User } from 'firebase/auth';

type Props = {
  dateToUpdate: number;
  mealToChange: 'breakfast' | 'lunch' | 'dinner';
  user: User;
  userData: UserData;
  setModalIsOpen: (isOpen: boolean) => void;
};

export default function MealSelectModal({
  dateToUpdate,
  mealToChange,
  user,
  userData,
  setModalIsOpen,
}: Props) {
  const [selectedMeal, setSelectedMeal] = useState('');
  const mealString = mealToChange.toUpperCase();
  const dateString = new Date(dateToUpdate).toLocaleDateString();
  let schedule = userData.schedule;

  function assignMeal() {
    const dayIndex = schedule.findIndex(day => day.date == dateToUpdate);
    schedule[dayIndex][mealToChange] = selectedMeal;
    updateUserData(user.uid, {
      schedule: schedule,
      meals: userData.meals,
      groceryList: userData.groceryList,
    });
    setModalIsOpen(false);
  }

  const mealList: React.JSX.Element[] = userData.meals.map((meal, index) => {
    return (
      <button
        onClick={() => setSelectedMeal(`${meal.emoji}  ${meal.name}`)}
        key={index}
        className={`meal-option ${
          selectedMeal === `${meal.emoji}  ${meal.name}` ? 'selected' : ''
        }`}
      >
        {meal.emoji}&nbsp;&nbsp;{meal.name}
      </button>
    );
  });

  return (
    <div className="meal-select-modal">
      <h2>
        {mealString} on {dateString}
      </h2>
      <div>{mealList}</div>
      <button onClick={() => setModalIsOpen(false)} aria-label="cancel">
        Cancel
      </button>
      <button onClick={() => assignMeal()} aria-label="assign">
        Assign
      </button>
    </div>
  );
}
