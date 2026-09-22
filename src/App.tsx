import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, getUserData, updateUserData } from '../firebase/firebase';
import { Routes, Route, useNavigate, useLocation } from 'react-router';
import PrivateRoutes from './components/PrivateRoutes';
import Home from './pages/Home';
import Login from './pages/Login';
import Schedule from './pages/Schedule';
import Meals from './pages/Meals';
import GroceryList from './pages/GroceryList';
import Settings from './pages/Settings';
import Navigation from './components/Navigation';
import ErrorBanner from './components/ErrorBanner';
import Loading from './components/Loading';
import { onError } from './utils/errors';
import { withoutPastDays } from './utils/utils';
import { type UserData, type MealType } from './utils/types';

export default function App() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [userData, setUserData] = useState<UserData | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // The auth listener is subscribed once, so it would close over the path the
  // app started on. A ref keeps it looking at where the user actually is.
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;

  // Firestore reads and writes report failures here rather than failing silently
  useEffect(() => onError(setErrorMessage), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async userObj => {
      if (userObj) {
        setUser(userObj);
        const data = await getUserData(userObj.uid);
        setUserData(data);
        // Only send the user onward from the entry points; a refresh or a deep
        // link into another page should stay where it is
        if (pathRef.current === '/' || pathRef.current === '/login') {
          navigate('/schedule');
        }
      } else {
        navigate('/login');
        setUserData(undefined);
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  // The one place meals are changed: update the in-memory user data and persist
  // it together, so no component rebuilds the list from a stale copy.
  function setMeals(meals: Array<MealType>) {
    setUserData(current => (current ? { ...current, meals } : current));
    if (user) {
      updateUserData(user.uid, { meals });
    }
  }

  // Same contract as setMeals: the schedule is updated and persisted here, so
  // pages never mutate userData themselves.
  function setSchedule(schedule: UserData['schedule']) {
    const upcoming = withoutPastDays(schedule);
    setUserData(current => (current ? { ...current, schedule: upcoming } : current));
    if (user) {
      updateUserData(user.uid, { schedule: upcoming });
    }
  }

  return (
    <div className="flex flex-col md:flex-row-reverse bg-medium min-h-screen max-h-screen">
      <div className="flex-1 p-4 md:p-8 overflow-scroll">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoutes user={user} />}>
            <Route
              path="/schedule"
              element={userData ? <Schedule userData={userData} setSchedule={setSchedule} /> : <Loading />}
            />
            <Route
              path="/meals"
              element={userData ? <Meals userData={userData} setMeals={setMeals} /> : <Loading />}
            />
            <Route
              path="/grocery-list"
              element={
                userData ? <GroceryList userData={userData} user={user!} /> : <Loading />
              }
            />
            <Route path="/settings" element={<Settings user={user} />} />
          </Route>
        </Routes>
      </div>
      <Navigation />
      <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />
    </div>
  );
}
