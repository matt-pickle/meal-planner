import { type User } from 'firebase/auth';
import { logOut } from '../../firebase/firebase.ts';
import Button from '../components/Button';
import { icon } from '../utils/utils';

type Props = {
  user: User | null;
};

export default function Settings({ user }: Props) {
  // Google sign-in supplies a display name; fall back to the email alone if it is missing
  const username = user?.displayName
    ? `${user.displayName}${user.email ? ` (${user.email})` : ''}`
    : user?.email;

  return (
    <>
      <h1 className="flex items-center gap-3 text-title text-4xl font-semibold mb-8">
        {icon('user', undefined, '30px')} Settings
      </h1>
      {username && <p className="text-light mb-4">Logged in as {username}</p>}
      <Button text="Log Out" onClick={logOut} ariaLabel="log out" />
    </>
  );
}
