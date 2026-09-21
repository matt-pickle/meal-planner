import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock the Firebase module for every suite. Importing it for real runs
// initializeApp() with the credentials from .env and issues live Firestore
// reads and writes — errors are swallowed inside firebase.ts, so a leaking
// suite looks like it passes. The factory must not use importOriginal():
// that would execute the module's initialization side effect.
// Individual suites can still call vi.mock('../firebase/firebase', ...) with
// their own factory to add behaviour or assert on calls; that overrides this.
vi.mock('../firebase/firebase', () => ({
  auth: { currentUser: null },
  logIn: vi.fn(),
  logOut: vi.fn(),
  createDocument: vi.fn(),
  getUserData: vi.fn(),
  updateUserData: vi.fn(),
}));

// runs a clean after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
