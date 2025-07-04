import { type UserData } from "../../firebase/firebase";

type Props = {
  date: Date;
  breakfast: string;
  lunch: string;
  dinner: string;
  meals: UserData["meals"];
};

export default function ScheduleDay({ date, breakfast, lunch, dinner, meals }: Props) {
  const dateString = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`;
  const breakfastMeal = meals.find(meal => meal.name === breakfast);
  const breakfastEmoji = breakfastMeal?.emoji || "🍽️";
  const lunchMeal = meals.find(meal => meal.name === lunch);
  const lunchEmoji = lunchMeal?.emoji || "🍽️" 
  const dinnerMeal = meals.find(meal => meal.name === dinner);
  const dinnerEmoji = dinnerMeal?.emoji || "🍽️";
  return (
    <div key={date.getTime()} className="schedule-day">
      <p>Date: {dateString}</p>
      <p>Breakfast: {breakfastEmoji} {breakfast}</p>
      <p>Lunch: {lunchEmoji} {lunch}</p>
      <p>Dinner: {dinnerEmoji} {dinner}</p>
    </div>
  );
}