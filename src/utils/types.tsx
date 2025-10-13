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

export type UserData = {
  meals: Array<MealType>;
  schedule: Array<{
    date: number;
    breakfast: string;
    lunch: string;
    dinner: string;
  }>;
  groceryList: [];
};

export type EmojiObject = {
  emoji: string;
};
