import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, getUserData } from '../firebase/firebase';
import { Routes, Route, Navigate } from 'react-router';
import PrivateRoutes from './components/PrivateRoutes';
import Login from './pages/Login';
import Schedule from './pages/Schedule';
import Meals from './pages/Meals';
import GroceryList from './pages/GroceryList';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Navigation from './components/Navigation';
import ErrorBanner from './components/ErrorBanner';
import { onError } from './utils/errors';
import { type UserData } from './utils/types';

export default function App() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  // Whether Firebase has reported an auth state yet, as opposed to there being
  // no signed-in user
  const [authResolved, setAuthResolved] = useState(auth.currentUser !== null);
  const [userData, setUserData] = useState<UserData | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Which user's data has been fetched, so a token refresh — which re-fires the
  // auth listener with the same user — doesn't refetch over local edits.
  const loadedUid = useRef<string | null>(null);

  // Firestore reads and writes report failures here rather than failing silently
  useEffect(() => onError(setErrorMessage), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async userObj => {
      setAuthResolved(true);
      if (userObj) {
        setUser(userObj);
        if (loadedUid.current !== userObj.uid) {
          loadedUid.current = userObj.uid;
          // Drop the previous user's data now; pages must not show or save it
          // under this user while their own fetch is in flight
          setUserData(undefined);
          const data = await getUserData(userObj.uid);
          // Someone else may have signed in while this fetch was in flight
          if (loadedUid.current === userObj.uid) setUserData(data);
        }
      } else {
        loadedUid.current = null;
        setUserData(undefined);
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <div className="flex flex-col md:flex-row-reverse bg-medium min-h-screen max-h-screen">
      <div className="flex-1 p-4 md:p-8 overflow-scroll">
        <Routes>
          <Route path="/" element={<Navigate to="/schedule" replace />} />
          <Route path="/login" element={<Login user={user} />} />
          <Route
            element={
              <PrivateRoutes
                user={user}
                authResolved={authResolved}
                userData={userData}
                setUserData={setUserData}
              />
            }
          >
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/meals" element={<Meals />} />
            <Route path="/grocery-list" element={<GroceryList />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          {/* Outside PrivateRoutes, so an unknown URL says so whether or not
              the visitor is signed in, rather than sending them to log in */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Navigation />
      <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />
    </div>
  );
}
