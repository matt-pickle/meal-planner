import { Link } from 'react-router';

export default function Navigation() {
  return (
    <nav className="flex md:flex-col justify-center md:justify-start bg-gray-800 p-4 gap-6">
      <Link to="/meals" className="text-white hover:text-gray-300">
        Meals
      </Link>
      <Link to="/schedule" className="text-white hover:text-gray-300">
        Schedule
      </Link>
      <Link to="/grocery-list" className="text-white hover:text-gray-300">
        Grocery List
      </Link>
      <Link to="/settings" className="text-white hover:text-gray-300">
        Settings
      </Link>
    </nav>
  );
}
