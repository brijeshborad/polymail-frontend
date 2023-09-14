import {app, BrowserWindow, session} from 'electron';
import serve from 'electron-serve';
import {createWindow} from './helpers';

const isProd: boolean = process.env.NODE_ENV === 'production';

const defaultWindowConfig = {
    width: 1000,
    height: 600,
    autoHideMenuBar: isProd
}

if (isProd) {
    serve({directory: process.env.BUILD_DIR || 'out'});
} else {
    app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
    await app.whenReady();

    const mainWindow = createWindow('main', defaultWindowConfig);

    if (isProd) {
        await mainWindow.loadURL(`app://./index.html`);
    } else {
        const port = process.argv[2];
        await mainWindow.loadURL(`http://localhost:${port}`);
        mainWindow.webContents.openDevTools();
    }
    mainWindow.maximize();
    updateSession();
})();

function updateSession() {
    // const filter = {
    //     urls: ['https://api-development.polymail.io/*', 'https://api-teams.polymail.io/*']
    // };
    session.defaultSession.webRequest.onBeforeSendHeaders(
        (details: any, callback: any) => {
            callback({requestHeaders: {Origin: '*', ...details.requestHeaders}})
        }
    );

    session.defaultSession.webRequest.onHeadersReceived(
        (details: any, callback: any) => {
            callback({
                responseHeaders: {
                    'Access-Control-Allow-Origin': ['*'],
                    // We use this to bypass headers
                    'Access-Control-Allow-Headers': ['*'],
                    ...details.responseHeaders,
                },
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
        createWindow('main', {
            width: 1000,
            height: 600,
            autoHideMenuBar: isProd
        });
    }
});
