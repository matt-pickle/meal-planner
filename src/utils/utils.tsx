import { FaEdit, FaCheck, FaTimes, FaChevronDown } from 'react-icons/fa';

export function icon(name: string): React.JSX.Element {
  return (
    <>
      {name == 'edit' ? <FaEdit /> : null}
      {name == 'check' ? <FaCheck /> : null}
      {name == 'x' ? <FaTimes /> : null}
      {name == 'chevron-down' ? <FaChevronDown /> : null}
    </>
  );
}
