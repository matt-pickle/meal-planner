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

// Two meals with the same name are indistinguishable in the schedule dropdown,
// so a name may only be used once. `exceptId` is the meal being edited.
export function isDuplicateMealName(
  name: string,
  meals: Array<{ id: string; name: string }>,
  exceptId?: string
): boolean {
  const candidate = name.trim().toLowerCase();
  return meals.some(
    meal => meal.id !== exceptId && meal.name.trim().toLowerCase() === candidate
  );
}

// Past days are never displayed, but they used to accumulate in the document
// forever — thousands of entries over a couple of years, carried on every read
// and write, heading toward Firestore's 1 MB per-document limit.
export function withoutPastDays<T extends { date: number }>(schedule: Array<T>): Array<T> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return schedule.filter(day => day.date >= today.getTime());
}
