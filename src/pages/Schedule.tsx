import { useEffect, useMemo } from 'react';
import ScheduleDay from '../components/ScheduleDay';
import { useUserData } from '../state/UserDataContext';
import { type MealSlot } from '../utils/types';
import Icon from '../components/Icon';

export default function Schedule() {
  const { userData, setSchedule } = useUserData();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  // The next 14 calendar days as midnight timestamps. Built from the dates
  // themselves — deriving them from how many future days happen to be stored
  // produced timestamps that collided with existing entries whenever the
  // schedule had a gap. setDate() steps calendar days, so this stays correct
  // across a daylight-saving change where adding 86400000 ms would not.
  const upcomingDates = useMemo(() => {
    const dates: Array<number> = [];
    for (let i = 0; i < 14; i++) {
      const day = new Date(todayTime);
      day.setDate(day.getDate() + i);
      dates.push(day.getTime());
    }
    return dates;
  }, [todayTime]);

  const daysByDate = new Map(userData.schedule.map(day => [day.date, day]));

  function blankDay(date: number) {
    return { date: date, breakfast: '', lunch: '', dinner: '' };
  }

  // A pure derivation of props: rendering must not create or store anything
  const days = upcomingDates.map(date => daysByDate.get(date) ?? blankDay(date));

  // Creating the missing days is a side effect, so it happens after render
  // rather than during it. Persisting them also means every day on screen
  // exists in the document before the user can assign a meal to it.
  useEffect(() => {
    const storedDates = new Set(userData.schedule.map(day => day.date));
    const missingDates = upcomingDates.filter(date => !storedDates.has(date));
    if (missingDates.length === 0) return;
    setSchedule([...userData.schedule, ...missingDates.map(blankDay)]);
  }, [userData.schedule, upcomingDates, setSchedule]);

  function assignMeal(date: number, slot: MealSlot, mealId: string) {
    const schedule = daysByDate.has(date)
      ? userData.schedule.map(day => (day.date === date ? { ...day, [slot]: mealId } : day))
      : [...userData.schedule, { ...blankDay(date), [slot]: mealId }];
    setSchedule(schedule);
  }

  const dayList = days.map(day => (
    <ScheduleDay
      key={day.date}
      date={day.date}
      breakfast={day.breakfast}
      lunch={day.lunch}
      dinner={day.dinner}
      meals={userData.meals}
      onMealChange={assignMeal}
    />
  ));

  return (
    <>
      <h1 className="flex items-center gap-3 text-title text-4xl font-semibold mb-8">
        {<Icon name="calendar" size="30px" />} Schedule
      </h1>
      <div className="schedule-weeks grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="week flex flex-col gap-4">{dayList.slice(0, 7)}</div>
        <div className="week flex flex-col gap-4">{dayList.slice(7)}</div>
      </div>
    </>
  );
}
