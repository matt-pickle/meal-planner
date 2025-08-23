import { FaEdit, FaCheck, FaTimes, FaChevronDown, FaPlus } from 'react-icons/fa';
import { IconContext } from 'react-icons';

export function icon(name: string, color?: string, size?: string): React.JSX.Element {
  return (
    <IconContext.Provider value={{ color: color, size: size }}>
      {name == 'edit' && <FaEdit />}
      {name == 'check' && <FaCheck />}
      {name == 'x' && <FaTimes />}
      {name == 'chevron-down' && <FaChevronDown />}
      {name == 'plus' && <FaPlus />}
    </IconContext.Provider>
  );
}
