import { type User } from 'firebase/auth';
import { updateUserData } from '../../firebase/firebase';
import ScheduleDay from '../components/ScheduleDay.tsx';
import { type MealSlot, type UserData } from '../utils/types';
import { icon } from '../utils/utils.tsx'

type Props = {
  user: User;
  userData: UserData;
}

export default function Schedule({ user, userData }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function assignMeal(date: number, slot: MealSlot, mealId: string) {
    const schedule = userData.schedule;
    const dayIndex = schedule.findIndex(day => day.date === date);
    if (dayIndex === -1) return;
    schedule[dayIndex][slot] = mealId;
    updateUserData(user.uid, {
      schedule: schedule,
      meals: userData.meals,
      groceryList: userData.groceryList,
    });
  }

  // The next 14 calendar days as midnight timestamps. Built from the dates
  // themselves — deriving them from how many future days happen to be stored
  // produced timestamps that collided with existing entries whenever the
  // schedule had a gap. setDate() steps calendar days, so this stays correct
  // across a daylight-saving change where adding 86400000 ms would not.
  const upcomingDates: Array<number> = [];
  for (let i = 0; i < 14; i++) {
    const day = new Date(today);
    day.setDate(day.getDate() + i);
    upcomingDates.push(day.getTime());
  }

  let dayList: Array<React.JSX.Element> = [];
  if (userData) {
    const daysByDate = new Map(userData.schedule.map(day => [day.date, day]));
    dayList = upcomingDates.map(date => {
      let day = daysByDate.get(date);
      if (!day) {
        day = { date: date, breakfast: '', lunch: '', dinner: '' };
        userData.schedule.push(day);
      }
      return (
        <ScheduleDay
          key={date}
          date={date}
          breakfast={day.breakfast}
          lunch={day.lunch}
          dinner={day.dinner}
          meals={userData.meals}
          onMealChange={assignMeal}
        />
      );
    });
  }

  return (
    <>
      <h1 className="flex items-center gap-3 text-title text-4xl font-semibold mb-8">
        {icon('calendar', undefined, '30px')} Schedule
      </h1>
      <div className="schedule-weeks grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="week flex flex-col gap-4">{dayList.slice(0, 7)}</div>
        <div className="week flex flex-col gap-4">{dayList.slice(7)}</div>
      </div>
    </>
  );
}
