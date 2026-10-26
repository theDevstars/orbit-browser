const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
let win;
const urlFrom = a => a.find(x => /^https?:\/\//i.test(x));
function send(u) {
  if (!u || !win) return;
  if (win.isMinimized()) win.restore();
  win.focus();
  win.webContents.send('open', u);
}
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', (e, argv) => send(urlFrom(argv)));
  app.on('open-url', (e, u) => { e.preventDefault(); send(u); });
  ipcMain.on('defaults', () => shell.openExternal('ms-settings:defaultapps'));
  app.whenReady().then(() => {
    app.setAsDefaultProtocolClient('http');
    app.setAsDefaultProtocolClient('https');
    win = new BrowserWindow({ width: 1280, height: 820, minWidth: 480, autoHideMenuBar: true, backgroundColor: '#222', webPreferences: { webviewTag: true, preload: path.join(__dirname, 'preload.js') } });
    win.loadFile('index.html');
    win.webContents.on('did-attach-webview', (e, c) => {
      c.setWindowOpenHandler(({ url }) => { send(url); return { action: 'deny' }; });
    });
    const u = urlFrom(process.argv);
    if (u) win.webContents.once('did-finish-load', () => send(u));
  });
  app.on('window-all-closed', () => app.quit());
}
