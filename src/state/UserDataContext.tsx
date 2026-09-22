import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { type User } from 'firebase/auth';
import { updateUserData } from '../../firebase/firebase';
import { withoutPastDays } from '../utils/utils';
import { type UserData, type MealType, type GroceryItemType } from '../utils/types';

// One copy of the user's data, with the only mutators that touch it. Each
// updates the in-memory copy and persists it in the same step, so the document,
// this object, and the screen cannot drift apart.
type UserDataStore = {
  user: User;
  userData: UserData;
  setMeals: (meals: Array<MealType>) => void;
  setSchedule: (schedule: UserData['schedule']) => void;
  setGroceryList: (groceryList: Array<GroceryItemType>) => void;
};

const UserDataContext = createContext<UserDataStore | null>(null);

// The hook belongs with the context it reads; fast refresh only complains that
// this file exports something other than a component.
// eslint-disable-next-line react-refresh/only-export-components
export function useUserData(): UserDataStore {
  const store = useContext(UserDataContext);
  if (!store) {
    throw new Error('useUserData must be used inside a UserDataProvider');
  }
  return store;
}

const GROCERY_SAVE_DELAY = 500;

type Props = {
  user: User;
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData | undefined>>;
  children: React.ReactNode;
};

export function UserDataProvider({ user, userData, setUserData, children }: Props) {
  const grocerySaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (grocerySaveTimer.current) clearTimeout(grocerySaveTimer.current);
    };
  }, []);

  const setMeals = useCallback(
    (meals: Array<MealType>) => {
      setUserData(current => (current ? { ...current, meals } : current));
      updateUserData(user.uid, { meals });
    },
    [user.uid, setUserData]
  );

  const setSchedule = useCallback(
    (schedule: UserData['schedule']) => {
      // Past days are dropped on every write so they cannot accumulate
      const upcoming = withoutPastDays(schedule);
      setUserData(current => (current ? { ...current, schedule: upcoming } : current));
      updateUserData(user.uid, { schedule: upcoming });
    },
    [user.uid, setUserData]
  );

  const setGroceryList = useCallback(
    (groceryList: Array<GroceryItemType>) => {
      setUserData(current => (current ? { ...current, groceryList } : current));

      // Typing edits the list on every keystroke, so the write is debounced
      if (grocerySaveTimer.current) clearTimeout(grocerySaveTimer.current);
      grocerySaveTimer.current = setTimeout(() => {
        updateUserData(user.uid, { groceryList });
      }, GROCERY_SAVE_DELAY);
    },
    [user.uid, setUserData]
  );

  return (
    <UserDataContext.Provider
      value={{ user, userData, setMeals, setSchedule, setGroceryList }}
    >
      {children}
    </UserDataContext.Provider>
  );
}
