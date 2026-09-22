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

const ICONS = {
  edit: FaEdit,
  check: FaCheck,
  x: FaTimes,
  'chevron-down': FaChevronDown,
  plus: FaPlus,
  trash: FaRegTrashAlt,
  calendar: FaRegCalendarAlt,
  list: FaRegListAlt,
  user: FaRegUserCircle,
  hamburger: PiHamburgerBold,
  dots: BsThreeDotsVertical,
  google: FcGoogle,
} as const;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  color?: string;
  size?: string;
};

export default function Icon({ name, color, size }: Props) {
  const Glyph = ICONS[name];

  return (
    <IconContext.Provider value={{ color: color, size: size }}>
      <Glyph />
    </IconContext.Provider>
  );
}
