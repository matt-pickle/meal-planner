import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, getUserData, UserData } from '../firebase/firebase';
import { Routes, Route, useNavigate } from 'react-router';
import PrivateRoutes from './components/PrivateRoutes';
import Home from './pages/Home';
import Login from './pages/Login';
import Meals from './pages/Meals';
import Schedule from './pages/Schedule';
import GroceryList from './pages/GroceryList';
import Settings from './pages/Settings';
import Navigation from './components/Navigation';

export default function App() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [userData, setUserData] = useState<UserData | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async userObj => {
      if (userObj) {
        setUser(userObj);
        const data = await getUserData(userObj.uid);
        setUserData(data);
        navigate('/meals');
        console.log('logged in as ' + userObj.uid);
      } else {
        navigate('/login');
        setUserData(undefined);
        setUser(null);
        console.log('logged out');
      }
    });
    return unsubscribe;
  }, []);

  return (
    <div className="flex flex-col md:flex-row-reverse bg-gray-600 min-h-screen">
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoutes user={user} />}>
            <Route path="/meals" element={<Meals userData={userData} />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/grocery-list" element={<GroceryList />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </div>
      <Navigation />
    </div>
  );
}
