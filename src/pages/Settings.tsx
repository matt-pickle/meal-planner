import { logOut } from '../../firebase/firebase.ts';
import Button from '../components/Button';
import { icon } from '../utils/utils';

export default function Settings() {
  return (
    <>
      <h1 className="flex items-center gap-3 text-title text-4xl font-semibold mb-8">
        {icon('user', undefined, '30px')} Settings
      </h1>
      <Button text="Log Out" onClick={logOut} ariaLabel="log out" />
    </>
  );
}
