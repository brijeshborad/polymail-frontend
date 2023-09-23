import Store from "electron-store";

export const updateLocalStorage = (key: string, type: string, data: any = null, isJson = false) => {
    const store = new Store({name: 'local-storage'});
    if (type === 'store') {
        return store.set(key, isJson ? JSON.stringify(data) : data);
    } else if (type === 'remove') {
        return store.delete(key)
    } else if (type === 'get') {
        const data: any = store.get(key);
        return isJson ? (data ? JSON.parse(data) : null) : (data || '');
    }
}
