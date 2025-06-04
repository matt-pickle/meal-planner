import { Routes, Route } from 'react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import Meals from './pages/Meals';
import Schedule from './pages/Schedule';
import GroceryList from './pages/GroceryList';
import Settings from './pages/Settings';
import Navigation from './components/Navigation';

export default function App() {
  return (
    <div className="flex flex-col md:flex-row-reverse bg-gray-600 min-h-screen">
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/grocery-list" element={<GroceryList />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
      <Navigation />
    </div>
  );
}