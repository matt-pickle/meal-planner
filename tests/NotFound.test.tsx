import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import NotFound from '../src/pages/NotFound';

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
});
