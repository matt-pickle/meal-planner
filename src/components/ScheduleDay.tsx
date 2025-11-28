import Button from './Button.tsx';
import { icon } from '../utils/utils.tsx';
import { type UserData } from '../utils/types';

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
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayOfWeek = dayNames[dateObj.getDay()];
  const dateString = `${dayOfWeek} ${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj
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
    <div
      key={date}
      className="schedule-day py-4 border-b-1 border-slate-200 mb-4"
    >
      <p className="text-blue-200 text-lg font-semibold mb-4">
        {dateString}
      </p>
      <div className="flex flex-col md:flex-row gap-6 flex-1">
        <p className="text-white flex-1 mb-1">
          <span className="text-slate-200 font-semibold mr-2">BREAKFAST:</span>
          <span className="whitespace-nowrap">
            {breakfastEmoji} {breakfast}
            <Button
              icon={icon('edit')}
              classOverrides="!bg-transparent !p-0 translate-y-[1px] ml-2"
              ariaLabel="edit"
              onClick={() => openModal('breakfast')}
            />
          </span>
        </p>
        <p className="text-white flex-1 mb-1">
          <span className="text-slate-200 font-semibold mr-2">LUNCH:</span>
          <span className="whitespace-nowrap">
            {lunchEmoji} {lunch}
            <Button
              icon={icon('edit')}
              classOverrides="!bg-transparent !p-0 translate-y-[1px] ml-2"
              ariaLabel="edit"
              onClick={() => openModal('lunch')}
            />
          </span>
        </p>
        <p className="text-white flex-1 mb-1">
          <span className="text-slate-200 font-semibold mr-2">DINNER:</span>
          <span className="whitespace-nowrap">
            {dinnerEmoji} {dinner}
            <Button
              icon={icon('edit')}
              classOverrides="!bg-transparent !p-0 translate-y-[1px] ml-2"
              ariaLabel="edit"
              onClick={() => openModal('dinner')}
            />
          </span>
        </p>
      </div>
    </div>
  );
}
