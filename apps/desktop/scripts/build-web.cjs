'use strict';

const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { isPublicSupabaseKey } = require('../security.cjs');

const supabaseUrl = process.env.SHARPMIND_DESKTOP_SUPABASE_URL;
const supabaseAnonKey = process.env.SHARPMIND_DESKTOP_SUPABASE_ANON_KEY;
const apiUrl = process.env.SHARPMIND_DESKTOP_API_URL || 'https://api.sharpmind.live';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Set SHARPMIND_DESKTOP_SUPABASE_URL and SHARPMIND_DESKTOP_SUPABASE_ANON_KEY to the public production values before packaging.');
  process.exit(1);
}
if (!isPublicSupabaseKey(supabaseAnonKey)) {
  console.error('Refusing to package a Supabase key unless it is an anon JWT or sb_publishable_ key. Never supply a service-role or secret key.');
  process.exit(1);
}

let projectHost;
let apiHost;
try {
  projectHost = new URL(supabaseUrl).hostname;
  apiHost = new URL(apiUrl).hostname;
} catch {
  console.error('Desktop Supabase and API configuration must be valid URLs.');
  process.exit(1);
}
const supabaseParsed = new URL(supabaseUrl);
const apiParsed = new URL(apiUrl);
if (
  projectHost !== 'vscprtuinxopistikpcs.supabase.co' || apiHost !== 'api.sharpmind.live' ||
  supabaseParsed.protocol !== 'https:' || supabaseParsed.pathname !== '/' || supabaseParsed.username || supabaseParsed.password ||
  apiParsed.protocol !== 'https:' || apiParsed.pathname !== '/' || apiParsed.username || apiParsed.password
) {
  console.error('Refusing to package non-production SharpMind endpoints. Use the production Supabase project and https://api.sharpmind.live.');
  process.exit(1);
}

const webDirectory = path.resolve(__dirname, '../../../web');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(npm, ['run', 'build'], {
  cwd: webDirectory,
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
  },
  shell: process.platform === 'win32',
});
if (result.error) {
  console.error('Could not start the web production build:', result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
