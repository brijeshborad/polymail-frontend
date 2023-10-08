import {InitialProjectState} from "@/types";
import {BaseService} from "@/services/base.service";
import {updateProjectState} from "@/redux/projects/action-reducer";

class ProjectService extends BaseService {
    constructor() {
        super();
    }

    private getProjectState(): InitialProjectState {
        return this.getState('projects');
    }

    setProjectSearchString(value: string) {
        this.setProjectState({projectSearchedString: value});
    }

    setProjectState(body: any) {
        this.dispatchAction(updateProjectState, body);
    }
}

export const projectService = new ProjectService();
