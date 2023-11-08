import {Thread} from "@/models";
import {
    MAILBOX_ARCHIVE,
    MAILBOX_DRAFT,
    MAILBOX_INBOX, MAILBOX_SENT,
    MAILBOX_SNOOZED, MAILBOX_SPAM, MAILBOX_STARRED,
    MAILBOX_TRASH,
    MAILBOX_UNREAD
} from "@/utils/constants";
import {matchSorter} from "match-sorter";
import {threadService} from "@/services/threads.service";

class CacheService {
    cacheThreads: { [key: string]: Thread[] } = {};

    constructor() {
    }

    buildCache(projectIds: string[]) {
        this.cacheThreads = {};
        let cachePages: string[] = ['INBOX', "PROJECT"];
        let cacheTabs: string[] = [MAILBOX_INBOX, MAILBOX_DRAFT, MAILBOX_UNREAD, MAILBOX_ARCHIVE, MAILBOX_TRASH, MAILBOX_SNOOZED, MAILBOX_STARRED, MAILBOX_SENT, MAILBOX_SPAM];
        let cacheFilters: { [key: string]: string[] } = {
            'INBOX': ['JUST-MINE', 'PROJECTS'],
            'PROJECT': ['JUST-MINE', 'EVERYTHING'],
        }
        cachePages.forEach((page: string) => {
            cacheTabs.forEach((tab: string) => {
                cacheFilters[page].forEach((filter: string) => {
                    if (page === 'PROJECT') {
                        projectIds.forEach((id: string) => {
                            let key = `${page}-${id}-${tab}-${filter}`;
                            this.cacheThreads[key.toLowerCase()] = [];
                        })
                    } else {
                        let key = `${page}-${tab}-${filter}`;
                        this.cacheThreads[key.toLowerCase()] = [];
                    }
                })
            })
        });
    }

    getThreadCache(): { [key: string]: Thread[] } {
        return this.cacheThreads as { [key: string]: Thread[] };
    }

    setThreadCache(value: any) {
        this.cacheThreads = value;
    }

    getThreadCacheByKey(key: string): Thread[] {
        return (this.cacheThreads[key] || []) as Thread[];
    }

    setThreadCacheByKey(key: string, value: any) {
        this.cacheThreads[key] = value;
    }

    buildCacheKey(tab: string, filter: string = '') {
        let cachePage = '';
        let routePaths = window.location.pathname.split('/')
        if (routePaths.includes('inbox')) {
            cachePage = 'INBOX'
        } else {
            cachePage = `PROJECT`;
        }
        if (routePaths.includes('projects')) {
            cachePage += `-${routePaths[2] as string}`
        }
        cachePage += `-${tab}`;
        if (!filter) {
            if (routePaths.includes('projects')) {
                cachePage += '-EVERYTHING';
            } else {
                cachePage += '-JUST-MINE';
            }
        } else {
            cachePage += `-${filter}`;
        }
        return cachePage.toLowerCase();
    }

    extractValuesFromBadges(badges: any[], type: string) {
        let values: string[] = [];
        badges.forEach((b: any) => {
            if (b.type === type) {
                if (type === 'project') {
                    values.push(b.value.id)
                }
                if (type === 'people') {
                    values.push(b.value.email)
                }
            }
        })
        return values;
    }

    performFilter(projectIds: string[], cacheKey: string, values: any, searchTerm: string, keys: string[]): Thread[] {
        if (projectIds.length > 0) {
            if (projectIds.includes(cacheKey.split('-')[1])) {
                return matchSorter(values, searchTerm, {keys})
            }
        } else {
            return matchSorter(values, searchTerm, {keys})
        }
        return [];
    }

    performCacheSearch(searchString: string, badges: any[] = []) {
        let projectIds: string[] = [];
        if (badges.length > 0) {
            projectIds = this.extractValuesFromBadges(badges, 'project');
        }
        let peopleArray: string[] = [];
        if (badges.length > 0) {
            peopleArray = this.extractValuesFromBadges(badges, 'people');
        }
        if (peopleArray.length <= 0 && projectIds.length <= 0 && !searchString) {
            return;
        }
        let allCache = this.getThreadCache();
        let foundThreads: Thread[] = [];
        let peopleToFinKeys: string[] = [
            'messages.*.from.email', 'messages.*.from.name',
        ];
        let keysToFind: string[] = [
            'messages.*.from.email', 'messages.*.from.name',
            'messages.*.to.*.name', 'messages.*.to.*.email',
            'messages.*.cc.*.name', 'messages.*.cc.*.email',
            'messages.*.bcc.*.name', 'messages.*.bcc.*.email',
            'messages.*.subject', 'messages.*.subject',
            'messages.*.attachments.*.filename', 'messages.*.attachments.*.filename',
            'messages.mailboxes.*', 'messages.mailboxes.*',
        ];
        Object.keys(allCache).forEach((cacheKey: string) => {
            let newThreads: Thread[] = [];
            if (!cacheKey.includes(MAILBOX_DRAFT.toLowerCase())) {
                let threads = [...(allCache[cacheKey] || [])];
                threads = threads.map(item => {
                    let messages = [...(item.messages || [])];
                    return {...item, messages: messages.filter((m) => !m.mailboxes?.includes(MAILBOX_DRAFT))};
                })
                if (projectIds.length > 0) {
                    threads = threads.filter(item => {
                        if (item.projects && item.projects?.length > 0) {
                            let ids = item.projects.map(t => t.id);
                            return ids.some((r: any) => projectIds.includes(r));
                        }
                        return false;
                    })
                }
                let filterThreadsForPeople: Thread[] = [];
                peopleArray.forEach((person: string) => {
                    filterThreadsForPeople = [...filterThreadsForPeople, ...this.performFilter(projectIds, cacheKey, threads, person, peopleToFinKeys)]
                })
                if (filterThreadsForPeople.length > 0) {
                    threads = filterThreadsForPeople;
                }
                newThreads = [...newThreads, ...this.performFilter(projectIds, cacheKey, threads, searchString, keysToFind)]
                let replaceWithOriginalThreads = [...(allCache[cacheKey] || [])];
                newThreads = newThreads.map(item => {
                    let findItem = replaceWithOriginalThreads.find(r => r.id === item.id);
                    if (findItem) {
                        return findItem;
                    }
                    return item;
                })
                foundThreads.push(...newThreads);
            }
        })
        threadService.setThreads(foundThreads.filter((tag, index, array) => array.findIndex(t => t.id == tag.id) == index));
    }
}

export const cacheService = new CacheService();
