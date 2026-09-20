import test from 'node:test';
import assert from 'node:assert/strict';
import { safeReturnTo } from '../src/lib/authReturnTo.js';

test('safeReturnTo preserves valid same-origin paths and query params', () => {
  const origin = 'https://flag-atlas.vercel.app';
  assert.equal(safeReturnTo('?returnTo=/dashboard', origin), '/dashboard');
  assert.equal(safeReturnTo(`?returnTo=${encodeURIComponent('/battle?code=ABCD')}`, origin), '/battle?code=ABCD');
  assert.equal(safeReturnTo('?returnTo=/review', origin), '/review');
});

test('safeReturnTo rejects protocol-relative and backslash open redirect bypasses', () => {
  const origin = 'https://flag-atlas.vercel.app';
  // Protocol-relative
  assert.equal(safeReturnTo('?returnTo=//evil.com', origin), '/');
  assert.equal(safeReturnTo('?returnTo=///evil.com', origin), '/');
  assert.equal(safeReturnTo('?returnTo=/.//evil.com', origin), '/');

  // Backslash variations
  assert.equal(safeReturnTo('?returnTo=/\\evil.com', origin), '/');
  assert.equal(safeReturnTo('?returnTo=\\evil.com', origin), '/');
  assert.equal(safeReturnTo('?returnTo=\\\\evil.com', origin), '/');

  // External absolute URLs
  assert.equal(safeReturnTo('?returnTo=https://attacker.com/steal', origin), '/');
  assert.equal(safeReturnTo('?returnTo=http://malicious.org', origin), '/');
  assert.equal(safeReturnTo('?returnTo=javascript:alert(1)', origin), '/');
});

test('safeReturnTo strips sensitive authentication bootstrap parameters', () => {
  const origin = 'https://flag-atlas.vercel.app';
  const target = '/dashboard?access_token=SECRET_123&clear_access_token=true&app_id=APP_99&theme=dark';
  const input = `?returnTo=${encodeURIComponent(target)}`;
  const result = safeReturnTo(input, origin);

  assert.ok(result.startsWith('/dashboard'));
  assert.ok(!result.includes('access_token'));
  assert.ok(!result.includes('clear_access_token'));
  assert.ok(!result.includes('app_id'));
  assert.ok(result.includes('theme=dark'));
});

test('safeReturnTo returns root slash for empty or malformed inputs', () => {
  const origin = 'https://flag-atlas.vercel.app';
  assert.equal(safeReturnTo('', origin), '/');
  assert.equal(safeReturnTo('?foo=bar', origin), '/');
  assert.equal(safeReturnTo(null, origin), '/');
});
