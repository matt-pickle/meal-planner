export type Ingredient = {
  name: string;
  // undefined while the quantity field is empty
  quantity: number | undefined;
  units: string;
};

export type MealType = {
  // Stable identity: names change and object references don't survive a refetch
  id: string;
  name: string;
  emoji: string;
  ingredients: Array<Ingredient>;
};

export type GroceryItemType = {
  // Stable identity: items move between the two lists as they are checked off,
  // so their position is not a usable key
  id: string;
  name: string;
  quantity: number | undefined;
  units: string;
  status: 'to buy' | 'bought';
};

export type MealSlot = 'breakfast' | 'lunch' | 'dinner';

export type UserData = {
  meals: Array<MealType>;
  schedule: Array<{
    date: number;
    // Slots hold a meal's id, or '' when nothing is assigned
    breakfast: string;
    lunch: string;
    dinner: string;
  }>;
  groceryList: Array<GroceryItemType>;
};

export type EmojiObject = {
  emoji: string;
};
