const { 
  app, BrowserWindow, ipcMain,
  Menu, Tray, dialog
} = require('electron');

const url = require('url');
const fs = require('fs');
const path = require('path');

// import server.js
const { Server } = require('./server');
const serverPort = 9000;

//
//  App
//
let mainWindow;

// create and show main window on app start
app.on('ready', () => {
  mainWindow = createMainWindow();
});

ipcMain.on('get-server-address', (event) => {
  event.sender.send('server-address', 'http://localhost:'+serverPort)
})

ipcMain.on('open-file', (event) => {
  const dialogOptions = {
    title: 'Select JSON file',
    properties: ['openFile'],
    filters: [{ name: 'JSON', extensions: ['json'] }],
  };

  // when file chosen, add it to the server mock responses
  dialog.showOpenDialog(mainWindow, dialogOptions, (filePaths) => {
    if (!filePaths) return;
    const filePath = filePaths[0];

    fs.readFile(filePath, 'utf8', (err, json) => {
      let endPoint = path.basename(filePath, '.json');
      srv.addPath(endPoint, JSON.parse(json));
    });
  });
})

ipcMain.on('send-to-tray', (event) => {
  const iconPath = path.join(__dirname, './tray-icon.png')
  let tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Show Window...', click: ()=>{ 
      app.dock.show();
      mainWindow.show();
            
      setTimeout(()=>{ tray.destroy(); tray = null; }, 500);
    }},
    {label: 'Quit', role: 'quit'}
  ])
  tray.setContextMenu(contextMenu)
  app.dock.hide();
  mainWindow.hide();
})

//
//  Window
//
function createMainWindow() {
    // setup the window
    let window = new BrowserWindow({
      width: 600, height: 350,
      backgroundColor: '#efefef',
      show: false
    })
  
    // html file to open in window
    const startUrl = process.env.ELECTRON_START_URL || url.format({
      pathname: path.join(__dirname, '../build/index.html'),
      protocol: 'file:',
      slashes: true
    });
    window.loadURL(startUrl);
  
    // once loaded html, send a route command
    window.once('ready-to-show', () => {
      mainWindow.show();
    });
    
    return window;
}

//
//  Server
//
let srv = new Server(serverPort, (logEntry) => {
  mainWindow.webContents.send('log', logEntry);
});
let users = [{id: 1, name: 'John'}, {id: 2, name: 'Peter'}]
srv.addPath('users', users);
//srv.addPath('users/:id', users);
