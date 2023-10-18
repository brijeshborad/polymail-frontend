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

export const emojiArrayWithName = [
    { emoji: "😃", name: "Grinning Face" },
    { emoji: "😃", name: "Grinning Face with Big Eyes" },
    { emoji: "😄", name: "Grinning Face with Smiling Eyes" },
    { emoji: "😁", name: "Beaming Face with Smiling Eyes" },
    { emoji: "😆", name: "Grinning Squinting Face" },
    { emoji: "😅", name: "Grinning Face with Sweat" },
    { emoji: "😂", name: "Face with Tears of Joy" },
    { emoji: "🤣", name: "Rolling on the Floor Laughing" },
    { emoji: "😊", name: "Smiling Face with Blushing" },
    { emoji: "😇", name: "Smiling Face with Halo" },
    { emoji: "🙂", name: "Slightly Smiling Face" },
    { emoji: "🙃", name: "Upside-Down Face" },
    { emoji: "😉", name: "Winking Face" },
    { emoji: "😌", name: "Relieved Face" },
    { emoji: "😍", name: "Heart Eyes" },
    { emoji: "😍", name: "Smiling Face with Heart Eyes" },
    { emoji: "😘", name: "Kissing Heart" },
    { emoji: "😗", name: "Kissing Face" },
    { emoji: "😙", name: "Kissing Face with Smiling Eyes" },
    { emoji: "😚", name: "Kissing Face with Closed Eyes" },
    { emoji: "😋", name: "Face Savoring Food" },
    { emoji: "😛", name: "Face with Tongue Out" },
    { emoji: "😝", name: "Face with Stuck-Out Tongue and Tightly-Closed Eyes" },
    { emoji: "😜", name: "Winking Face with Stuck-Out Tongue" },
    { emoji: "🤪", name: "Zany Face" },
    { emoji: "👶", name: "Baby" },
    { emoji: "👧", name: "Girl" },
    { emoji: "👦", name: "Child" },
    { emoji: "👧", name: "Boy" },
    { emoji: "👩", name: "Woman" },
    { emoji: "👨", name: "Adult" },
    { emoji: "👨", name: "Man" },
    { emoji: "👵", name: "Older Woman" },
    { emoji: "👴", name: "Older Adult" },
    { emoji: "👴", name: "Older Man" },
    { emoji: "👮", name: "Police Officer" },
    { emoji: "👷", name: "Construction Worker" },
    { emoji: "💂", name: "Guard" },
    { emoji: "🕵", name: "Male Detective" },
    { emoji: "👩", name: "Female Doctor" },
    { emoji: "👨", name: "Male Doctor" },
    { emoji: "👩", name: "Female Farmer" },
    { emoji: "👨", name: "Male Farmer" },
    { emoji: "👩", name: "Female Cook" },
    { emoji: "👨", name: "Male Cook" },
    { emoji: "👩", name: "Female Student" },
    { emoji: "👨", name: "Male Student" },
    { emoji: "👩", name: "Female Singer" },
    { emoji: "👨", name: "Male Singer" },
    { emoji: "👩", name: "Female Teacher" },
    { emoji: "👨", name: "Male Teacher" },
    { emoji: "🐶", name: "Dog Face" },
    { emoji: "🐱", name: "Cat Face" },
    { emoji: "🐭", name: "Mouse Face" },
    { emoji: "🐹", name: "Hamster Face" },
    { emoji: "🐰", name: "Rabbit Face" },
    { emoji: "🦊", name: "Fox Face" },
    { emoji: "🦝", name: "Raccoon" },
    { emoji: "🐻", name: "Bear Face" },
    { emoji: "🐨", name: "Koala" },
    { emoji: "🐼", name: "Panda Face" },
    { emoji: "🦁", name: "Lion Face" },
    { emoji: "🐯", name: "Tiger Face" },
    { emoji: "🐮", name: "Cow Face" },
    { emoji: "🐷", name: "Pig Face" },
    { emoji: "🐽", name: "Pig Nose" },
    { emoji: "🐸", name: "Frog Face" },
    { emoji: "🐵", name: "Monkey Face" },
    { emoji: "🙈", name: "See-No-Evil Monkey" },
    { emoji: "🙉", name: "Hear-No-Evil Monkey" },
    { emoji: "🙊", name: "Speak-No-Evil Monkey" },
    { emoji: "🐒", name: "Monkey" },
    { emoji: "🦍", name: "Gorilla" },
    { emoji: "🦧", name: "Orangutan" },
    { emoji: "🐔", name: "Chicken" },
    { emoji: "🍔", name: "Hamburger" },
    { emoji: "🍟", name: "French Fries" },
    { emoji: "🍕", name: "Pizza" },
    { emoji: "🌭", name: "Hot Dog" },
    { emoji: "🍿", name: "Popcorn" },
    { emoji: "🧂", name: "Salt Shaker" },
    { emoji: "🍞", name: "Bread" },
    { emoji: "🥖", name: "Baguette Bread" },
    { emoji: "🥐", name: "Croissant" },
    { emoji: "🥨", name: "Pretzel" },
    { emoji: "🥯", name: "Bagel" },
    { emoji: "🥞", name: "Pancakes" },
    { emoji: "🧇", name: "Waffle" },
    { emoji: "🍳", name: "Cooking" },
    { emoji: "🍗", name: "Poultry Leg" },
    { emoji: "🍖", name: "Meat on Bone" },
    { emoji: "🥩", name: "Cut of Meat" },
    { emoji: "🍔", name: "Hamburger" },
    { emoji: "🍟", name: "French Fries" },
    { emoji: "🍕", name: "Pizza" },
    { emoji: "🌭", name: "Hot Dog" },
    { emoji: "🍿", name: "Popcorn" },
    { emoji: "🧂", name: "Salt Shaker" },
    { emoji: "🚗", name: "Car" },
    { emoji: "🚕", name: "Taxi" },
    { emoji: "🚆", name: "Train" },
    { emoji: "🚇", name: "Metro" },
    { emoji: "🚈", name: "Light Rail" },
    { emoji: "🚂", name: "Steam Locomotive" },
    { emoji: "🚋", name: "Tram" },
    { emoji: "🚝", name: "Monorail" },
    { emoji: "🚄", name: "Bullet Train" },
    { emoji: "🚅", name: "Bullet Train with Headlight" },
    { emoji: "🚈", name: "Light Rail" },
    { emoji: "🚞", name: "Mountain Railway" },
    { emoji: "🚆", name: "Locomotive" },
    { emoji: "🚲", name: "Bicycle" },
    { emoji: "🛴", name: "Scooter" },
    { emoji: "🛵", name: "Motor Scooter" },
    { emoji: "🏍", name: "Racing Motorcycle" },
    { emoji: "🚨", name: "Police Car Light" },
    { emoji: "🚍", name: "Oncoming Bus" },
    { emoji: "🚌", name: "Bus" },
    { emoji: "🚒", name: "Fire Engine" },
    { emoji: "🚑", name: "Ambulance" },
    { emoji: "🚓", name: "Police Car" },
    { emoji: "⚽", name: "Soccer Ball" },
    { emoji: "🏀", name: "Basketball" },
    { emoji: "🏈", name: "American Football" },
    { emoji: "⚾", name: "Baseball" },
    { emoji: "🥎", name: "Softball" },
    { emoji: "🎾", name: "Tennis" },
    { emoji: "🏐", name: "Volleyball" },
    { emoji: "🏉", name: "Rugby Football" },
    { emoji: "🎱", name: "Billiards" },
    { emoji: "🏓", name: "Table Tennis" },
    { emoji: "🏸", name: "Badminton" },
    { emoji: "🥏", name: "Flying Disc" },
    { emoji: "🥅", name: "Goal Net" },
    { emoji: "🏒", name: "Ice Hockey" },
    { emoji: "🏑", name: "Field Hockey" },
    { emoji: "🏏", name: "Cricket" },
    { emoji: "🥋", name: "Martial Arts Uniform" },
    { emoji: "🥊", name: "Boxing Glove" },
    { emoji: "🥇", name: "1st Place Medal" },
    { emoji: "🥈", name: "2nd Place Medal" },
    { emoji: "🥉", name: "3rd Place Medal" },
    { emoji: "🏆", name: "Trophy" }
]

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
    return `<p id="project-banner-gap"></p>
        <div id="project-banner" style="display: flex; background-color: #EBF83E; width: fit-content; border-radius: 4px; color: #0A101D font-weight: 500; line-height: 1; padding: 5px 10px">
        <p style="font-size: 13px; margin-right: 3px;"> ${selectedAccount?.name || ''} is sharing this email thread (and future replies) with</p>
        <p style="font-size: 13px; margin-right: 3px;">others</p>
        <p style="font-size: 13px; margin-right: 3px;">on</p>
        <p style="font-size: 13px; text-decoration: underline"><a href="https://www.polymailteams.com/" style="color: #1A202C" target="_blank">Polymail</a></p>
      </div>`
}

export function getSignatureBanner(selectedAccount: Account | null | undefined) {
    return `<p></p><p></p>${selectedAccount?.signature}`;
}
