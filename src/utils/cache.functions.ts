import {MessageAttachments, MessagePart, Thread} from "@/models";

let cacheThreads: { [key: string]: Thread[] } = {};
let currentCacheTab = 'INBOX';
let cacheMessages: { [key: string]: { body: MessagePart, attachments: MessageAttachments[] } } = {};

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
