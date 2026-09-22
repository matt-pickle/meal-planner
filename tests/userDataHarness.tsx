import { useState } from 'react';
import { render } from '@testing-library/react';
import { UserDataProvider } from '../src/state/UserDataContext';
import { type UserData } from '../src/utils/types';

export const testUser: any = { uid: '123', email: 'test@example.com' };

// Plays App's part: owns the one copy of the data and hands the pages a store,
// so a page under test re-renders from its own writes as it does in the app.
export function renderWithUserData(ui: React.ReactNode, initialUserData: UserData) {
  function Harness() {
    const [userData, setUserData] = useState<UserData | undefined>(initialUserData);
    if (!userData) return null;
    return (
      <UserDataProvider user={testUser} userData={userData} setUserData={setUserData}>
        {ui}
      </UserDataProvider>
    );
  }

  return render(<Harness />);
}
