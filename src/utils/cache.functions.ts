import {Thread, UserProjectOnlineStatus} from "@/models";

let cacheThreads: { [key: string]: Thread[] } = {};
let currentCacheTab = 'INBOX';
let currentViewingCacheTab = '';
let currentSelectedThreads: number[] = [];
let draftStatus: { [key: string]: boolean } = {};
let memberStatus: {
    threads: { [key: string]: UserProjectOnlineStatus[] },
    projects: { [key: string]: UserProjectOnlineStatus[] }
} = {
    threads: {},
    projects: {}
};
let inboxLoadedFirstTime: boolean = false;
let projectLoadedFirstTime: boolean = false;
let previousToast: string = '';

export function getCurrentCacheTab() {
    return currentCacheTab;
}

export function setCurrentCacheTab(value: string) {
    currentCacheTab = value;
    return currentCacheTab;
}

export function getDraftStatus() {
    return draftStatus;
}

export function setDraftStatus(value: any) {
    draftStatus = value;
    return draftStatus;
}

export function getCurrentViewingCacheTab() {
    return currentViewingCacheTab;
}

export function setCurrentViewingCacheTab(value: string) {
    currentViewingCacheTab = value;
    return currentViewingCacheTab;
}

export function getCacheThreads() {
    return cacheThreads;
}

export function setCacheThreads(threads: Thread[] | any) {
    cacheThreads = threads;
    return cacheThreads;
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

export function getInboxLoadedFirstTime() {
    return inboxLoadedFirstTime;
}

export function setInboxLoadedFirstTime(value: any) {
    inboxLoadedFirstTime = value;
    return inboxLoadedFirstTime;
}

export function getProjectLoadedFirstTime() {
    return projectLoadedFirstTime;
}

export function setProjectLoadedFirstTime(value: any) {
    projectLoadedFirstTime = value;
    return projectLoadedFirstTime;
}

export function getPreviousToastId() {
    return previousToast;
}

export function setPreviousToastId(value: any) {
    previousToast = value;
    return previousToast;
}
