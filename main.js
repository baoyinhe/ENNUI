const {app, BrowserWindow, Menu, ipcMain} = require('electron')
const path = require('path')

function createWindow () {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true, // to allow require
      contextIsolation: false, // allow use with Electron 12+
  }
  })

  Menu.setApplicationMenu(null);
  // const menu = Menu.buildFromTemplate([
  //   {
  //     label: app.name,
  //     submenu: [
  //     {
  //       click: () => mainWindow.webContents.send('update-counter', 1),
  //       label: 'Increment',
  //     },
  //     {
  //       click: () => mainWindow.webContents.send('update-counter', -1),
  //       label: 'Decrement',
  //     }
  //     ]
  //   }

  // ])

  // Menu.setApplicationMenu(menu)
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
  ipcMain.on('counter-value', (_event, value) => {
    console.log(value) // will print value to Node console
  })
  createWindow()
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})