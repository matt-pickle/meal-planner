import Dropdown from './Dropdown.tsx';
import { type MealSlot, type UserData } from '../utils/types';

type Props = {
  date: number;
  breakfast: string;
  lunch: string;
  dinner: string;
  meals: UserData['meals'];
  onMealChange: (date: number, slot: MealSlot, mealId: string) => void;
};

export default function ScheduleDay({
  date,
  breakfast,
  lunch,
  dinner,
  meals,
  onMealChange,
}: Props) {
  const dateObj = new Date(date);
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayOfWeek = dayNames[dateObj.getDay()];
  const dateString = `${dayOfWeek} ${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj
    .getFullYear()
    .toString()
    .slice(-2)}`;
  const mealOptions = meals.map(meal => ({
    label: `${meal.emoji}\u00A0\u00A0${meal.name}`,
    value: meal.id,
  }));
  const slots: Array<{ name: MealSlot; meal: string }> = [
    { name: 'breakfast', meal: breakfast },
    { name: 'lunch', meal: lunch },
    { name: 'dinner', meal: dinner },
  ];

  return (
    <div className="schedule-day bg-dark rounded-md p-8">
      <h2 className="text-subtitle text-lg font-semibold mb-4">
        {dateString}
      </h2>
      <div className="flex flex-col gap-4">
        {slots.map(slot => (
          <div key={slot.name}>
            <span className="text-light font-semibold">{slot.name.toUpperCase()}:</span>
            <Dropdown
              options={mealOptions}
              value={slot.meal}
              placeholder="Select a meal..."
              classOverrides="!mb-0"
              onSelect={mealId => onMealChange(date, slot.name, mealId)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
