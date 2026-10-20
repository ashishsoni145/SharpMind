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

function stop() {
  if (desktop && !desktop.killed) desktop.kill();
  if (web && !web.killed) web.kill();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);

const waitForWeb = async (port) => {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (web.exitCode !== null) throw new Error(`Web dev server exited with ${web.exitCode}`);
    try {
      const response = await fetch(`http://localhost:${port}/login/`);
      if (response.ok) return;
    } catch { /* The Next.js development server is still starting. */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('Timed out waiting for the web development server.');
};

choosePort().then((port) => {
  env = { ...process.env, PORT: String(port), SHARPMIND_DESKTOP_DEV_URL: `http://localhost:${port}` };
  web = spawn(process.execPath, [webScript, 'dev'], { cwd: path.dirname(webScript), env, stdio: 'inherit' });
  return waitForWeb(port);
}).then(() => {
  desktop = spawn(process.execPath, [electron, path.join(__dirname, '..')], { cwd: root, env, stdio: 'inherit' });
  desktop.on('exit', (code) => { stop(); process.exit(code ?? 0); });
}).catch((error) => {
  console.error(error.message);
  stop();
  process.exit(1);
});
