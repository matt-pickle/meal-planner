import { useEffect } from 'react';
import { User } from 'firebase/auth';
import { useNavigate, Outlet } from 'react-router';
import { UserDataProvider } from '../state/UserDataContext';
import Loading from './Loading';
import { type UserData } from '../utils/types';

type Props = {
  user: User | null;
  userData: UserData | undefined;
  setUserData: React.Dispatch<React.SetStateAction<UserData | undefined>>;
};

export default function PrivateRoutes({ user, userData, setUserData }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

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
