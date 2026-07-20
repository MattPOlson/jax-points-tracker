import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatSubmissionTime,
  formatDateForInput,
  getTodayForInput,
  isToday,
  getRelativeTime
} from './dateUtils.js';

// Timezone is pinned to UTC in vitest.setup.js, so locale-formatted output is
// deterministic. Node 22 ships full ICU, so 'en-US' month abbreviations are stable.

describe('formatDate', () => {
  it('formats a date-only string without timezone drift', () => {
    expect(formatDate('2025-08-29')).toBe('Aug 29, 2025');
  });

  it('formats a space-separated timestamp with microseconds', () => {
    expect(formatDate('2025-08-29 03:43:21.894974')).toBe('Aug 29, 2025');
  });

  it('formats an ISO timestamp', () => {
    expect(formatDate('2025-12-01T12:00:00Z')).toBe('Dec 1, 2025');
  });

  it('honors custom formatting options', () => {
    expect(formatDate('2025-08-29', { month: 'long' })).toBe('August 29, 2025');
  });

  it.each([null, undefined, ''])('returns "Invalid Date" for %s', (input) => {
    expect(formatDate(input)).toBe('Invalid Date');
  });

  it('returns "Invalid Date" for an unparseable string', () => {
    expect(formatDate('not-a-date')).toBe('Invalid Date');
  });
});

describe('formatDateTime', () => {
  it('returns a formatted string for a valid timestamp', () => {
    expect(formatDateTime('2025-08-29 03:43:21.894974')).toContain('Aug 29, 2025');
  });

  it('returns "Invalid Date" for empty input', () => {
    expect(formatDateTime('')).toBe('Invalid Date');
  });
});

describe('formatSubmissionTime', () => {
  it('returns a formatted string for a valid timestamp', () => {
    expect(formatSubmissionTime('2025-07-12 16:34:36.733+00')).not.toBe('Invalid Date');
  });

  it('returns "Invalid Date" for null input', () => {
    expect(formatSubmissionTime(null)).toBe('Invalid Date');
  });
});

describe('formatDateForInput', () => {
  it('formats a Date object as YYYY-MM-DD', () => {
    expect(formatDateForInput(new Date(Date.UTC(2025, 7, 9)))).toBe('2025-08-09');
  });

  it('zero-pads month and day', () => {
    expect(formatDateForInput(new Date(Date.UTC(2025, 0, 5)))).toBe('2025-01-05');
  });

  it('accepts an ISO string', () => {
    expect(formatDateForInput('2025-11-20T00:00:00Z')).toBe('2025-11-20');
  });
});

describe('getTodayForInput', () => {
  afterEach(() => vi.useRealTimers());

  it("returns today's date in YYYY-MM-DD", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-14T10:00:00Z'));
    expect(getTodayForInput()).toBe('2026-03-14');
  });
});

describe('isToday', () => {
  afterEach(() => vi.useRealTimers());

  it('is true for the current day and false otherwise', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-14T10:00:00Z'));
    expect(isToday('2026-03-14T23:00:00Z')).toBe(true);
    expect(isToday('2026-03-13T10:00:00Z')).toBe(false);
  });
});

describe('getRelativeTime', () => {
  afterEach(() => vi.useRealTimers());

  const now = new Date('2026-03-14T12:00:00Z');
  const ago = (ms) => new Date(now.getTime() - ms).toISOString();

  it.each([
    ['30 seconds', 30 * 1000, 'Just now'],
    ['5 minutes', 5 * 60 * 1000, '5 minutes ago'],
    ['1 minute (singular)', 60 * 1000, '1 minute ago'],
    ['2 hours', 2 * 60 * 60 * 1000, '2 hours ago'],
    ['3 days', 3 * 24 * 60 * 60 * 1000, '3 days ago']
  ])('renders %s as "%s"', (_label, offset, expected) => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    expect(getRelativeTime(ago(offset))).toBe(expected);
  });

  it('falls back to an absolute date for older timestamps', () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    // 10 days ago → outside the relative window → formatted date
    expect(getRelativeTime('2026-03-04')).toBe('Mar 4, 2026');
  });
});
