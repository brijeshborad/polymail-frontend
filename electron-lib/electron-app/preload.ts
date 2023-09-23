import {contextBridge, ipcRenderer} from 'electron';
import {updateLocalStorage} from "./helpers";

export const ElectronApi = {
    /**
     * Use this function to send messages via IPC communication
     */
    send: (channel: string, data?: any) => {
        ipcRenderer.send(channel, data);
    },

    /**
     * Use this function to send multiple pieces of data via IPC communication
     */
    sendMultiple: (channel: string, ...data: any[]) => {
        ipcRenderer.send(channel, ...data)
    },

    /**
     * Use this function to invoke functions with return callback
     */
    invoke: async (channel: string, data?: any) => {
        return await ipcRenderer.invoke(channel, data)
    },

    /**
     * Use this function as an easier way to listen to events
     */
    on: (channel: string, callback: Function) =>
        ipcRenderer.on(channel, (_, data) => callback(data)),

    /**
     * Use this function to clean up event listeners
     */
    off: (channel: string, callback: Function) =>
        ipcRenderer.removeListener(channel, (_, data) => callback(data)),

    updateLocalStorage: updateLocalStorage
};

contextBridge.exposeInMainWorld('ElectronApi', ElectronApi);
