import { useState } from 'react';
import { type UserData, updateUserData } from '../../firebase/firebase';
import { type User } from 'firebase/auth';
import Button from './Button';
import Dropdown from './Dropdown';
import { icon } from '../utils/utils';

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

  return (
    <div className="meal-select-modal">
      <h2>
        {mealString} on {dateString}
      </h2>
      <Dropdown
        options={userData.meals.map(meal => ({
          label: `${meal.emoji}  ${meal.name}`,
          value: `${meal.emoji}  ${meal.name}`,
        }))}
        onSelect={setSelectedMeal}
      />
      <Button
        icon={icon('x')}
        onClick={() => setModalIsOpen(false)}
        ariaLabel="cancel"
        classOverrides="bg-red-600 hover:bg-red-800"
      />
      <Button icon={icon('check')} onClick={() => assignMeal()} ariaLabel="assign" />
    </div>
  );
}
