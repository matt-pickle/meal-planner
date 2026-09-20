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

  function assignMeal(date: number, slot: MealSlot, mealName: string) {
    const schedule = userData.schedule;
    const dayIndex = schedule.findIndex(day => day.date === date);
    if (dayIndex === -1) return;
    schedule[dayIndex][slot] = mealName;
    updateUserData(user.uid, {
      schedule: schedule,
      meals: userData.meals,
      groceryList: userData.groceryList,
    });
  }

  let dayList: Array<React.JSX.Element> = [];
  if (userData) {
    const currentDays = userData.schedule.filter(day => day.date >= today.getTime());
    dayList = currentDays.map(day => {
      return (
        <ScheduleDay
          key={day.date}
          date={day.date}
          breakfast={day.breakfast}
          lunch={day.lunch}
          dinner={day.dinner}
          meals={userData.meals}
          onMealChange={assignMeal}
        />
      );
    });
    for (let i = 0; i < 14 - currentDays.length; i++) {
      const futureDate = today.getTime() + (i + currentDays.length) * 86400000;
      dayList.push(
        <ScheduleDay
          key={futureDate}
          date={futureDate}
          breakfast=""
          lunch=""
          dinner=""
          meals={userData.meals}
          onMealChange={assignMeal}
        />
      );
      userData.schedule.push({
        date: futureDate,
        breakfast: '',
        lunch: '',
        dinner: '',
      });
    }
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
