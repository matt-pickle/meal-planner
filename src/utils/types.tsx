export type Ingredient = {
  name: string;
  quantity: number;
  units: string;
};

export type MealType = {
  name: string;
  emoji: string;
  ingredients: Array<Ingredient>;
};

export type GroceryItemType = {
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
    breakfast: string;
    lunch: string;
    dinner: string;
  }>;
  groceryList: Array<GroceryItemType>;
};

export type EmojiObject = {
  emoji: string;
};
