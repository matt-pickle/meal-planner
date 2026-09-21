import {
  FaEdit,
  FaCheck,
  FaTimes,
  FaChevronDown,
  FaPlus,
  FaRegTrashAlt,
  FaRegCalendarAlt,
  FaRegListAlt,
  FaRegUserCircle,
} from 'react-icons/fa';
import { PiHamburgerBold } from 'react-icons/pi';
import { FcGoogle } from 'react-icons/fc';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { IconContext } from 'react-icons';

export function icon(name: string, color?: string, size?: string): React.JSX.Element {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>
      {name == 'edit' && <FaEdit />}
      {name == 'check' && <FaCheck />}
      {name == 'x' && <FaTimes />}
      {name == 'chevron-down' && <FaChevronDown />}
      {name == 'plus' && <FaPlus />}
      {name == 'trash' && <FaRegTrashAlt />}
      {name == 'calendar' && <FaRegCalendarAlt />}
      {name == 'list' && <FaRegListAlt />}
      {name == 'user' && <FaRegUserCircle />}
      {name == 'hamburger' && <PiHamburgerBold />}
      {name == 'dots' && <BsThreeDotsVertical />}
      {name == 'google' && <FcGoogle />}
    </IconContext.Provider>
  );
}

export function className(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
