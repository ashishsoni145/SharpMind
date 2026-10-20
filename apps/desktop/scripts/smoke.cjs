'use strict';

const { spawn } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '../../../');
const webScript = path.join(root, 'web', 'run-next.js');
const electron = require.resolve('electron/cli.js');
const { choosePort } = require('./dev-server.cjs');
let env;
let web;
let desktop;
let finished = false;

function stop(code) {
  if (finished) return;
  finished = true;
  if (desktop && !desktop.killed) desktop.kill();
  if (web && !web.killed) web.kill();
  process.exitCode = code;
}

const timeout = setTimeout(() => {
  console.error('Desktop smoke test timed out.');
  stop(1);
}, 150_000);
(async () => {
  const port = await choosePort();
  env = { ...process.env, PORT: String(port), SHARPMIND_DESKTOP_DEV_URL: `http://localhost:${port}` };
  web = spawn(process.execPath, [webScript, 'dev'], { cwd: path.dirname(webScript), env, stdio: 'inherit' });
  web.on('exit', (code) => { if (!finished && code !== null) { console.error(`Web dev server exited with ${code}`); clearTimeout(timeout); stop(1); } });
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://localhost:${port}/login/`);
      if (response.ok) break;
    } catch { /* Wait for Next.js. */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  const response = await fetch(`http://localhost:${port}/login/`);
  if (!response.ok) throw new Error(`Web login route returned ${response.status}`);
  desktop = spawn(process.execPath, [electron, path.join(__dirname, '..'), '--smoke-test'], { cwd: root, env, stdio: 'inherit' });
  desktop.on('exit', (code) => {
    clearTimeout(timeout);
    if (code === 0) console.log('Desktop development launch smoke test passed.');
    else console.error(`Desktop smoke process exited with ${code}`);
    stop(code ?? 1);
  });
})().catch((error) => {
  clearTimeout(timeout);
  console.error(error.message);
  stop(1);
});
