const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const fs = require('fs-extra');

const targetVolumeNames = [
  'MBED',
  'MICROBIT',
];

let mainWindow;

function findMicrobitVolume() {
  let prefix = "/Volumes/";
  let volumes = fs.readdirSync(prefix);
  for (let i = 0; i < volumes.length; ++i) {
    let volume = volumes[i];
    if (targetVolumeNames.indexOf(volume) >= 0) {
      return `${prefix}${volume}/`;
    }
  }
}

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600});

  mainWindow.loadURL('https://makecode.microbit.org/');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    item.once('done', (event, state) => {
      if (state === 'completed') {
        let savedPath = item.getSavePath();
        let writePath = path.join(findMicrobitVolume(), item.getFilename());
        console.log(`Copy: ${savedPath} -> ${writePath}`);

        fs.copy(savedPath, writePath, (err) => {
          if (err) throw err;
        });
      }
    });
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
