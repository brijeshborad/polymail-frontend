import {Project, Thread} from '@/models';
import {updateThreads, updateThreadState} from '@/redux/threads/action-reducer';
import { Dispatch } from '@reduxjs/toolkit';
import {addItemToGroup} from "@/redux/memberships/action-reducer";

export function markThreadAsRead(thread: Thread, dispatch: Dispatch) {
    if (!thread) return;

    const mailboxes = (thread.mailboxes || [])
    const isUnread = mailboxes.includes('UNREAD');

    if (isUnread) {
        dispatch(
            updateThreads({
                id: thread.id,
                body: {
                    mailboxes: mailboxes.filter(i => i !== 'UNREAD'),
                },
            }),
        );
    }
}

export function addThreadToProject(item: Project, multiSelection: any, selectedThread: Thread, dispatch: Dispatch, setSuccessMessage: any, addToProjectRef?: any) {
  const isThreadMultiSelection = (multiSelection !== undefined && multiSelection.length > 0)
  if ((selectedThread && selectedThread.id || (multiSelection !== undefined && multiSelection.length > 0))) {
    let reqBody = {
      threadIds: isThreadMultiSelection ? multiSelection : [selectedThread!.id],
      roles: [
        'n/a',
      ],
      groupType: 'project',
      groupId: item.id
    }

    if (isThreadMultiSelection) {
      setSuccessMessage({
        title: `${multiSelection.length} threads added to ${item.name?.toLowerCase()}`,
        desc: ''
      })
    } else {
      setSuccessMessage({
        desc: 'Thread was added to ' + item.name?.toLowerCase() + '.',
        title: selectedThread?.subject || '',
      })
    }
    dispatch(addItemToGroup(reqBody));
    let addProject = {
      ...selectedThread,
      projects: [item]
    }
    dispatch(updateThreadState({ selectedThread: addProject }));

    if (addToProjectRef && addToProjectRef.current) {
      addToProjectRef.current?.click();
    }
  }
}
