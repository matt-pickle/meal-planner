import { Routes, Route } from 'react-router';
import Card from './Card';
import Meals from './Meals';


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Card />} />
      <Route path="/meals" element={<Meals />} />
    </Routes>
  );
}