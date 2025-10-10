export type Ingredient = {
  name: string;
  quantity: number;
  units: string;
};

export type Meal = {
  name: string;
  emoji: string;
  ingredients: Array<Ingredient>;
};

export type UserData = {
  meals: Array<Meal>;
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
