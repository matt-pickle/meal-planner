import { useEffect } from 'react';
import { User } from 'firebase/auth';
import { useNavigate, Outlet } from 'react-router';

type Props = {
  user: User | null;
};

export default function PrivateRoutes({ user }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (user) {
    return <Outlet />;
  } else {
    return null;
  }
}
