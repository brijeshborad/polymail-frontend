import {InitialDraftStateType} from "@/types";
import {BaseService} from "@/services/base.service";
import {updateDraftState} from "@/redux/draft/action-reducer";
import {MessageDraft} from "@/models";
import {addItemToGroup} from "@/redux/memberships/action-reducer";
import {projectService} from "@/services/project.service";

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
}

export const draftService = new DraftService();
