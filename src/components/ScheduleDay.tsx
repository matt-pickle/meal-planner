import Dropdown from './Dropdown.tsx';
import { type MealSlot, type UserData } from '../utils/types';

type Props = {
  date: number;
  breakfast: string;
  lunch: string;
  dinner: string;
  meals: UserData['meals'];
  onMealChange: (date: number, slot: MealSlot, mealName: string) => void;
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
    value: meal.name,
  }));
  const slots: Array<{ name: MealSlot; meal: string }> = [
    { name: 'breakfast', meal: breakfast },
    { name: 'lunch', meal: lunch },
    { name: 'dinner', meal: dinner },
  ];

  return (
    <div
      key={date}
      className="schedule-day py-4 border-b-1 border-light mb-4"
    >
      <h2 className="text-subtitle text-lg font-semibold mb-4">
        {dateString}
      </h2>
      <div className="flex flex-col md:flex-row gap-6 flex-1">
        {slots.map(slot => (
          <div key={slot.name} className="flex-1">
            <span className="text-light font-semibold">{slot.name.toUpperCase()}:</span>
            <Dropdown
              options={mealOptions}
              value={slot.meal}
              placeholder="Select a meal..."
              classOverrides="!mb-0"
              onSelect={mealName => onMealChange(date, slot.name, mealName)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
