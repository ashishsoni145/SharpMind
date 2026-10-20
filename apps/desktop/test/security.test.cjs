'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { isAuthStorageKey, isPublicSupabaseKey, parseAuthDeepLink, resolveStaticFile, validateExternalUrl } = require('../security.cjs');

test('accepts only bounded SharpMind auth callbacks and reset links', () => {
  assert.equal(parseAuthDeepLink('sharpmind://app/auth/callback/?code=abc&next=%2Fapp%2F'), 'sharpmind://app/auth/callback/?code=abc&next=%2Fapp%2F');
  assert.equal(parseAuthDeepLink('sharpmind://app/reset-password/?type=recovery'), 'sharpmind://app/reset-password/?type=recovery');
  assert.equal(parseAuthDeepLink('sharpmind://app/auth/callback/#access_token=short-lived&refresh_token=opaque&type=signup&expires_in=3600&token_type=bearer'), 'sharpmind://app/auth/callback/#access_token=short-lived&refresh_token=opaque&type=signup&expires_in=3600&token_type=bearer');
  assert.equal(parseAuthDeepLink('https://attacker.example/auth/callback?code=abc'), null);
  assert.equal(parseAuthDeepLink('sharpmind://attacker.example/auth/callback?code=abc'), null);
  assert.equal(parseAuthDeepLink('sharpmind://app/app/?next=https%3A%2F%2Fevil.example'), null);
  assert.equal(parseAuthDeepLink('sharpmind://app/auth/callback/?next=%2F%2Fevil.example'), null);
  assert.equal(parseAuthDeepLink('sharpmind://app/auth/callback/#unrecognized=value'), null);
  assert.equal(parseAuthDeepLink(`sharpmind://app/auth/callback/?code=${'x'.repeat(9000)}`), null);
});

test('limits persisted storage to Supabase auth session keys', () => {
  assert.equal(isAuthStorageKey('sb-vscprtuinxopistikpcs-auth-token'), true);
  assert.equal(isAuthStorageKey('unrelated-secret'), false);
  assert.equal(isAuthStorageKey('sb-project-auth-token\n'), false);
});

test('rejects secret Supabase JWT roles from desktop public build configuration', () => {
  const token = (role) => `header.${Buffer.from(JSON.stringify({ role })).toString('base64url')}.signature`;
  assert.equal(isPublicSupabaseKey(token('anon')), true);
  assert.equal(isPublicSupabaseKey('sb_publishable_public-value'), true);
  assert.equal(isPublicSupabaseKey(token('service_role')), false);
  assert.equal(isPublicSupabaseKey('not-a-public-key'), false);
});

test('serves route directories while rejecting encoded traversal', () => {
  const root = path.resolve('fixture');
  assert.equal(resolveStaticFile(root, '/app/profile/'), path.join(root, 'app', 'profile', 'index.html'));
  assert.equal(resolveStaticFile(root, '/%2e%2e/secrets.txt'), null);
  assert.equal(resolveStaticFile(root, '/%5c..%5csecrets.txt'), null);
});

test('opens external links only when HTTPS and without credentials', () => {
  assert.equal(validateExternalUrl('https://sharpmind.live/help'), 'https://sharpmind.live/help');
  assert.equal(validateExternalUrl('javascript:alert(1)'), null);
  assert.equal(validateExternalUrl('https://user:pass@example.com'), null);
});
