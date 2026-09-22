import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router';
import { type User } from 'firebase/auth';
import PrivateRoutes from '../src/components/PrivateRoutes';
import { type UserData } from '../src/utils/types';

const mockUser = { uid: '123', email: 'test@test.com' } as unknown as User;

const userData: UserData = { meals: [], schedule: [], groceryList: [] };

function LocationProbe() {
  return <div data-testid="path">{useLocation().pathname}</div>;
}

// `data` is passed explicitly: a default would also apply to an explicit
// undefined, which is exactly the "signed in, data not here yet" case.
function renderGuard({
  user,
  authResolved,
  data,
}: {
  user: User | null;
  authResolved: boolean;
  data: UserData | undefined;
}) {
  return render(
    <MemoryRouter initialEntries={['/meals']}>
      <Routes>
        <Route
          element={
            <PrivateRoutes
              user={user}
              authResolved={authResolved}
              userData={data}
              setUserData={vi.fn()}
            />
          }
        >
          <Route path="/meals" element={<p>protected page</p>} />
        </Route>
        <Route path="/login" element={<p>login page</p>} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe('PrivateRoutes Component', () => {
  test('renders the page when the user is authenticated', () => {
    renderGuard({ user: mockUser, authResolved: true, data: userData });

    expect(screen.getByText('protected page')).toBeVisible();
    expect(screen.getByTestId('path')).toHaveTextContent('/meals');
  });

  test('redirects to /login when the user is signed out', () => {
    renderGuard({ user: null, authResolved: true, data: userData });

    expect(screen.getByTestId('path')).toHaveTextContent('/login');
  });

  // Regression: Firebase reports no user for the first few hundred ms after a
  // page load, which is indistinguishable from being signed out. Redirecting
  // then sent a refresh or a deep link to /login, and from there onward to the
  // schedule — so the user never landed on the page they asked for.
  test('waits instead of redirecting while auth is still pending', () => {
    renderGuard({ user: null, authResolved: false, data: userData });

    expect(screen.getByTestId('path')).toHaveTextContent('/meals');
    expect(screen.getByRole('status')).toHaveTextContent(/Loading/);
    expect(screen.queryByText('login page')).not.toBeInTheDocument();
  });

  test('shows a loading state once signed in but before the data arrives', () => {
    renderGuard({ user: mockUser, authResolved: true, data: undefined });

    expect(screen.getByRole('status')).toHaveTextContent(/Loading/);
    expect(screen.queryByText('protected page')).not.toBeInTheDocument();
  });
});
