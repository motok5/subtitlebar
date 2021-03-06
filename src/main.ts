/* eslint-disable @typescript-eslint/no-explicit-any */
import electron, {
  BrowserWindow,
  app,
  Menu,
  Tray,
  nativeImage,
} from 'electron';
const fs = require('fs');
const mainURL = `file://${__dirname}/../assets/index.html`;
const settingsURL = `file://${__dirname}/../assets/settings.html`;

let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let tray: any = null;

// now_layerを初期化
try {
  const settings = JSON.parse(fs.readFileSync('./nico_settings.json', 'utf8'));
  settings.now_layer = "0";
  fs.writeFileSync('./nico_settings.json', JSON.stringify(settings));
} catch(error) {
  const make_json = {"color":"yellow","speed":"1","font_size":"50","speak":"false","show_image":"false","bot_url":"http://localhost:3000","max_layer":"1","now_layer":"0","authors_list":[]}
  fs.writeFileSync('./nico_settings.json', JSON.stringify(make_json));
}

const createWindow = (): void => {
  if (mainWindow === null) {
    const { screen } = electron;
    const size = screen.getPrimaryDisplay().size;
    mainWindow = new BrowserWindow({
      x: 0,
      y: 0,
      width: size.width,
      height: Math.round(size.height*0.95),
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: true,
      hasShadow: false,
      skipTaskbar: true,
      show: true,
      webPreferences: {
        nodeIntegration: true,
      },
      icon: `${__dirname}/../assets/icons/show.png`,
    });
    mainWindow.setIgnoreMouseEvents(true);
    mainWindow.loadURL(mainURL);

    // // for debug
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
      settingsWindow = null;
      mainWindow = null;
    });
  }

  if (settingsWindow === null) {
    settingsWindow = new BrowserWindow({
      width: 1000,
      height: 700,
      frame: false, //移動不可
      resizable: false,
      show: false,
      webPreferences: {
        nodeIntegration: true,
      },
      icon: `${__dirname}/../assets/icons/show.png`,
    });
    settingsWindow.setMenu(null);
    settingsWindow.loadURL(settingsURL);

    // // for debug
    // settingsWindow.webContents.openDevTools();

    settingsWindow.on('closed', () => {
      settingsWindow = null;
    });
  }
};

app.on('ready', createWindow);
app.whenReady().then(() => {
  tray = new Tray(
    nativeImage.createFromPath(`${__dirname}/../assets/icons/show.png`)
  );
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: function () {
        if (mainWindow === null) {
          createWindow();
        }
        mainWindow?.show();
        mainWindow?.focus();
        tray.setImage(`${__dirname}/../assets/icons/show.png`);
      },
    },
    {
      label: 'Hide',
      click: function () {
        mainWindow?.hide();
        tray.setImage(`${__dirname}/../assets/icons/hide.png`);
      },
    },
    {
      label: 'Settings',
      click: function () {
        if (settingsWindow === null) {
          createWindow();
        }
        settingsWindow?.show();
        settingsWindow?.focus();
      },
    },
    {
      label: 'Relaunch',
      click: function () {
        app.relaunch();
        app.exit();
      },
    },
    {
      label: 'Close',
      click: function () {
        settingsWindow?.close();
        mainWindow?.close();
      },
    },
  ]);
  tray.setToolTip(app.getName());
  tray.setContextMenu(contextMenu);
});
app.on('window-all-closed', () => {
  app.quit();
});
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
