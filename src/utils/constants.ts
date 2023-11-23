export const PROJECT_ROLES = ['member', 'admin'];
export const POSITION_GAP = 65535;
export const HEADER_NOT_ALLOWED_PATHS = ['/onboarding', '/onboarding/login', '/onboarding/[type]', '/onboarding/signup', '/onboarding/connect-account', '/onboarding/complete-profile', '/'];
export const MAILBOX_INBOX = 'INBOX'
export const MAILBOX_DRAFT = 'DRAFT'
export const MAILBOX_UNREAD = 'UNREAD'
export const MAILBOX_ARCHIVE = 'ARCHIVE'
export const MAILBOX_TRASH = 'TRASH'
export const MAILBOX_SNOOZED = 'SNOOZED'
export const MAILBOX_STARRED = 'STARRED'
export const MAILBOX_SENT = 'SENT'
export const MAILBOX_SPAM = 'SPAM'
export const MONITORED_KEYS = [
    {key: 37, value: 'LEFT'},
    {key: 38, value: 'UP'},
    {key: 39, value: 'RIGHT'},
    {key: 40, value: 'DOWN'},
    {key: 13, value: 'ENTER'},
    {key: 9, value: 'TAB'},
];
export const ACCOUNT_MAIL_INIT_SYNC_TIMEOUT = 5000;
export const INFINITE_LIST_PER_COUNT = 50;
export const SOCKET_EVENTS = {
    SEARCH_RESULT: 'SearchResult',
    REAUTHENTICATE: 'Reauthenticate',
    INIT_SYNC_PROGRESS: 'InitSyncProgress',
    DRAFT_CREATED: 'DraftCreated',
    ACTIVITY: 'Activity',
    DRAFT_DELETED: 'DraftDeleted',
    NEW_MESSAGE: 'NewMessage',
    SNOOZED_THREAD: 'SnoozedThread',
    THREAD_UPDATED: 'ThreadUpdated',
}
export const SOCKET_ACTIVITY_EVENTS = {
    THREAD_SHARED: 'ThreadShared',
    PROJECT_CREATED: 'ProjectCreated',
    PROJECT_INVITE: 'ProjectInvite',
    REPLY_SENT: 'ReplySent',
    MEMBER_JOINED: 'MemberJoined',
    PROJECT_DELETED: 'ProjectDeleted',
    MEMBER_LEFT: 'MemberLeft'
}
export const ACTIVITY_FEED_EVENT_TYPES = [
    SOCKET_ACTIVITY_EVENTS.THREAD_SHARED,
    SOCKET_ACTIVITY_EVENTS.PROJECT_CREATED,
    SOCKET_ACTIVITY_EVENTS.PROJECT_INVITE,
    SOCKET_ACTIVITY_EVENTS.REPLY_SENT,
    SOCKET_ACTIVITY_EVENTS.MEMBER_JOINED,
    SOCKET_ACTIVITY_EVENTS.PROJECT_DELETED,
    SOCKET_ACTIVITY_EVENTS.MEMBER_LEFT
];
