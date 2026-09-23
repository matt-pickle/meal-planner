// Meals are listed by name everywhere, so the Meals page and the schedule's
// dropdowns show them in the same order
export function sortMealsByName<T extends { name: string }>(meals: Array<T>): Array<T> {
  return [...meals].sort((a, b) => a.name.localeCompare(b.name));
}

// The schedule's dropdown entries for a meal library, sorted by name. The
// label joins emoji and name with non-breaking spaces so they stay together.
export function toMealOptions(
  meals: Array<{ id: string; name: string; emoji: string }>,
): Array<{ label: string; value: string }> {
  return sortMealsByName(meals).map(meal => ({
    label: `${meal.emoji}\u00A0\u00A0${meal.name}`,
    value: meal.id,
  }));
}

// Two meals with the same name are indistinguishable in the schedule dropdown,
// so a name may only be used once. `exceptId` is the meal being edited.
export function isDuplicateMealName(
  name: string,
  meals: Array<{ id: string; name: string }>,
  exceptId?: string,
): boolean {
  const candidate = name.trim().toLowerCase();
  return meals.some(meal => meal.id !== exceptId && meal.name.trim().toLowerCase() === candidate);
}

// Past days are never displayed, but they used to accumulate in the document
// forever — thousands of entries over a couple of years, carried on every read
// and write, heading toward Firestore's 1 MB per-document limit.
export function withoutPastDays<T extends { date: number }>(schedule: Array<T>): Array<T> {
  const today = startOfToday();
  return schedule.filter(day => day.date >= today);
}

// Midnight at the start of today, local time, as a timestamp. Schedule days are
// stored as midnight timestamps, so this is the line between past and upcoming.
export function startOfToday(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}

// Reads a quantity field: '' is no quantity (undefined), and anything that
// isn't a non-negative number is null, meaning "ignore this edit". Number('')
// and parseFloat('') would give 0 and NaN, and NaN used to be stored,
// rendered and saved; a negative amount of anything is meaningless.
export function parseQuantity(value: string): number | undefined | null {
  if (value === '') return undefined;
  const quantity = Number(value);
  return Number.isNaN(quantity) || quantity < 0 ? null : quantity;
}
