import { describe, test, expect, vi } from 'vitest';
import { notifyError, onError } from '../src/utils/errors';

describe('error channel', () => {
  test('delivers a message to every subscriber', () => {
    const first = vi.fn();
    const second = vi.fn();
    const unsubFirst = onError(first);
    const unsubSecond = onError(second);

    notifyError('boom');

    expect(first).toHaveBeenCalledWith('boom');
    expect(second).toHaveBeenCalledWith('boom');
    unsubFirst();
    unsubSecond();
  });

  test('stops delivering once unsubscribed', () => {
    const listener = vi.fn();
    const unsubscribe = onError(listener);
    unsubscribe();

    notifyError('boom');

    expect(listener).not.toHaveBeenCalled();
  });
});
