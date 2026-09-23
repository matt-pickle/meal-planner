import { useState } from 'react';
import { type User } from 'firebase/auth';
import { render } from '@testing-library/react';
import { UserDataProvider } from '../src/state/UserDataContext';
import { auth } from '../firebase/firebase';
import { type UserData } from '../src/utils/types';

export const testUser = { uid: '123', email: 'test@example.com' } as unknown as User;

// Sets who the mocked Firebase auth reports as signed in. The store only
// writes for the user it was given while that user is still signed in, so
// anything rendered with testUser needs testUser signed in, and a test can
// pass null to sign them out.
export function signIn(user: User | null = testUser) {
  (auth as { currentUser: User | null }).currentUser = user;
}

// Plays App's part: owns the one copy of the data and hands the pages a store,
// so a page under test re-renders from its own writes as it does in the app.
export function renderWithUserData(
  ui: React.ReactNode,
  initialUserData: UserData,
  user: User = testUser,
) {
  signIn(user);
  function Harness() {
    const [userData, setUserData] = useState<UserData | undefined>(initialUserData);
    if (!userData) return null;
    return (
      <UserDataProvider user={user} userData={userData} setUserData={setUserData}>
        {ui}
      </UserDataProvider>
    );
  }

  return render(<Harness />);
}
