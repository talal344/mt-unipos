const { contextBridge, ipcRenderer } = require('electron');

// Expose safe desktop IPC APIs to window.electronAPI
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatformInfo: () => ipcRenderer.invoke('get-platform-info'),
});
