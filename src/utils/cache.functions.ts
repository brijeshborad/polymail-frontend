import {MessageAttachments, MessagePart, Thread, UserProjectOnlineStatus} from "@/models";

let cacheThreads: { [key: string]: Thread[] } = {};
let currentCacheTab = 'INBOX';
let cacheMessages: { [key: string]: { body: MessagePart, attachments: MessageAttachments[] } } = {};
let currentSelectedThreads: number[] = [];
let memberStatus: {
    threads: { [key: string]: UserProjectOnlineStatus[] },
    projects: { [key: string]: UserProjectOnlineStatus[] }
} = {
    threads: {},
    projects: {}
};

export function getCurrentCacheTab() {
    return currentCacheTab;
}

export function setCurrentCacheTab(value: string) {
    currentCacheTab = value;
    return currentCacheTab;
}

export function getCacheThreads() {
    return cacheThreads;
}

export function setCacheThreads(threads: Thread[] | any) {
    cacheThreads = threads;
    return cacheThreads;
}

export function getCacheMessages() {
    return cacheMessages;
}

export function setCacheMessages(messages: any) {
    cacheMessages = messages;
    return cacheMessages;
}

export function getCurrentSelectedThreads() {
    return currentSelectedThreads;
}

export function setCurrentSelectedThreads(indexes: number[]) {
    currentSelectedThreads = indexes;
    return currentSelectedThreads;
}

export function getMemberStatusCache() {
    return memberStatus;
}

export function setMemberStatusCache(data: any) {
    memberStatus = data;
    return memberStatus;
}
