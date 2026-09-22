import { NavLink } from 'react-router';
import { icon } from '../utils/utils';

const links = [
  { to: '/schedule', label: 'Schedule', icon: 'calendar', size: '20px' },
  { to: '/meals', label: 'Meals', icon: 'hamburger', size: '22px' },
  { to: '/grocery-list', label: 'Grocery List', icon: 'list', size: '20px' },
  { to: '/settings', label: 'Settings', icon: 'user', size: '21px' },
];

function linkClasses({ isActive }: { isActive: boolean }) {
  return `${
    isActive ? 'text-white bg-medium' : 'text-gray-400'
  } md:hover:bg-medium hover:text-white flex items-center gap-2 md:p-4 rounded-md`;
}

export default function Navigation() {
  return (
    <nav className="flex md:flex-col justify-center md:justify-start bg-dark p-4 md:p-2 gap-10 md:gap-2">
      {links.map(link => (
        <NavLink key={link.to} to={link.to} className={linkClasses}>
          {icon(link.icon, undefined, link.size)}
          <span className="hidden md:inline">{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
