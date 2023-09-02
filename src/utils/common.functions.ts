let timeout: any = null;

export function debounce(fun: () => void, timeOut: number = 1500) {
    if (timeout)
        clearTimeout(timeout);
    timeout = setTimeout(fun, timeOut);
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

