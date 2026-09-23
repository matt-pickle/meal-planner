import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import NotFound from '../src/pages/NotFound';
import { HttpStatusContext } from '../src/state/HttpStatusContext';

describe('NotFound Page', () => {
  test('says the page does not exist and links back to the schedule', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Page Not Found', level: 1 })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Go to your schedule' })).toHaveAttribute(
      'href',
      '/schedule',
    );
  });

  // The server renders the page, so it is the one place that can tell the
  // response should be a 404 rather than a 200
  test('reports a 404 status to the server render', () => {
    const setStatus = vi.fn();
    render(
      <HttpStatusContext.Provider value={setStatus}>
        <MemoryRouter>
          <NotFound />
        </MemoryRouter>
      </HttpStatusContext.Provider>,
    );

    expect(setStatus).toHaveBeenCalledWith(404);
  });
});
