import {app, BrowserWindow, ipcMain} from 'electron';
import serve from 'electron-serve';
import {createWindow, updateLocalStorage} from './helpers';
import path from "path";

const isProd: boolean = process.env.NODE_ENV === 'production';
let mainWindow: BrowserWindow | any;

if (isProd) {
    serve({directory: process.env.BUILD_DIR || 'out'});
} else {
    app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
    await app.whenReady();

    mainWindow = createWindow('main', getDefaultWindowConfig());

    if (isProd) {
        await mainWindow.loadURL(`app://-`);
    } else {
        const port = process.argv[2];
        await mainWindow.loadURL(`http://localhost:${port}`);
        mainWindow.webContents.openDevTools();
    }
    mainWindow.maximize();
    if (isProd) {
        updateSession();
        loadEvents();
    }
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
    ipcMain.on('store-data', updateLocalStorage)
}

function UpsertKeyValue(obj: any, keyToChange: string, value: any) {
    const keyToChangeLower = keyToChange.toLowerCase();
    for (const key of Object.keys(obj)) {
        if (key.toLowerCase() === keyToChangeLower) {
            // Reassign old key
            obj[key] = value;
            // Done
            return;
        }
    }
    // Insert at end instead
    obj[keyToChange] = value;
}

function updateSession() {
    mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
        (details: any, callback: any) => {
            const {requestHeaders} = details;
            UpsertKeyValue(requestHeaders, 'Access-Control-Allow-Origin', ['*']);
            UpsertKeyValue(requestHeaders, 'Origin', ['*']);
            callback({requestHeaders});
        }
    );

    mainWindow.webContents.session.webRequest.onHeadersReceived(
        (details: any, callback: any) => {
            const {responseHeaders} = details;
            UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Origin', ['*']);
            UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Headers', ['*']);
            callback({
                responseHeaders,
            });
        }
    )
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
