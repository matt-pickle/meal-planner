import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"
const env = import.meta.env;

export type UserData = {
  meals: [
    {
      name: string;
      emoji: string;
      ingredients: [
        {
          name: string;
          emoji: string;
          quantity: number;
        }
      ];
    }
  ];
  schedule: [];
  groceryList: [];
};

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
  signInWithPopup(auth, provider);
}

export async function logOut() {
  signOut(auth);
}

export async function createDocument(userId: string) {
  await setDoc(doc(db, "users", userId), {
    meals: [
      {
        name: "Hamburgers",
        emoji: "🍔",
        ingredients: [
          {
            name: "Hamburger buns",
            emoji: "🍔",
            quantity: 2
          },
          {
            name: "Ground beef",
            emoji: "🥩",
            quantity: 1
          },
          {
            name: "Sliced cheese",
            emoji: "🧀",
            quantity: 1
          },
          {
            name: "Lettuce",
            emoji: "🥬",
            quantity: 1
          },
          {
            name: "French Fries",
            emoji: "🍟",
            quantity: 1
          }
        ]
      }
    ],
    schedule: [],
    groceryList: []
  })
  .catch(error => console.log(error))
}

export async function getUserData(userId: string): Promise<UserData | undefined> {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserData;
    } else {
      await createDocument(userId);
      return await getUserData(userId);
    }
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

export async function updateUserData(userId: string, userData: UserData) {
  await setDoc(doc(db, "users", userId), userData, { merge: true })
  .catch(error => console.log(error))
}