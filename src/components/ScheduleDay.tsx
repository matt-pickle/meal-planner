import { type UserData } from '../../firebase/firebase';
import Button from './Button.tsx';
import { icon } from '../utils/utils.tsx';

type Props = {
  date: number;
  breakfast: string;
  lunch: string;
  dinner: string;
  meals: UserData['meals'];
  setModalIsOpen: (isOpen: boolean) => void;
  setMealToEdit: (meal: 'breakfast' | 'lunch' | 'dinner') => void;
  setDateToEdit: (date: number) => void;
};

export default function ScheduleDay({
  date,
  breakfast,
  lunch,
  dinner,
  meals,
  setModalIsOpen,
  setMealToEdit,
  setDateToEdit,
}: Props) {
  const dateObj = new Date(date);
  const dateString = `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj
    .getFullYear()
    .toString()
    .slice(-2)}`;
  const breakfastMeal = meals.find(meal => meal.name === breakfast);
  const breakfastEmoji = breakfastMeal?.emoji;
  const lunchMeal = meals.find(meal => meal.name === lunch);
  const lunchEmoji = lunchMeal?.emoji;
  const dinnerMeal = meals.find(meal => meal.name === dinner);
  const dinnerEmoji = dinnerMeal?.emoji;

  function openModal(mealToEdit: 'breakfast' | 'lunch' | 'dinner') {
    setMealToEdit(mealToEdit);
    setDateToEdit(date);
    setModalIsOpen(true);
  }

  return (
    <div key={date} className="schedule-day">
      <p>Date: {dateString}</p>
      <p>
        <span>
          Breakfast: {breakfastEmoji} {breakfast}
        </span>
        <Button
          icon={icon('edit')}
          classOverrides="!bg-transparent !p-0"
          ariaLabel="edit"
          onClick={() => openModal('breakfast')}
        />
      </p>
      <p>
        <span>
          Lunch: {lunchEmoji} {lunch}
        </span>
        <Button
          icon={icon('edit')}
          classOverrides="!bg-transparent !p-0"
          ariaLabel="edit"
          onClick={() => openModal('lunch')}
        />
      </p>
      <p>
        <span>
          Dinner: {dinnerEmoji} {dinner}
        </span>
        <Button
          icon={icon('edit')}
          classOverrides="!bg-transparent !p-0"
          ariaLabel="edit"
          onClick={() => openModal('dinner')}
        />
      </p>
    </div>
  );
}
