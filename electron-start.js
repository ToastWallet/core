const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
var Menu = electron.Menu;
const path = require('path')
const url = require('url')
const dialog = require('electron').dialog

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

const WEB_FOLDER = 'www';
const PROTOCOL = 'file';


function createWindow () {


    var portable = (    typeof(process) != "undefined" && 
                        typeof(process.env) != "undefined" && 
                        typeof(process.env.PORTABLE_EXECUTABLE_DIR) != "undefined" &&
                        process.env.PORTABLE_EXECUTABLE_DIR != "" 
                    );


    if (portable) {
        app.setPath('userData', process.env.PORTABLE_EXECUTABLE_DIR + "\\walletdata")
    }


  /* the below patch allows electron to load the application without changing the structure away from cordova
  ** credit: https://github.com/bertyhell : https://github.com/electron/electron/issues/2242
  */


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

  var paylink = ( process.argv.length > 1 ? "?paylink=" + Buffer.from(process.argv[1]).toString('hex') : "" );


  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: 'index.html',
    protocol: PROTOCOL + ':',
    slashes: true
  }) + paylink);
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  app.setAsDefaultProtocolClient("xrp");
  app.setAsDefaultProtocolClient("ripple");



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
  });

  if (/^darwin/.test(process.platform)) {

    var template = [{
        label: "Application",
        submenu: [
            { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
        ]}, {
        label: "Edit",
        submenu: [
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]}
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
 }
}


var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    if (commandLine.length > 1)
        mainWindow.webContents.send('pay-link', commandLine[1]);
  }
});

if (shouldQuit) {
  app.quit();
  return;
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
    createWindow();
    
})

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
