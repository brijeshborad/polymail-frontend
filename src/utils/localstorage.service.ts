class LocalStorageService {

    private static orgKey: string = `poly-selected-org-${process.env.NEXT_PUBLIC_LOCALSTORAGE_POST_FIX}`;
    private static accountKey: string = `poly-selected-account-${process.env.NEXT_PUBLIC_LOCALSTORAGE_POST_FIX}`;
    private static userKey: string = `poly-user-${process.env.NEXT_PUBLIC_LOCALSTORAGE_POST_FIX}`;

    private static updateLocalStorage(key: string, type: string, data: any = null, isJson = false) {
        if (typeof localStorage !== 'undefined') {
            if (type === 'store') {
                return localStorage.setItem(key, isJson ? JSON.stringify(data) : data);
            } else if (type === 'remove') {
                return localStorage.removeItem(key)
            } else if (type === 'get') {
                const data = localStorage.getItem(key);
                return isJson ? (data ? JSON.parse(data) : null) : (data || '');
            }
        }
        return null;
    }

    static updateUser(type: string, data: any = null) {
        return LocalStorageService.updateLocalStorage(this.userKey, type, data, true);
    }

    static updateOrg(type: string, data: any = null) {
        return LocalStorageService.updateLocalStorage(this.orgKey, type, data, true);
    }

    static updateAccount(type: string, data: any = null) {
        return LocalStorageService.updateLocalStorage(this.accountKey, type, data, true);
    }

    static clearStorage() {
        LocalStorageService.updateUser('remove');
        LocalStorageService.updateOrg('remove');
        LocalStorageService.updateAccount('remove');
    }
}

export default LocalStorageService;
