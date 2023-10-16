import {Account} from "@/models";

let timeout: any = null;
let timeoutInterval: any = null;
let globalStore: any = null;
let multiTimeout: { [key: string]: any } = {};

export function debounce(fun: () => void, timeOut: number = 1500, id: string | null = null) {
    if (id) {
        if (multiTimeout[id])
            clearTimeout(multiTimeout[id]);
    } else {
        if (timeout)
            clearTimeout(timeout);
    }
    if (id) {
        multiTimeout[id] = setTimeout(fun, timeOut);
        return multiTimeout[id]
    }
    timeout = setTimeout(fun, timeOut);
    return timeout
}

export function clearDebounce(id: string | null = null) {
    if (id) {
        if (multiTimeout[id])
            clearTimeout(multiTimeout[id]);
    } else {
        if (timeout)
            clearTimeout(timeout);
    }
}

export function debounceInterval(fun: () => void, timeOut: number = 1500) {
    if (timeoutInterval)
        clearInterval(timeout);
    timeoutInterval = setInterval(fun, timeOut);
    return timeoutInterval
}

export const isEmail = (email: string) => {
    return /[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/.test(email);
}

export const isDomain = (domain: string) => {
    return /^[a-zA-Z0-9][-a-zA-Z0-9]+[a-zA-Z0-9].[a-z]{2,3}(.[a-z]{2,3})?(.[a-z]{2,3})?$/.test(domain);
}

export const encryptData = (value: string) => {
    const bcrypt = require('bcryptjs');
    return bcrypt.hashSync(value, 10);
}

export const getFileSize = (size: number) => {
    return size / (1024 * 1024)
}

export const emojiArray = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "👶", "👧", "🧒", "👦", "👩", "🧑", "👨", "👵", "🧓", "👴", "👮", "👷", "💂", "🕵️‍♂️", "👩‍⚕️", "👨‍⚕️", "👩‍🌾", "👨‍🌾", "👩‍🍳", "👨‍🍳", "👩‍🎓", "👨‍🎓", "👩‍🎤", "👨‍🎤", "👩‍🏫", "👨‍🏫", "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🦝", "🐻", "🐨", "🐼", "🦁", "🐯", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🦍", "🦧", "🐔", "🍔", "🍟", "🍕", "🌭", "🍿", "🧂", "🍞", "🥖", "🥐", "🥨", "🥯", "🥞", "🧇", "🍳", "🍗", "🍖", "🥩", "🍔", "🍟", "🍕", "🌭", "🍿", "🧂", "🚗", "🚕", "🚆", "🚇", "🚈", "🚂", "🚊", "🚝", "🚄", "🚅", "🚈", "🚞", "🚋", "🚲", "🛴", "🛵", "🏍️", "🚨", "🚍", "🚌", "🚒", "🚑", "🚓", "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸", "🥏", "🥅", "🏒", "🏑", "🏏", "🥋", "🥊", "🥇", "🥈", "🥉", "🏆"]

export function isElectron() {
    if (process.env.NEXT_PUBLIC_ELECTRON_RUN) {
        return false;
    }
    // Renderer process
    // @ts-ignore
    if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.hasOwnProperty('type') && window.process.type === 'renderer') {
        return true;
    }

    // Main process
    if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
        return true;
    }

    // Detect the user agent when the `nodeIntegration` option is set to true
    if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
        return true;
    }

    return false;
}

export function getRedirectionUrl(path: string) {
    // if (isElectron()) {
    //     return `${process.env.NEXT_PUBLIC_GOOGLE_AUTH_REDIRECT_URL}${path}.html`;
    // }
    return `${process.env.NEXT_PUBLIC_GOOGLE_AUTH_REDIRECT_URL}${path}`;
}

export function makeCollabId(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

export function setGlobalStore(store: any) {
    globalStore = store;
}

export function getGlobalStore() {
    return globalStore;
}

export function generateToasterId() {
    return `poly-toast-${new Date().getMilliseconds().toString()}-${Math.random()}`;
}

export function getSignatureAndProjectBanner(selectedAccount: Account | null | undefined) {
    return getSignatureBanner(selectedAccount) + getProjectBanner(selectedAccount);
}

export function getProjectBanner(selectedAccount: Account | null | undefined) {
    return `<p></p>
        <div style="display: flex; background-color: #EBF83E; width: fit-content; border-radius: 4px; color: #0A101D font-weight: 500; line-height: 1; padding: 5px 10px">
        <p style="font-size: 13px; margin-right: 3px;"> ${selectedAccount?.name || ''} is sharing this email thread (and future replies) with</p>
        <p style="font-size: 13px; margin-right: 3px;">others</p>
        <p style="font-size: 13px; margin-right: 3px;">on</p>
        <p style="font-size: 13px; text-decoration: underline"><a href="https://www.polymailteams.com/" style="color: #1A202C" target="_blank">Polymail</a></p>
      </div>`
}

export function getSignatureBanner(selectedAccount: Account | null | undefined) {
    return `<p></p>${selectedAccount?.signature}`;
}
