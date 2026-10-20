'use strict';

const APP_ORIGIN = 'sharpmind://app';
const AUTH_STORAGE_KEY = /^sb-[a-z0-9-]{1,80}-auth-token$/;
const AUTH_ROUTES = new Set(['/auth/callback', '/auth/callback/', '/reset-password', '/reset-password/']);
const CALLBACK_QUERY_KEYS = new Set([
  'code', 'error', 'error_code', 'error_description', 'next', 'type',
  'access_token', 'refresh_token', 'token_hash', 'expires_in', 'expires_at', 'token_type',
  'provider_token', 'provider_refresh_token',
]);
const CALLBACK_DESTINATIONS = new Set(['/app', '/app/', '/login', '/login/']);

function hasOnlyKnownCallbackParams(params) {
  for (const [key, value] of params) {
    if (!CALLBACK_QUERY_KEYS.has(key) || value.length > 4096) return false;
  }
  return true;
}

function parseAuthDeepLink(input) {
  if (typeof input !== 'string' || input.length > 8192) return null;

  let url;
  try {
    url = new URL(input);
  } catch {
    return null;
  }
  if (url.protocol !== 'sharpmind:' || url.hostname !== 'app' || url.username || url.password || url.port) return null;
  if (!AUTH_ROUTES.has(url.pathname) || url.hash.length > 4096) return null;
  if (!hasOnlyKnownCallbackParams(url.searchParams)) return null;
  if (url.searchParams.getAll('next').some((destination) => !CALLBACK_DESTINATIONS.has(destination))) return null;
  if (!hasOnlyKnownCallbackParams(new URLSearchParams(url.hash.slice(1)))) return null;

  return `${APP_ORIGIN}${url.pathname}${url.search}${url.hash}`;
}

function isAuthStorageKey(key) {
  return typeof key === 'string' && AUTH_STORAGE_KEY.test(key);
}

function isPublicSupabaseKey(key) {
  if (typeof key !== 'string') return false;
  if (key.startsWith('sb_publishable_')) return true;
  const parts = key.split('.');
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return payload.role === 'anon';
  } catch {
    return false;
  }
}

function resolveStaticFile(root, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes('\0') || decoded.includes('\\')) return null;

  const segments = decoded.split('/').filter(Boolean);
  if (segments.some((segment) => segment === '.' || segment === '..')) return null;
  let relativePath = segments.join('/');
  if (!relativePath || !/\.[a-z0-9]{1,8}$/i.test(relativePath)) relativePath = `${relativePath ? `${relativePath}/` : ''}index.html`;

  const path = require('node:path');
  const resolvedRoot = path.resolve(root);
  const resolvedFile = path.resolve(resolvedRoot, relativePath);
  return resolvedFile.startsWith(`${resolvedRoot}${path.sep}`) ? resolvedFile : null;
}

function validateExternalUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.toString() : null;
  } catch {
    return null;
  }
}

module.exports = { APP_ORIGIN, isAuthStorageKey, isPublicSupabaseKey, parseAuthDeepLink, resolveStaticFile, validateExternalUrl };
