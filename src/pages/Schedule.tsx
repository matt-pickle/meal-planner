import { type UserData } from '../../firebase/firebase.ts';

type Props = {
  userData: UserData | undefined;
}

export default function Schedule({ userData }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let dayList: Array<React.ReactNode> = [];
  if (userData) {
    dayList = userData.schedule.map(day => {
      if (day.date.getTime() >= today.getTime()) {
        return (
          <div key={day.date.getTime()}>
            <p>Date: {day.date.toLocaleString()}</p>
            <p>Breakfast: {day.breakfast}</p>
            <p>Lunch: {day.lunch}</p>
            <p>Dinner: {day.dinner}</p>
          </div>
        );
      };
    });
    for (let i = 0; i < 14 - userData.schedule.length; i++) {
      const futureDate = new Date(today.getTime() + (i + userData.schedule.length) * 86400000);
      dayList.push(
        <div key={futureDate.getTime()}>
          <p>Date: {futureDate.toLocaleString()}</p>
          <p>Breakfast: </p>
          <p>Lunch: </p>
          <p>Dinner: </p>
        </div>
      );
    }
  }

  return (
    <>
      <h1 className="text-blue-500">Schedule Page</h1>
      {dayList}
    </>
  );
}
