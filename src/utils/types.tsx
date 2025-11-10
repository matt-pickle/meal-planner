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

export type GroceryItem = {
  name: string;
  quantity: number;
  units: string;
  status: 'to buy' | 'bought';
};

export type UserData = {
  meals: Array<MealType>;
  schedule: Array<{
    date: number;
    breakfast: string;
    lunch: string;
    dinner: string;
  }>;
  groceryList: Array<GroceryItem>;
};

export type EmojiObject = {
  emoji: string;
};
