class DomService {
    constructor() {
    }

    addOrRemoveSelectedThreadClasses(removeClass: boolean = false) {
        let threadBar = document.getElementById('inbox-thread-side-bar');
        let messageBar = document.getElementById('inbox-message-side-bar');

        if (threadBar) {
            if (!removeClass) {
                if (!threadBar.classList.contains('selected-thread')) {
                    threadBar.classList.add('selected-thread');
                }
            } else {
                if (threadBar.classList.contains('selected-thread')) {
                    threadBar.classList.remove('selected-thread');
                }
            }
        }

        if (messageBar) {
            if (!removeClass) {
                if (!messageBar.classList.contains('selected-thread')) {
                    messageBar.classList.add('selected-thread');
                }
            } else {
                if (messageBar.classList.contains('selected-thread')) {
                    messageBar.classList.remove('selected-thread');
                }
            }
        }
    }
}

export const domService = new DomService();
