import { useEffect } from 'react';
import { User } from 'firebase/auth';
import { useNavigate, Outlet } from 'react-router';
import { UserDataProvider } from '../state/UserDataContext';
import Loading from './Loading';
import { type UserData } from '../utils/types';

type Props = {
  user: User | null;
  // False until Firebase has restored the session. `user` is null either way,
  // so without this a signed-in user is indistinguishable from a signed-out one
  // for the first few hundred milliseconds after a page load.
  authResolved: boolean;
  userData: UserData | undefined;
  setUserData: React.Dispatch<React.SetStateAction<UserData | undefined>>;
};

export default function PrivateRoutes({ user, authResolved, userData, setUserData }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    // Only a settled "signed out" sends the user to the login page; redirecting
    // while auth is still pending bounced deep links and refreshes away.
    if (authResolved && !user) {
      navigate('/login');
    }
  }, [authResolved, user, navigate]);

  if (!authResolved) return <Loading />;
  if (!user) return null;

  // Pages seed nothing from props and read everything from the store, but they
  // still must not render before the data exists.
  if (!userData) return <Loading />;

  return (
    <UserDataProvider user={user} userData={userData} setUserData={setUserData}>
      <Outlet />
    </UserDataProvider>
  );
}
