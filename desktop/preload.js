const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('orbit', {
  onOpen: cb => ipcRenderer.on('open', (_, u) => cb(u)),
  defaults: () => ipcRenderer.send('defaults')
});
