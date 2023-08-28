let timeout: any = null;

export function debounce(fun: () => void, timeOut: number = 1500) {
    if (timeout)
        clearTimeout(timeout);
    timeout = setTimeout(fun, timeOut);
}

export const isEmail = (email: string) => {
    return /[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/.test(email);
}

export const encryptData = (value: string) => {
    const bcrypt = require('bcryptjs');
    return bcrypt.hashSync(value, 10);
}

export const POSITION_GAP = 65535;

