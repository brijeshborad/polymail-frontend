import {app, BrowserWindow} from 'electron';
import {createWindow} from './helpers';
import path from "path";

const isProd: boolean = process.env.NODE_ENV === 'production';
let mainWindow: BrowserWindow | any;

if (isProd) {
    app.setPath('userData', `${app.getPath('userData')}`);
} else {
    app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
    await app.whenReady();

    loadEvents();
    mainWindow = createWindow('main', getDefaultWindowConfig());

    if (isProd) {
        await mainWindow.loadURL(`https://teams.polymail.com`);
    } else {
        await mainWindow.loadURL(`https://devapp.polymail.com`);

        // Uncomment Blow code if you want to run & test it on local.

        // const port = process.argv[2];
        // await mainWindow.loadURL(`http://localhost:${port}`);
        // mainWindow.webContents.openDevTools();
    }
    mainWindow.maximize();
})();

function getDefaultWindowConfig() {
    return {
        width: 1000,
        height: 600,
        autoHideMenuBar: isProd,
        webPreferences: {
            sandbox: false,
            preload: path.join(__dirname, 'preload.js'),
        }
    }
}

function loadEvents() {
    // IPCMain Events.
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow('main', getDefaultWindowConfig());
    }
});
