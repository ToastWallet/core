const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {


  /* the below patch allows electron to load the application without changing the structure away from cordova
  ** credit: https://github.com/bertyhell : https://github.com/electron/electron/issues/2242
  */
  const WEB_FOLDER = 'www';
  const PROTOCOL = 'file';

  electron.protocol.interceptFileProtocol(PROTOCOL, (request, callback) => {
      /* Strip protocol */
      let url = request.url.substr(PROTOCOL.length + 1);
      url = url.replace(/\?.*$/g, "");

      /* Build complete path for node require function */
      url = path.join(__dirname, WEB_FOLDER, url);

      url = path.normalize(url);

      console.log("electron-load: " + url);
      callback({path: url});
  });

  // Create the browser window.
  mainWindow = new BrowserWindow({
	width: 450, 
	height: 680,
	title: "Toast Wallet",
	icon: '/img/64.png'
  })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: 'index.html',
    protocol: PROTOCOL + ':',
    slashes: true
  }));
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

// if a modal dialog appears it tends to set the title of the window to index.html
  mainWindow.on("page-title-updated", function(event) {
	event.preventDefault();
  }
}


var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

if (shouldQuit) {
  app.quit();
  return;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
