import { useState } from 'react';
import { updateUserData } from '../../firebase/firebase';
import { type User } from 'firebase/auth';
import Button from './Button';
import Dropdown from './Dropdown';
import { icon } from '../utils/utils';
import { type UserData } from '../utils/types';

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
    <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center">
      <div className="meal-select-modal bg-medium min-w-[50%] p-8 rounded-md">
        <h2 className="text-subtitle text-lg text-center font-semibold mb-4">
          {mealString} on {dateString}
        </h2>
        <Dropdown
          options={userData.meals.map(meal => ({
            label: `${meal.emoji}\u00A0\u00A0${meal.name}`,
            value: `${meal.emoji}\u00A0\u00A0${meal.name}`,
          }))}
          onSelect={setSelectedMeal}
        />
        <div className="flex justify-center gap-4">
          <Button
            icon={icon('x')}
            onClick={() => setModalIsOpen(false)}
            ariaLabel="cancel"
            classOverrides="bg-red-600 hover:bg-red-800"
          />
          <Button icon={icon('check')} onClick={() => assignMeal()} ariaLabel="assign" />
        </div>
      </div>
    </div>
  );
}
