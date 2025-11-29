import { NavLink } from 'react-router';
import { icon } from '../utils/utils';

export default function Navigation() {
  return (
    <nav className="flex md:flex-col justify-center md:justify-start bg-dark p-4 md:p-2 gap-10 md:gap-2">
      <NavLink
        to="/schedule"
        className={({ isActive }) =>
          `${
            isActive ? 'text-white bg-medium' : 'text-gray-400'
          } md:hover:bg-medium hover:text-white flex items-center gap-2 md:p-4 rounded-md`
        }
      >
        {icon('calendar', undefined, '20px')} <span className="hidden md:inline">Schedule</span>
      </NavLink>
      <NavLink
        to="/meals"
        className={({ isActive }) =>
          `${
            isActive ? 'text-white bg-medium' : 'text-gray-400'
          } md:hover:bg-medium hover:text-white flex items-center gap-2 md:p-4 rounded-md`
        }
      >
        {icon('hamburger', undefined, '22px')}
        <span className="hidden md:inline">Meals</span>
      </NavLink>
      <NavLink
        to="/grocery-list"
        className={({ isActive }) =>
          `${
            isActive ? 'text-white bg-medium' : 'text-gray-400'
          } md:hover:bg-medium hover:text-white flex items-center gap-2 md:p-4 rounded-md`
        }
      >
        {icon('list', undefined, '20px')}
        <span className="hidden md:inline">Grocery List</span>
      </NavLink>
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `${
            isActive ? 'text-white bg-medium' : 'text-gray-400'
          } md:hover:bg-medium hover:text-white flex items-center gap-2 md:p-4 rounded-md`
        }
      >
        {icon('user', undefined, '21px')}
        <span className="hidden md:inline">Settings</span>
      </NavLink>
    </nav>
  );
}
