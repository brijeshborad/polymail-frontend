let timeout = null;

export function debounce(fun: () => void, timeOut: number = 1500) {
    if (timeout)
        clearTimeout(timeout);
    timeout = setTimeout(fun, timeOut);
}

export const isEmail = (email) => {
    return /[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/.test(email);
}