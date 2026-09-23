import Dropdown, { type Option } from './Dropdown';
import { type MealSlot, MEAL_SLOTS } from '../utils/types';

type Props = {
  date: number;
  breakfast: string;
  lunch: string;
  dinner: string;
  // Built once by the Schedule page for all 14 days, rather than by each day
  mealOptions: Array<Option>;
  onMealChange: (date: number, slot: MealSlot, mealId: string) => void;
};

export default function ScheduleDay({
  date,
  breakfast,
  lunch,
  dinner,
  mealOptions,
  onMealChange,
}: Props) {
  const dateObj = new Date(date);
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayOfWeek = dayNames[dateObj.getDay()];
  const dateString = `${dayOfWeek} ${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj
    .getFullYear()
    .toString()
    .slice(-2)}`;
  const mealBySlot = { breakfast, lunch, dinner };
  const slots = MEAL_SLOTS.map(name => ({ name, meal: mealBySlot[name] }));

  return (
    <div className="schedule-day bg-dark rounded-md p-8">
      <h2 className="text-subtitle text-lg font-semibold mb-4">{dateString}</h2>
      <div className="flex flex-col gap-4">
        {slots.map(slot => (
          <div key={slot.name}>
            <span className="text-light font-semibold">{slot.name.toUpperCase()}:</span>
            <Dropdown
              ariaLabel={slot.name}
              clearLabel="— none —"
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
