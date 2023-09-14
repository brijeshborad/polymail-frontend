import {ElectronApi} from '../../electron-app/preload';

declare global {
    // eslint-disable-next-line no-unused-vars
    interface Window {
        ElectronApi: typeof ElectronApi;
    }
}
