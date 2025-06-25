import { logOut } from '../../firebase/firebase.ts';
import Button from '../components/Button';

export default function Settings() {
  return (
    <>
      <h1 className="text-blue-400">Settings Page</h1>
      <Button text="Log Out" onClick={logOut} />
    </>
  );
}
