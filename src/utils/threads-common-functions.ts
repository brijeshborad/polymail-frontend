import {Thread} from '@/models';
import {updateThreads} from '@/redux/threads/action-reducer';
import { Dispatch } from '@reduxjs/toolkit';

export function markThreadAsRead(thread: Thread, dispatch: Dispatch) {
    if (!thread) return;

    const mailboxes = (thread.mailboxes || [])
    const isUnread = mailboxes.includes('UNREAD');

    if (isUnread) {
        dispatch(
            updateThreads({body:{
                id: thread.id,
                body: {
                    mailboxes: mailboxes.filter(i => i !== 'UNREAD'),
                },
            }}),
        );
    }
}
