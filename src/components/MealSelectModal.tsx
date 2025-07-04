import { useState } from "react"
import { updateUserData } from "../../firebase/firebase"

export default function MealSelectModal({ dateToUpdate, mealToChange, user, userData, setModalIsOpen }) {
  // const [selectedMeal, setSelectedMeal ] = useState("")
  const mealString = mealToChange.toUpperCase()
  const dateString = new Date(dateToUpdate).toLocaleDateString()
  let schedule = userData.schedule

  // function assignMeal() {
  //   const dayIndex = schedule.findIndex(day => day.date === dateToUpdate)
  //   schedule[dayIndex][mealToChange] = selectedMeal
  //   updateUserData(user.uid, { schedule: schedule })
  //   setModalIsOpen(false)
  // }

  // const mealList = userData.meals.map((meal, index) => {
  //   let optionStyle = styles.option
  //   if (`${meal.emoji}  ${meal.name}` === selectedMeal) {
  //     optionStyle = [styles.option, styles.optionSelected ]
  //   }
  //   return (
  //     <Pressable style={optionStyle}
  //       onPress={() => setSelectedMeal(`${meal.emoji}  ${meal.name}`)}
  //       key={index}
  //     >
  //       <Text style={styles.optionText}>
  //         {meal.emoji}&nbsp;&nbsp;{meal.name}
  //       </Text>
  //     </Pressable>
  //   )
  // })

  return (
    <div>
      <h2>{mealString} on {dateString}</h2>
    </div>
  );
}