import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, getUserData } from '../firebase/firebase';
import { Routes, Route, useNavigate } from 'react-router';
import PrivateRoutes from './components/PrivateRoutes';
import Home from './pages/Home';
import Login from './pages/Login';
import Schedule from './pages/Schedule';
import Meals from './pages/Meals';
import GroceryList from './pages/GroceryList';
import Settings from './pages/Settings';
import Navigation from './components/Navigation';
import ErrorBanner from './components/ErrorBanner';
import { onError } from './utils/errors';
import { type UserData } from './utils/types';

export default function App() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [userData, setUserData] = useState<UserData | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Firestore reads and writes report failures here rather than failing silently
  useEffect(() => onError(setErrorMessage), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async userObj => {
      if (userObj) {
        setUser(userObj);
        const data = await getUserData(userObj.uid);
        setUserData(data);
        navigate('/schedule');
      } else {
        navigate('/login');
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
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoutes user={user} />}>
            <Route path="/schedule" element={<Schedule userData={userData!} user={user!}/>} />
            <Route path="/meals" element={<Meals userData={userData!} user={user!}/>} />
            <Route path="/grocery-list" element={<GroceryList userData={userData!} user={user!}/>} />
            <Route path="/settings" element={<Settings user={user} />} />
          </Route>
        </Routes>
      </div>
      <Navigation />
      <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />
    </div>
  );
}
