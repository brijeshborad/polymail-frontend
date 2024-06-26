import {InitialDraftStateType} from "@/types";
import {BaseService} from "@/services/base.service";
import {updateDraftState} from "@/redux/draft/action-reducer";
import {MessageDraft, Thread} from "@/models";
import {addItemToGroup} from "@/redux/memberships/action-reducer";
import {projectService} from "@/services/project.service";
import {threadService} from "@/services/threads.service";
import {
    getCurrentViewingCacheTab,
} from "@/utils/cache.functions";
import {debounce} from "@/utils/common.functions";
import {cacheService} from "@/services/cache.service";

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

    setComposeDraftAndResumeDraft(draft: MessageDraft | null | undefined) {
        this.setComposeDraft(draft);
        this.setResumeDraft(draft);
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

    getUndoDraft() {
        let {composeDraftUndo} = this.getDraftState();
        this.setDraftState({composeDraftUndo: null});
        return composeDraftUndo;
    }

    restoreBackupDraft() {
        this.setDraftState({draft: null, draftUndo: null});
    }

    saveDraftToResume() {
        let {composeDraft} = this.getDraftState();
        if (composeDraft) {
            this.setResumeDraft(composeDraft);
        }
    }

    resumeDraft() {
        let {resumeAbleDraft} = this.getDraftState();
        this.setComposeDraft(resumeAbleDraft);
    }

    addComposeToProject(router: any) {
        if (router.includes('[project]')) {
            let {composeDraft} = this.getDraftState();
            let {project} = projectService.getProjectState();
            let reqBody = {
                threadIds: [composeDraft!.threadId],
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
    }

    setDraftState(body: InitialDraftStateType) {
        this.dispatchAction(updateDraftState, body);
    }

    discardDraft(draftId: string) {
        let {threads, selectedThread} = threadService.getThreadState();
        this.setDraftState({draft: null});
        let draftIndex = selectedThread?.messages?.findIndex((item) => item.id === draftId);
        if (!draftIndex) {
            return;
        }
        if (draftIndex !== -1) {
            let currentThreads: any = [...(threads || [])];
            let selectThreadIndex: number = currentThreads.findIndex((item: Thread) => item.id === selectedThread?.id);
            if (selectThreadIndex !== -1) {
                currentThreads[selectThreadIndex!] = {...currentThreads[selectThreadIndex!]};
                currentThreads[selectThreadIndex!].messages = [...(currentThreads[selectThreadIndex!].messages || [])];
                currentThreads[selectThreadIndex!].messages.splice(draftIndex, 1);
                threadService.setThreads([...currentThreads]);
                cacheService.setThreadCache({
                    ...cacheService.getThreadCache(),
                    [getCurrentViewingCacheTab()]: [...currentThreads]
                })
                let finalSelectThread: any = {...selectedThread};
                finalSelectThread.messages = [...(finalSelectThread.messages || [])]
                finalSelectThread.messages.splice(draftIndex, 1);
                threadService.setSelectedThread({...finalSelectThread});
            }
        }
    }

    instantDraftUpdate(draft: MessageDraft) {
        this.setDraftState({updatedDraft: draft, success: true});
    }

    liveUpdateDraft(draft: MessageDraft, value: string) {
        debounce(() => {
            this.setDraftState({updatedDraft: {...draft, draftInfo: {...draft.draftInfo, body: value}}, success: true});
        }, 1000, 'LIVE_DRAFT')
    }
}

export const draftService = new DraftService();
