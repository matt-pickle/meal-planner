import { Link } from 'react-router';
import { icon } from '../utils/utils';

export default function Navigation() {
  return (
    <nav className="flex md:flex-col justify-center md:justify-start bg-gray-800 p-4 gap-6">
      <Link to="/schedule" className="text-white hover:text-gray-300 flex items-center gap-2">
        {icon('calendar', undefined, '20px')} Schedule
      </Link>
      <Link to="/meals" className="text-white hover:text-gray-300 flex items-center gap-2">
        {icon('hamburger', undefined, '22px')}
        Meals
      </Link>
      <Link to="/grocery-list" className="text-white hover:text-gray-300 flex items-center gap-2">
        {icon('list', undefined, '20px')}
        Grocery List
      </Link>
      <Link to="/settings" className="text-white hover:text-gray-300 flex items-center gap-2">
        {icon('user', undefined, '21px')}
        Settings
      </Link>
    </nav>
  );
}
