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
    // loading a document that needed migrating saves the result
    updateDoc.mockReset();
    updateDoc.mockResolvedValue(undefined);
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

// Regression: a legacy meal got a new random id on every load, and the id was
// only saved when the meal list itself was next written. Assigning the meal on
// the schedule saves only the schedule, so the next sign-in found slots holding
// an id no meal had and cleared them: meal selections vanished at every sign-in.
describe('legacy document migration is saved', () => {
  // A stand-in Firestore document: getDoc reads it, updateDoc merges into it
  let stored: Record<string, unknown>;

  beforeEach(() => {
    getDoc.mockReset();
    setDoc.mockReset();
    updateDoc.mockReset();
    stored = {
      meals: [{ name: 'Spaghetti', emoji: '🍝', ingredients: [] }],
      schedule: [{ date: 1, breakfast: '', lunch: '', dinner: '' }],
      groceryList: [{ name: 'Cheese', quantity: 1, units: 'lbs', status: 'to buy' }],
    };
    getDoc.mockImplementation(async () => ({
      exists: () => true,
      data: () => structuredClone(stored),
    }));
    updateDoc.mockImplementation(async (_ref: unknown, fields: Record<string, unknown>) => {
      stored = { ...stored, ...structuredClone(fields) };
    });
  });

  test('keeps a meal assigned in one session through the next sign-in', async () => {
    const first = await getUserData('123');
    const spaghettiId = first!.meals[0].id;
    // the Schedule page saves only the schedule field
    await updateUserData('123', {
      schedule: [{ date: 1, breakfast: spaghettiId, lunch: '', dinner: '' }],
    });

    const second = await getUserData('123');

    expect(second!.meals[0].id).toBe(spaghettiId);
    expect(second!.schedule[0].breakfast).toBe(spaghettiId);
  });

  test('saves the ids it gives meals and grocery items straight away', async () => {
    const result = await getUserData('123');

    expect(updateDoc).toHaveBeenCalledTimes(1);
    const saved = updateDoc.mock.calls[0][1];
    expect(saved.meals[0].id).toBe(result!.meals[0].id);
    expect(saved.groceryList[0].id).toBe(result!.groceryList[0].id);
    // the schedule needed nothing, so it isn't rewritten
    expect(saved).not.toHaveProperty('schedule');
  });

  test('writes nothing when the document needs no migration', async () => {
    stored = {
      meals: [{ id: 'abc', name: 'Spaghetti', emoji: '🍝', ingredients: [] }],
      schedule: [{ date: 1, breakfast: 'abc', lunch: '', dinner: '' }],
      groceryList: [],
    };

    await getUserData('123');

    expect(updateDoc).not.toHaveBeenCalled();
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
