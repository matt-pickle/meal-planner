import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import PrivateRoutes from '../src/components/PrivateRoutes';

function renderWithRouter(component: React.ReactNode) {
  return render(<BrowserRouter>{component}</BrowserRouter>);
}

describe('PrivateRoutes Component', () => {
  test('does not redirect when user is authenticated', () => {
    const mockUser = { uid: '123', email: 'test@test.com' };
    // @ts-expect-error -- a partial stand-in for the Firebase User
    renderWithRouter(<PrivateRoutes user={mockUser} />);
    expect(window.location.pathname).not.toEqual('/login');
  });

  test('redirects to /login when user is not authenticated', () => {
    const mockUser = null;
    // @ts-expect-error -- a partial stand-in for the Firebase User
    renderWithRouter(<PrivateRoutes user={mockUser} />);
    expect(window.location.pathname).toEqual('/login');
  });
});
