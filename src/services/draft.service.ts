import {InitialDraftStateType} from "@/types";
import {BaseService} from "@/services/base.service";
import {updateDraftState} from "@/redux/draft/action-reducer";
import {Message, MessageDraft, Thread} from "@/models";
import {addItemToGroup} from "@/redux/memberships/action-reducer";
import {projectService} from "@/services/project.service";
import {threadService} from "@/services/threads.service";
import {
    getCacheMessages,
    getCacheThreads,
    getCurrentViewingCacheTab,
    setCacheMessages,
    setCacheThreads
} from "@/utils/cache.functions";
import {removeAttachment} from "@/redux/messages/action-reducer";
import {MAILBOX_DRAFT} from "@/utils/constants";
import {updateThreadState} from "@/redux/threads/action-reducer";

class DraftService extends BaseService {
    constructor() {
        super();
    }

    public getDraftState(): InitialDraftStateType {
        return this.getState('draft');
    }

    setComposeDraft(draft: MessageDraft | null | undefined) {
        this.setDraftState({composeDraft: draft});
    }

    setReplyDraft(draft: MessageDraft | null) {
        this.setDraftState({draft: draft});
    }

    setResumeDraft(draft: MessageDraft | null | undefined) {
        this.setDraftState({resumeAbleDraft: draft});
    }

    backupDraftForUndo() {
        let {draft} = this.getDraftState();
        this.setDraftState({draft: null, draftUndo: draft});
    }

    backupComposeDraftForUndo() {
        let {composeDraft} = this.getDraftState();
        this.setDraftState({composeDraft: null, resumeAbleDraft: null, composeDraftUndo: composeDraft});
    }

    restoreBackupComposeDraft() {
        let {composeDraftUndo} = this.getDraftState();
        this.setDraftState({composeDraft: composeDraftUndo, resumeAbleDraft: composeDraftUndo, composeDraftUndo: null});
    }

    restoreBackupDraft() {
        let {draftUndo} = this.getDraftState();
        this.setDraftState({draft: draftUndo, draftUndo: null});
    }

    updateComposeDraftWithCollabId(collabId: string) {
        let {composeDraft} = this.getDraftState();
        this.setDraftState({
            composeDraft: {
                ...composeDraft,
                draftInfo: {
                    ...composeDraft?.draftInfo,
                    collabId: collabId
                }
            }
        });
    }

    updateDraftWithCollabId(collabId: string) {
        let {draft} = this.getDraftState();
        this.setDraftState({
            draft: {
                ...draft,
                draftInfo: {
                    ...draft?.draftInfo,
                    collabId: collabId
                }
            }
        });
    }

    saveDraftToResume() {
        let {composeDraft} = this.getDraftState();
        this.setResumeDraft(composeDraft);
    }

    resumeDraft() {
        let {resumeAbleDraft} = this.getDraftState();
        this.setComposeDraft(resumeAbleDraft);
    }

    addComposeToProject() {
        let {composeDraft} = this.getDraftState();
        let {project} = projectService.getProjectState();
        let reqBody = {
            threadIds: [composeDraft!.id],
            roles: ['n/a'],
            groupType: 'project',
            groupId: project?.id
        }
        this.dispatchAction(addItemToGroup, {
            body: reqBody,
            afterSuccessAction: () => {
                this.setComposeDraft({...composeDraft, projects: [project]} as MessageDraft)
            }
        })
    }

    setDraftState(body: InitialDraftStateType) {
        this.dispatchAction(updateDraftState, body);
    }

    discardDraft(callBackFunction: any) {
        let {draft} = this.getDraftState();
        let {threads, selectedThread} = threadService.getThreadState();
        let attachments = draft?.draftInfo?.attachments || [];
        this.setDraftState({draft: {...draft, updated: '', draftInfo: {...(draft?.draftInfo || {}), attachments: []}}});
        let draftIndex = selectedThread?.messages?.findIndex((item) => item.id === draft?.id);
        if (draftIndex !== -1) {
            let currentThreads: any = [...(threads || [])];
            let selectThreadIndex: number = currentThreads.findIndex((item: Thread) => item.id === selectedThread?.id);
            if (selectThreadIndex !== -1) {
                currentThreads[selectThreadIndex] = {...(currentThreads[selectThreadIndex] || {})};
                currentThreads[selectThreadIndex!].messages = [...(currentThreads[selectThreadIndex!].messages || [])];
                if (currentThreads[selectThreadIndex]!.messages![draftIndex!]) {
                    currentThreads[selectThreadIndex!].messages![draftIndex!] = {
                        ...currentThreads![selectThreadIndex!].messages![draftIndex!],
                        ...{...draft, updated: '', draftInfo: {...(draft?.draftInfo || {}), attachments: []}}
                    }
                }
                threadService.setThreads(currentThreads);
                setCacheThreads({
                    ...getCacheThreads(),
                    [getCurrentViewingCacheTab()]: currentThreads
                })
                let finalSelectThread: any = {...selectedThread};
                finalSelectThread.messages = [...finalSelectThread.messages];
                finalSelectThread.messages[draftIndex!] = {
                    ...finalSelectThread.messages[draftIndex!],
                    ...{...draft, updated: '', draftInfo: {...(draft?.draftInfo || {}), attachments: []}}
                }
                threadService.setSelectedThread(finalSelectThread);
            }
        }

        attachments.forEach((item) => {
            this.dispatchAction(removeAttachment, {
                body: {id: draft?.id, attachment: item.id!},
                afterSuccessAction: () => {
                    if (callBackFunction) {
                        callBackFunction('', false)
                    }
                }
            })
        })
    }
}

export const draftService = new DraftService();
