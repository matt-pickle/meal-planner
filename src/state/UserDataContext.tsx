import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { type User } from 'firebase/auth';
import { auth, updateUserData } from '../../firebase/firebase';
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
  // Writes a pending grocery edit now instead of waiting out the debounce;
  // resolves once the write has finished
  flushGroceryList: () => Promise<void>;
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

// Long enough that typing a list costs one write rather than a dozen. Anything
// still pending is flushed when the user leaves, so the delay never loses work.
const GROCERY_SAVE_DELAY = 5000;

type Props = {
  user: User;
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData | undefined>>;
  children: React.ReactNode;
};

export function UserDataProvider({ user, userData, setUserData, children }: Props) {
  const grocerySaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unsavedGroceryList = useRef<Array<GroceryItemType> | null>(null);

  const flushGroceryList = useCallback(async () => {
    if (grocerySaveTimer.current) {
      clearTimeout(grocerySaveTimer.current);
      grocerySaveTimer.current = null;
    }
    const pending = unsavedGroceryList.current;
    if (!pending) return;
    unsavedGroceryList.current = null;
    // Signing out in another tab signs this one out too, and the pages and
    // store then unmount and flush. Firestore would reject that write, so the
    // edit is dropped quietly instead of reported as a failure the user can't fix.
    if (auth.currentUser?.uid !== user.uid) return;
    await updateUserData(user.uid, { groceryList: pending });
  }, [user.uid]);

  // Don't sit on an edit while the user walks away: write it when the tab is
  // hidden or closed, and when the store itself goes away.
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') flushGroceryList();
    }

    window.addEventListener('pagehide', flushGroceryList);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', flushGroceryList);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      flushGroceryList();
    };
  }, [flushGroceryList]);

  const setMeals = useCallback(
    (meals: Array<MealType>) => {
      setUserData(current => (current ? { ...current, meals } : current));
      updateUserData(user.uid, { meals });
    },
    [user.uid, setUserData],
  );

  const setSchedule = useCallback(
    (schedule: UserData['schedule']) => {
      // Past days are dropped on every write so they cannot accumulate
      const upcoming = withoutPastDays(schedule);
      setUserData(current => (current ? { ...current, schedule: upcoming } : current));
      updateUserData(user.uid, { schedule: upcoming });
    },
    [user.uid, setUserData],
  );

  const setGroceryList = useCallback(
    (groceryList: Array<GroceryItemType>) => {
      setUserData(current => (current ? { ...current, groceryList } : current));

      // Typing edits the list on every keystroke, so the write is debounced:
      // the edit is held here and written once the user pauses.
      unsavedGroceryList.current = groceryList;
      if (grocerySaveTimer.current) clearTimeout(grocerySaveTimer.current);
      grocerySaveTimer.current = setTimeout(flushGroceryList, GROCERY_SAVE_DELAY);
    },
    [setUserData, flushGroceryList],
  );

  return (
    <UserDataContext.Provider
      value={{ user, userData, setMeals, setSchedule, setGroceryList, flushGroceryList }}
    >
      {children}
    </UserDataContext.Provider>
  );
}
