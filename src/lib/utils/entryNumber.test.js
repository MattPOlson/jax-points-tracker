import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Supabase client. The query builder is chainable and thenable: each
// awaited query pulls the next queued { count, error } result, so we can script
// collisions and errors. Shared state is created inside vi.hoisted because
// vi.mock factories are hoisted above the imports.
const h = vi.hoisted(() => {
  const state = { queue: [], fromCalls: 0 };
  const query = {
    select() {
      return query;
    },
    eq() {
      return query;
    },
    then(onFulfilled, onRejected) {
      const result = state.queue.shift() ?? { count: 0, error: null };
      return Promise.resolve(result).then(onFulfilled, onRejected);
    }
  };
  const supabase = {
    from() {
      state.fromCalls++;
      return query;
    }
  };
  return { state, supabase };
});

vi.mock('$lib/supabaseClient', () => ({ supabase: h.supabase }));

import { generateUniqueEntryNumber } from './entryNumber.js';

describe('generateUniqueEntryNumber', () => {
  beforeEach(() => {
    h.state.queue = [];
    h.state.fromCalls = 0;
  });

  it('returns a zero-padded 5-digit string when the candidate is free', async () => {
    h.state.queue = [{ count: 0, error: null }];
    const entryNumber = await generateUniqueEntryNumber('comp-1');
    expect(entryNumber).toMatch(/^\d{5}$/);
    expect(h.state.fromCalls).toBe(1);
  });

  it('retries on a collision and returns the next free candidate', async () => {
    h.state.queue = [
      { count: 1, error: null }, // taken
      { count: 0, error: null } // free
    ];
    const entryNumber = await generateUniqueEntryNumber('comp-1');
    expect(entryNumber).toMatch(/^\d{5}$/);
    expect(h.state.fromCalls).toBe(2);
  });

  it('throws after exhausting maxAttempts collisions', async () => {
    h.state.queue = [
      { count: 1, error: null },
      { count: 1, error: null },
      { count: 1, error: null }
    ];
    await expect(generateUniqueEntryNumber('comp-1', 3)).rejects.toThrow(
      /unique entry number after maximum attempts/i
    );
    expect(h.state.fromCalls).toBe(3);
  });

  it('throws with the underlying message when the uniqueness check errors', async () => {
    h.state.queue = [{ count: null, error: { message: 'boom' } }];
    await expect(generateUniqueEntryNumber('comp-1')).rejects.toThrow(
      /Failed to check entry number uniqueness: boom/
    );
  });
});
