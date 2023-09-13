import {app, BrowserWindow} from 'electron';
import serve from 'electron-serve';
import {createWindow} from './helpers';

const isProd: boolean = process.env.NODE_ENV === 'production';

if (isProd) {
    serve({directory: 'app'});
} else {
    app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
    await app.whenReady();

    const mainWindow = createWindow('main', {
        width: 1000,
        height: 600,
        autoHideMenuBar: !isProd
    });

    if (isProd) {
        await mainWindow.loadURL('app://./index.html');
    } else {
        const port = process.argv[2];
        await mainWindow.loadURL(`http://localhost:${port}`);
        mainWindow.webContents.openDevTools();
    }
    mainWindow.maximize();
})();

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
            autoHideMenuBar: !isProd
        });
    }
});
