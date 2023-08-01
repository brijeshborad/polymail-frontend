export const getStoreLocal = (item: string, isJSON = false) => {
    if (typeof localStorage !== 'undefined') {
        if (localStorage.getItem(item)) {
            return isJSON ? JSON.parse(localStorage.getItem(item) as string):  localStorage.getItem(item);
        }
        return null;
    }
    return null;
}

export const setStoreLocal = (item: string, value: string) => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(item, value);
    }
}

export const removeStoreLocal = (item: string) => {
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(item);
    }
}
