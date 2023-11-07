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

    extractProjectIdsFromBadges(badges: string[]) {
        let projectIds: string[] = [];
        badges.forEach((b: string) => {
            projectIds.push(b.replace('in:', '').trim())
        })
        return projectIds;
    }

    performCacheSearch(searchString: string, badges: string[] = []) {
        if (!searchString) {
            return;
        }
        // let {projects} = projectService.getProjectState();
        // let findProjects = matchSorter((projects || []), searchString, {keys: ['id', 'name']});
        // console.log('FIND PROJECTS', findProjects);
        // if (searchString.includes('in:')) {
        //
        // }
        let allCache = this.getThreadCache();
        let foundThreads: Thread[] = [];
        let keysToFind: string[] = [
            'messages.*.from.email', 'messages.*.from.name',
            'messages.*.to.*.name', 'messages.*.to.*.email',
            'messages.*.cc.*.name', 'messages.*.cc.*.email',
            'messages.*.bcc.*.name', 'messages.*.bcc.*.email',
            'messages.*.subject', 'messages.*.subject',
            'messages.*.attachments.*.filename', 'messages.*.attachments.*.filename',
            'messages.mailboxes.*', 'messages.mailboxes.*',
        ];
        let projectIds: string[] = [];
        if (badges.length > 0) {
            projectIds = this.extractProjectIdsFromBadges(badges);
        }
        Object.keys(allCache).forEach((cacheKey: string) => {
            if (!cacheKey.includes(MAILBOX_DRAFT.toLowerCase())) {
                if (projectIds.length > 0) {
                    if (projectIds.includes(cacheKey.split('-')[1])) {
                        foundThreads = [...foundThreads, ...matchSorter((allCache[cacheKey] || []), searchString, {keys: keysToFind})];
                    }
                } else {
                    foundThreads = [...foundThreads, ...matchSorter((allCache[cacheKey] || []), searchString, {keys: keysToFind})];
                }
            }
        })
        threadService.setThreads(foundThreads);
    }
}

export const cacheService = new CacheService();
