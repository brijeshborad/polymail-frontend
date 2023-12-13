class DomService {
    constructor() {
    }

    addClass(element: any) {
        if (!element.classList.contains('selected-thread')) {
            element.classList.add('selected-thread');
        }
    }

    removeClass(element: any) {
        if (element.classList.contains('selected-thread')) {
            element.classList.remove('selected-thread');
        }
    }

    addOrRemoveSelectedThreadClasses(removeClass: boolean = false) {
        let threadBar = document.getElementById('inbox-thread-side-bar');
        let messageBar = document.getElementById('inbox-message-side-bar');
        let projectBar = document.getElementById('inbox-page-projects-header');
        let pageHeader = document.getElementById('page-header');

        if (threadBar) {
            if (!removeClass) {
                this.addClass(threadBar)
            } else {
                this.removeClass(threadBar);
            }
        }

        if (messageBar) {
            if (!removeClass) {
                this.addClass(messageBar)
            } else {
                this.removeClass(messageBar)
            }
        }

        if (projectBar) {
            if (!removeClass) {
                this.addClass(projectBar)
            } else {
                this.removeClass(projectBar)
            }
        }

        if (pageHeader) {
            if (!removeClass) {
                this.addClass(pageHeader)
            } else {
                this.removeClass(pageHeader)
            }
        }
    }
}

export const domService = new DomService();
