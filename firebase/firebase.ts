import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initializeFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { type UserData, MEAL_SLOTS } from '../src/utils/types';
import { notifyError } from '../src/utils/errors';
import { withoutPastDays } from '../src/utils/utils';
const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_API_KEY,
  authDomain: env.VITE_AUTH_DOMAIN,
  projectId: env.VITE_PROJECT_ID,
  storageBucket: env.VITE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_MESSAGING_SENDER_ID,
  appId: env.VITE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
// An empty quantity field leaves the value undefined, which Firestore rejects
// outright unless it is told to skip such fields.
const db = initializeFirestore(firebaseApp, { ignoreUndefinedProperties: true });
export const auth = getAuth(firebaseApp);

export async function logIn() {
  const provider = new GoogleAuthProvider();
  // Google skips the account chooser when only one account is signed in; always ask
  provider.setCustomParameters({ prompt: 'select_account' });
  // Returned, not fired and forgotten: callers await this to catch a failure
  return signInWithPopup(auth, provider);
}

export async function logOut() {
  return signOut(auth);
}

// A fresh copy each call: the caller owns the returned object and the app
// mutates user data in place in places.
function defaultUserData(): UserData {
  return {
    meals: [
      {
        id: crypto.randomUUID(),
        name: 'Hamburgers',
        emoji: '🍔',
        ingredients: [
          { name: 'Hamburger buns', quantity: 2, units: 'buns' },
          { name: 'Ground beef', quantity: 1, units: 'lbs' },
          { name: 'Sliced cheese', quantity: 1, units: 'slices' },
          { name: 'Lettuce', quantity: 10, units: 'leaves' },
          { name: 'French Fries', quantity: 2, units: 'cups' },
        ],
      },
    ],
    schedule: [],
    groceryList: [],
  };
}

// Meals stored before they carried ids get one on load, so matching never falls
// back to object identity. The id comes from the meal's position, not a random
// value: every session that loads the same document makes the same id, so two
// tabs migrating at once agree, and if saving it fails the next load makes it
// again. Positions are unique within the list, and the app gives every new meal
// an id, so a legacy id can't collide with another meal's.
function withMealIds(userData: UserData): UserData {
  return {
    ...userData,
    meals: (userData.meals ?? []).map((meal, index) =>
      meal.id ? meal : { ...meal, id: `legacy-meal-${index}` },
    ),
  };
}

// Grocery items stored before they carried ids get one on load, so React keys
// and item lookups never fall back to a position in a filtered list.
function withGroceryItemIds(userData: UserData): UserData {
  return {
    ...userData,
    groceryList: (userData.groceryList ?? []).map(item =>
      item.id ? item : { ...item, id: crypto.randomUUID() },
    ),
  };
}

// Schedule slots used to hold meal names. Map any legacy name onto the id of
// the meal it names, and clear names that no longer match a meal (those were
// already dangling: the day rendered blank).
function withScheduleMealIds(userData: UserData): UserData {
  const mealIds = new Set(userData.meals.map(meal => meal.id));
  const idsByName = new Map(userData.meals.map(meal => [meal.name, meal.id]));
  return {
    ...userData,
    schedule: (userData.schedule ?? []).map(day => {
      const migrated = { ...day };
      MEAL_SLOTS.forEach(slot => {
        const value = day[slot];
        if (!value || mealIds.has(value)) return;
        migrated[slot] = idsByName.get(value) ?? '';
      });
      return migrated;
    }),
  };
}

// The migrations above run on every load, and an id they make up exists only in
// memory until it is saved. Whatever the migrations changed is saved as soon as
// the document loads. Not awaited: loading shouldn't wait on a write, and
// Firestore sends writes in order, so this lands before any later edit.
//
// A failure here loses nothing, since meal ids are remade the same on the next
// load, so it gets its own message rather than updateUserData's warning about
// lost edits: the user hasn't edited anything yet.
//
// Like every other schedule write, this one drops past days first.
function saveMigratedFields(userId: string, stored: UserData, migrated: UserData) {
  const changed = (Object.keys(migrated) as Array<keyof UserData>).filter(
    field => JSON.stringify(stored[field] ?? []) !== JSON.stringify(migrated[field]),
  );
  if (changed.length === 0) return;
  const fields: Partial<UserData> = Object.fromEntries(
    changed.map(field => [field, migrated[field]]),
  );
  if (fields.schedule) fields.schedule = withoutPastDays(fields.schedule);
  void updateDoc(doc(db, 'users', userId), fields).catch(() =>
    notifyError(
      "Couldn't update your saved data to the latest format. Nothing was lost, and it will try again next time you open the app.",
    ),
  );
}

// Rejects if the write fails, so getUserData can report the failure instead of
// looping on a document that was never created.
export async function createDocument(userId: string): Promise<UserData> {
  const userData = defaultUserData();
  await setDoc(doc(db, 'users', userId), userData);
  return userData;
}

export async function getUserData(userId: string): Promise<UserData | undefined> {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const stored = docSnap.data() as UserData;
      const userData = withGroceryItemIds(withScheduleMealIds(withMealIds(stored)));
      saveMigratedFields(userId, stored, userData);
      return userData;
    } else {
      // Use the defaults we just wrote rather than re-reading the document:
      // re-reading recursed without bound whenever the write kept failing.
      return await createDocument(userId);
    }
  } catch {
    notifyError("Couldn't load your data. Check your connection and reload the page.");
    return undefined;
  }
}

export async function updateUserData(userId: string, userData: Partial<UserData>) {
  // updateDoc writes only the named field paths and leaves the rest of the
  // document untouched. Unlike setDoc({ merge: true }) it fails rather than
  // recreating a document that is no longer there.
  //
  // Field paths address map keys, not array positions, so `schedule` and
  // `groceryList` are still sent whole: a single day or item cannot be
  // addressed while they are arrays.
  await updateDoc(doc(db, 'users', userId), userData).catch(() =>
    notifyError(
      "Couldn't save your changes. Check your connection — recent edits may be lost if you reload.",
    ),
  );
}
