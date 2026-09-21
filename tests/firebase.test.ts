import { describe, test, expect, vi, beforeEach } from 'vitest';

vi.unmock('../firebase/firebase');
vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({})) }));
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));
const getDoc = vi.fn();
const setDoc = vi.fn();
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  getDoc: (...a: any[]) => getDoc(...a),
  setDoc: (...a: any[]) => setDoc(...a),
}));

import { getUserData, updateUserData } from '../firebase/firebase';
import { onError } from '../src/utils/errors';

describe('updateUserData', () => {
  beforeEach(() => { getDoc.mockReset(); setDoc.mockReset(); });

  test('reports a rejected write instead of failing silently', async () => {
    const listener = vi.fn();
    const unsub = onError(listener);
    setDoc.mockRejectedValue(new Error('offline'));
    await updateUserData('123', { groceryList: [] });
    expect(listener).toHaveBeenCalledOnce();
    expect(listener.mock.calls[0][0]).toMatch(/Couldn't save/);
    unsub();
  });
});

describe('getUserData', () => {
  beforeEach(() => { getDoc.mockReset(); setDoc.mockReset(); });

  test('missing doc + failing create reports once and gives up', async () => {
    const listener = vi.fn();
    const unsub = onError(listener);
    getDoc.mockResolvedValue({ exists: () => false });
    setDoc.mockRejectedValue(new Error('permission-denied'));

    const result = await getUserData('123');

    expect(result).toBeUndefined();
    expect(getDoc).toHaveBeenCalledOnce();   // it used to recurse without bound
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
