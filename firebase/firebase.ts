import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"
import { type UserData } from "../src/utils/types.tsx"
import { notifyError } from "../src/utils/errors.tsx"
const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_API_KEY,
  authDomain: env.VITE_AUTH_DOMAIN,
  projectId: env.VITE_PROJECT_ID,
  storageBucket: env.VITE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_MESSAGING_SENDER_ID,
  appId: env.VITE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig)
const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)

export async function logIn() {
  const provider = new GoogleAuthProvider();
  // Google skips the account chooser when only one account is signed in; always ask
  provider.setCustomParameters({ prompt: 'select_account' });
  signInWithPopup(auth, provider);
}

export async function logOut() {
  signOut(auth);
}

// A fresh copy each call: the caller owns the returned object and the app
// mutates user data in place in places.
function defaultUserData(): UserData {
  return {
    meals: [
      {
        name: "Hamburgers",
        emoji: "🍔",
        ingredients: [
          { name: "Hamburger buns", quantity: 2, units: "buns" },
          { name: "Ground beef", quantity: 1, units: "lbs" },
          { name: "Sliced cheese", quantity: 1, units: "slices" },
          { name: "Lettuce", quantity: 10, units: "leaves" },
          { name: "French Fries", quantity: 2, units: "cups" }
        ]
      }
    ],
    schedule: [],
    groceryList: []
  };
}

// Rejects if the write fails, so getUserData can report the failure instead of
// looping on a document that was never created.
export async function createDocument(userId: string): Promise<UserData> {
  const userData = defaultUserData();
  await setDoc(doc(db, "users", userId), userData);
  return userData;
}

export async function getUserData(userId: string): Promise<UserData | undefined> {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserData;
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
  await setDoc(doc(db, "users", userId), userData, { merge: true })
    .catch(() => notifyError("Couldn't save your changes. Check your connection — recent edits may be lost if you reload."))
}