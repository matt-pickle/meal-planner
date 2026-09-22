import { describe, test, expect, vi, beforeEach } from 'vitest';

vi.unmock('../firebase/firebase');
vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({})) }));
const signInWithPopup = vi.fn();
const signOut = vi.fn();
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  // A regular function, not an arrow: logIn calls it with `new`
  GoogleAuthProvider: vi.fn(function () {
    return { setCustomParameters: vi.fn() };
  }),
  signInWithPopup: (...args: unknown[]) => signInWithPopup(...args),
  signOut: (...args: unknown[]) => signOut(...args),
}));
const getDoc = vi.fn();
const setDoc = vi.fn();
const updateDoc = vi.fn();
vi.mock('firebase/firestore', () => ({
  initializeFirestore: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  getDoc: (...args: unknown[]) => getDoc(...args),
  setDoc: (...args: unknown[]) => setDoc(...args),
  updateDoc: (...args: unknown[]) => updateDoc(...args),
}));

import { getUserData, updateUserData, logIn, logOut } from '../firebase/firebase';
import { onError } from '../src/utils/errors';

describe('updateUserData', () => {
  beforeEach(() => {
    getDoc.mockReset();
    setDoc.mockReset();
    updateDoc.mockReset();
  });

  test('writes only the field it was given', async () => {
    updateDoc.mockResolvedValue(undefined);

    await updateUserData('123', { groceryList: [] });

    // setDoc would rewrite the whole document; updateDoc touches named fields
    expect(setDoc).not.toHaveBeenCalled();
    expect(updateDoc).toHaveBeenCalledTimes(1);
    expect(updateDoc.mock.calls[0][1]).toEqual({ groceryList: [] });
  });

  test('reports a rejected write instead of failing silently', async () => {
    const listener = vi.fn();
    const unsub = onError(listener);
    updateDoc.mockRejectedValue(new Error('offline'));
    await updateUserData('123', { groceryList: [] });
    expect(listener).toHaveBeenCalledOnce();
    expect(listener.mock.calls[0][0]).toMatch(/Couldn't save/);
    unsub();
  });
});

describe('getUserData', () => {
  beforeEach(() => {
    getDoc.mockReset();
    setDoc.mockReset();
  });

  test('missing doc + failing create reports once and gives up', async () => {
    const listener = vi.fn();
    const unsub = onError(listener);
    getDoc.mockResolvedValue({ exists: () => false });
    setDoc.mockRejectedValue(new Error('permission-denied'));

    const result = await getUserData('123');

    expect(result).toBeUndefined();
    expect(getDoc).toHaveBeenCalledOnce(); // it used to recurse without bound
    expect(setDoc).toHaveBeenCalledOnce();
    expect(listener.mock.calls[0][0]).toMatch(/Couldn't load/);
    unsub();
  });

  test('missing doc + successful create returns the defaults without re-reading', async () => {
    getDoc.mockResolvedValue({ exists: () => false });
    setDoc.mockResolvedValue(undefined);

    const result = await getUserData('123');

    expect(getDoc).toHaveBeenCalledOnce();
    expect(result?.meals[0].name).toBe('Hamburgers');
    expect(result?.schedule).toEqual([]);
  });
});

describe('legacy document migration', () => {
  beforeEach(() => {
    getDoc.mockReset();
    setDoc.mockReset();
  });

  test('gives meals ids and rewrites name-based schedule slots to them', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        meals: [
          { name: 'Spaghetti', emoji: '🍝', ingredients: [] },
          { name: 'Tacos', emoji: '🌮', ingredients: [] },
        ],
        schedule: [{ date: 1, breakfast: 'Spaghetti', lunch: 'Deleted meal', dinner: '' }],
        groceryList: [],
      }),
    });

    const result = await getUserData('123');
    const spaghettiId = result!.meals[0].id;

    expect(spaghettiId).toBeTruthy();
    expect(result!.meals[1].id).toBeTruthy();
    expect(result!.schedule[0].breakfast).toBe(spaghettiId);
    // a name that matches no meal was already dangling, so it is cleared
    expect(result!.schedule[0].lunch).toBe('');
    expect(result!.schedule[0].dinner).toBe('');
  });

  test('leaves ids that are already ids alone', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        meals: [{ id: 'abc', name: 'Spaghetti', emoji: '🍝', ingredients: [] }],
        schedule: [{ date: 1, breakfast: 'abc', lunch: '', dinner: '' }],
        groceryList: [],
      }),
    });

    const result = await getUserData('123');

    expect(result!.meals[0].id).toBe('abc');
    expect(result!.schedule[0].breakfast).toBe('abc');
  });
});

// Regression: these were `async` but never returned the underlying promise, so
// `await logIn()` resolved immediately and a caller's catch could never fire.
describe('logIn / logOut', () => {
  beforeEach(() => {
    signInWithPopup.mockReset();
    signOut.mockReset();
  });

  test('logIn rejects when the popup fails', async () => {
    signInWithPopup.mockRejectedValue(new Error('popup blocked'));

    await expect(logIn()).rejects.toThrow('popup blocked');
  });

  test('logIn resolves with the credential', async () => {
    signInWithPopup.mockResolvedValue({ user: { uid: '123' } });

    await expect(logIn()).resolves.toEqual({ user: { uid: '123' } });
  });

  test('logOut rejects when sign-out fails', async () => {
    signOut.mockRejectedValue(new Error('network'));

    await expect(logOut()).rejects.toThrow('network');
  });
});
