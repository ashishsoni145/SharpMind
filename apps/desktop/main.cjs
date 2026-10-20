'use strict';

const { app, BrowserWindow, dialog, ipcMain, protocol, safeStorage, session, shell } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const {
  APP_ORIGIN,
  isAuthStorageKey,
  parseAuthDeepLink,
  resolveStaticFile,
  validateExternalUrl,
} = require('./security.cjs');

const isDevelopment = !app.isPackaged;
const devUrl = process.env.SHARPMIND_DESKTOP_DEV_URL;
const isSmokeTest = process.argv.includes('--smoke-test');
const webRoot = app.isPackaged
  ? path.join(process.resourcesPath, 'web')
  : path.resolve(__dirname, '../../web/out');
const authFile = path.join(app.getPath('userData'), 'auth-session.bin');
let mainWindow;
let pendingDeepLink;
let serializedStorageWrite = Promise.resolve();

protocol.registerSchemesAsPrivileged([{
  scheme: 'sharpmind',
  privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true },
}]);

function requestOriginIsTrusted(event) {
  const frame = event.senderFrame;
  if (!frame || frame !== event.sender.mainFrame) return false;
  if (isDevelopment) return frame.url.startsWith('http://localhost:3000/');
  return frame.url.startsWith(`${APP_ORIGIN}/`);
}

function registerSecureStorageIpc() {
  const guard = (operation, handler) => async (event, ...args) => {
    if (!requestOriginIsTrusted(event)) throw new Error('Untrusted desktop IPC sender');
    try {
      return await handler(...args);
    } catch (error) {
      console.error('Desktop auth storage operation failed', {
        operation,
        message: error && typeof error.message === 'string' ? error.message.slice(0, 240) : 'Unknown error',
      });
      throw error;
    }
  };

  ipcMain.handle('sharp:auth-storage:get', guard('read', async (key) => {
    if (!isAuthStorageKey(key)) throw new Error('Unsupported auth storage key');
    try {
      const encrypted = await fs.readFile(authFile);
      if (!safeStorage.isEncryptionAvailable()) throw new Error('OS credential encryption is unavailable');
      const stored = JSON.parse(safeStorage.decryptString(encrypted));
      return typeof stored[key] === 'string' ? stored[key] : null;
    } catch (error) {
      if (error && error.code === 'ENOENT') return null;
      throw error;
    }
  }));

  ipcMain.handle('sharp:auth-storage:set', guard('write', async (key, value) => {
    if (!isAuthStorageKey(key) || typeof value !== 'string' || value.length > 1024 * 1024) {
      throw new Error('Invalid auth storage data');
    }
    if (!safeStorage.isEncryptionAvailable()) throw new Error('OS credential encryption is unavailable');
    serializedStorageWrite = serializedStorageWrite.then(async () => {
      let stored = {};
      try {
        stored = JSON.parse(safeStorage.decryptString(await fs.readFile(authFile)));
      } catch (error) {
        if (!error || error.code !== 'ENOENT') throw error;
      }
      stored[key] = value;
      const temporaryPath = `${authFile}.tmp`;
      await fs.mkdir(path.dirname(authFile), { recursive: true });
      await fs.writeFile(temporaryPath, safeStorage.encryptString(JSON.stringify(stored)), { mode: 0o600 });
      await fs.rename(temporaryPath, authFile);
    });
    await serializedStorageWrite;
  }));

  ipcMain.handle('sharp:auth-storage:remove', guard('remove', async (key) => {
    if (!isAuthStorageKey(key)) throw new Error('Unsupported auth storage key');
    serializedStorageWrite = serializedStorageWrite.then(async () => {
      let stored = {};
      try {
        stored = JSON.parse(safeStorage.decryptString(await fs.readFile(authFile)));
      } catch (error) {
        if (!error || error.code !== 'ENOENT') throw error;
      }
      delete stored[key];
      if (Object.keys(stored).length === 0) {
        await fs.rm(authFile, { force: true });
      } else {
        const temporaryPath = `${authFile}.tmp`;
        await fs.writeFile(temporaryPath, safeStorage.encryptString(JSON.stringify(stored)), { mode: 0o600 });
        await fs.rename(temporaryPath, authFile);
      }
    });
    await serializedStorageWrite;
  }));
}

async function registerAppProtocol() {
  await protocol.handle('sharpmind', async (request) => {
    const requestUrl = new URL(request.url);
    if (requestUrl.hostname !== 'app') return new Response('Not found', { status: 404 });
    const filePath = resolveStaticFile(webRoot, requestUrl.pathname);
    if (!filePath) return new Response('Bad request', { status: 400 });

    let body;
    try {
      body = await fs.readFile(filePath);
    } catch (error) {
      if (error && (error.code === 'ENOENT' || error.code === 'EISDIR')) return new Response('Not found', { status: 404 });
      console.error('Desktop static asset read failed', { code: error && error.code, path: requestUrl.pathname });
      return new Response('Unable to load application asset', { status: 500 });
    }

    const extension = path.extname(filePath).toLowerCase();
    const types = {
      '.avif': 'image/avif', '.css': 'text/css; charset=utf-8', '.gif': 'image/gif',
      '.html': 'text/html; charset=utf-8', '.ico': 'image/x-icon',
      '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.js': 'text/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8', '.map': 'application/json; charset=utf-8',
      '.mp4': 'video/mp4', '.png': 'image/png', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8',
      '.webmanifest': 'application/manifest+json', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2',
      '.xml': 'application/xml; charset=utf-8',
    };
    return new Response(body, {
      headers: {
        'Content-Type': types[extension] || 'application/octet-stream',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://api.sharpmind.live https://vscprtuinxopistikpcs.supabase.co wss://vscprtuinxopistikpcs.supabase.co; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' https://vscprtuinxopistikpcs.supabase.co",
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    });
  });
}

async function openExternal(value) {
  const safeUrl = validateExternalUrl(value);
  if (safeUrl) await shell.openExternal(safeUrl);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'SharpMind',
    width: 1440,
    height: 960,
    minWidth: 900,
    minHeight: 650,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'win32' ? { icon: path.join(__dirname, 'build', 'icon.ico') } : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      devTools: isDevelopment,
    },
  });
  mainWindow.once('ready-to-show', () => mainWindow && mainWindow.show());
  if (isSmokeTest) {
    mainWindow.webContents.once('did-finish-load', async () => {
      try {
        const result = await mainWindow.webContents.executeJavaScript(`({
          origin: window.location.origin,
          hasSignIn: /sign in|log in/i.test(document.body.innerText),
          hasDesktopBridge: Boolean(window.sharpMindDesktop && window.sharpMindDesktop.authStorage)
        })`);
        if (result.hasSignIn && result.hasDesktopBridge) {
          console.log('Desktop smoke check passed: app rendered the sign-in route and isolated auth bridge.');
          app.exit(0);
        } else {
          console.error('Desktop smoke check failed: expected sign-in content and desktop bridge were not found.');
          app.exit(1);
        }
      } catch (error) {
        console.error('Desktop smoke check failed:', error.message);
        app.exit(1);
      }
    });
  }
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, destination) => {
    const expectedOrigin = isDevelopment ? 'http://localhost:3000' : APP_ORIGIN;
    let destinationOrigin;
    try { destinationOrigin = new URL(destination).origin; } catch { destinationOrigin = ''; }
    if (destinationOrigin !== expectedOrigin) {
      event.preventDefault();
      void openExternal(destination);
    }
  });
  mainWindow.on('closed', () => { mainWindow = null; });
  void (async () => {
    if (isSmokeTest) {
      await mainWindow.loadURL(isDevelopment && devUrl ? `${new URL(devUrl).origin}/login/` : `${APP_ORIGIN}/login/`);
    } else if (pendingDeepLink) {
      const deepLink = pendingDeepLink;
      pendingDeepLink = undefined;
      await mainWindow.loadURL(isDevelopment && devUrl
        ? `${new URL(devUrl).origin}${deepLink.slice(APP_ORIGIN.length)}`
        : deepLink);
    } else if (isDevelopment && devUrl) {
      await mainWindow.loadURL(devUrl);
    } else {
      await mainWindow.loadURL(`${APP_ORIGIN}/`);
    }
  })().catch((error) => console.error('Desktop window load failed', { message: error.message }));
}

function handleDeepLink(value) {
  const safeLink = parseAuthDeepLink(value);
  if (!safeLink) return false;
  pendingDeepLink = safeLink;
  if (mainWindow) {
    const destination = isDevelopment && devUrl
      ? `${new URL(devUrl).origin}${safeLink.slice(APP_ORIGIN.length)}`
      : safeLink;
    void mainWindow.loadURL(destination).catch((error) => console.error('Auth callback navigation failed', { message: error.message }));
  }
  return true;
}

const hasLock = app.requestSingleInstanceLock();
if (!hasLock) {
  app.quit();
} else {
  if (process.defaultApp && process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('sharpmind', process.execPath, [path.resolve(process.argv[1])]);
  } else {
    app.setAsDefaultProtocolClient('sharpmind');
  }
  for (const arg of process.argv) handleDeepLink(arg);
  app.on('second-instance', (_event, argv) => {
    for (const arg of argv) handleDeepLink(arg);
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleDeepLink(url);
  });

  app.whenReady().then(async () => {
    registerSecureStorageIpc();
    await registerAppProtocol();
    session.defaultSession.on('will-download', async (event, item) => {
      item.pause();
      const options = { defaultPath: item.getFilename() };
      const result = mainWindow
        ? await dialog.showSaveDialog(mainWindow, options)
        : await dialog.showSaveDialog(options);
      if (result.canceled || !result.filePath) { item.cancel(); return; }
      item.setSavePath(result.filePath);
      item.resume();
    });
    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  }).catch((error) => {
    console.error('SharpMind desktop startup failed', { message: error.message });
    app.quit();
  });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
