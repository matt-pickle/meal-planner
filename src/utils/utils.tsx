import { FaEdit } from 'react-icons/fa';

export function icon(name: string): React.JSX.Element {
  return <>{name == 'edit' ? <FaEdit /> : null}</>;
}
