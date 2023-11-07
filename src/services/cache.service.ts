import {Thread} from "@/models";
import {
    MAILBOX_ARCHIVE,
    MAILBOX_DRAFT,
    MAILBOX_INBOX, MAILBOX_SENT,
    MAILBOX_SNOOZED, MAILBOX_SPAM, MAILBOX_STARRED,
    MAILBOX_TRASH,
    MAILBOX_UNREAD
} from "@/utils/constants";

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
                            this.cacheThreads[`${page}-${tab}-${filter}-${id}`] = [];
                        })
                    } else {
                        this.cacheThreads[`${page}-${tab}-${filter}`] = [];
                    }
                })
            })
        })
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
        cachePage += `-${tab}`;
        if (!filter) {
            if (routePaths.includes('project')) {
                cachePage += '-EVERYTHING';
            } else {
                cachePage += '-JUST-MINE';
            }
        } else {
            cachePage += `-${filter}`;
        }
        cachePage = cachePage.toUpperCase();
        if (routePaths.includes('project')) {
            cachePage += `-${routePaths[2] as string}`
        }
        return cachePage
    }
}

export const cacheService = new CacheService();
