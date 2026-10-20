'use strict';

const { contextBridge, ipcRenderer } = require('electron');

const authStorage = Object.freeze({
  getItem: (key) => ipcRenderer.invoke('sharp:auth-storage:get', key),
  setItem: (key, value) => ipcRenderer.invoke('sharp:auth-storage:set', key, value),
  removeItem: (key) => ipcRenderer.invoke('sharp:auth-storage:remove', key),
});

contextBridge.exposeInMainWorld('sharpMindDesktop', Object.freeze({
  authStorage,
  authRedirectUrl: (kind) => {
    if (kind === 'signup') return 'sharpmind://app/auth/callback/?next=%2Fapp%2F';
    if (kind === 'password-reset') return 'sharpmind://app/reset-password/';
    throw new Error('Unsupported authentication redirect');
  },
}));
