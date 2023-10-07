import {Project, Thread} from '@/models';
import {updateThreads, updateThreadState} from '@/redux/threads/action-reducer';
import { Dispatch } from '@reduxjs/toolkit';
import {addItemToGroup} from "@/redux/memberships/action-reducer";
import {removeThreadFromProject} from "@/redux/projects/action-reducer";

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

export function addThreadToProject(item: Project, multiSelection: any, selectedThread: any, dispatch: Dispatch, threads: Thread[], addToProjectRef?: any) {
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
    let successMessage: any = {}
    let polyToast = `poly-toast-${new Date().getMilliseconds().toString()}`;

    if (isThreadMultiSelection) {
      successMessage = {
        title: `${multiSelection.length} threads added to ${item.name?.toLowerCase()}`,
        desc: '',
        type: 'undo_changes',
        id: polyToast
      }
    } else {
      successMessage = {
        desc: 'Thread was added to ' + item.name?.toLowerCase() + '.',
        title: selectedThread?.subject || '',
        type: 'undo_changes',
        id: polyToast
      }
    }
    const projects = selectedThread?.projects || [];

    let addProject = {
      ...selectedThread,
      projects: [...projects, item]
    }
    let index1 = (threads || []).findIndex((item: Thread) => item.id === selectedThread?.id);
    let newThreads: Thread[] = threads ?? [];
    if (threads) {
      newThreads = [...threads];
      newThreads[index1] = {
        ...newThreads[index1],
        projects: [...projects, item]
      }
    }
    dispatch(updateThreadState({ selectedThread: addProject , threads: newThreads}));
    dispatch(addItemToGroup({
      body:reqBody,
      toaster:{
        success: successMessage,
      },
        undoAction: {
          showUndoButton: true,
          dispatch,
          action: removeThreadFromProject,
          undoBody: {
            body: {
              threadId: selectedThread.id,
              projectId: item.id,
            },
            success: {
              desc: 'Thread was removed from ' + item.name?.toLowerCase() + '.',
              title: selectedThread?.subject || '',
              type: 'success'
            },
            afterUndoAction: () => {
              dispatch(updateThreadState({ selectedThread: selectedThread , threads: threads}));
            }
          },
          showToasterAfterUndoClick: true
        }
    }
    ));

    if (addToProjectRef && addToProjectRef.current) {
      addToProjectRef.current?.click();
    }
  }
}
