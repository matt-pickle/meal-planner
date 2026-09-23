import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation, useNavigate } from 'react-router';
import { type User } from 'firebase/auth';
import PrivateRoutes from '../src/components/PrivateRoutes';
import { type UserData } from '../src/utils/types';

const mockUser = { uid: '123', email: 'test@test.com' } as unknown as User;

const userData: UserData = { meals: [], schedule: [], groceryList: [] };

// Shows where the guard settled, and goes Back the way the browser button does
function LocationProbe() {
  const navigate = useNavigate();
  return (
    <>
      <div data-testid="path">{useLocation().pathname}</div>
      <button onClick={() => navigate(-1)}>back</button>
    </>
  );
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
    <MemoryRouter initialEntries={['/previous', '/meals']} initialIndex={1}>
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

  // Issue 10: the redirect pushed /login on top of the private page, so Back
  // returned there and was redirected again
  test('replaces the private page when redirecting, so Back skips it', async () => {
    renderGuard({ user: null, authResolved: true, data: userData });

    await userEvent.click(screen.getByRole('button', { name: 'back' }));

    expect(screen.getByTestId('path')).toHaveTextContent('/previous');
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
