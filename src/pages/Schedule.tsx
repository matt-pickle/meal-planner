import { useState } from 'react';
import { type UserData } from '../../firebase/firebase.ts';
import { type User } from 'firebase/auth';
import ScheduleDay from '../components/ScheduleDay.tsx';
import MealSelectModal from '../components/MealSelectModal.tsx';

type Props = {
  user: User;
  userData: UserData;
}

export default function Schedule({ user, userData }: Props) {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [mealToEdit, setMealToEdit] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [dateToEdit, setDateToEdit] = useState(0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
          setModalIsOpen={setModalIsOpen}
          setMealToEdit={setMealToEdit}
          setDateToEdit={setDateToEdit}
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
          setModalIsOpen={setModalIsOpen}
          setMealToEdit={setMealToEdit}
          setDateToEdit={setDateToEdit}
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
      <h1 className="text-blue-500">Schedule Page</h1>
      {dayList}
      {modalIsOpen && (
        <MealSelectModal
          dateToUpdate={dateToEdit}
          mealToChange={mealToEdit}
          user={user}
          userData={userData}
          setModalIsOpen={setModalIsOpen}
        />
      )}
    </>
  );
}
