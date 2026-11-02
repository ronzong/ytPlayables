const IframeAppCommunicationMessageTools = {

    messageIdToCallbackMap: {},

    getCallbacksForMessageId: (messageId) => {
        let callbacks = IframeAppCommunicationMessageTools.messageIdToCallbackMap[messageId];
        if (!callbacks) {
            callbacks = [];
            IframeAppCommunicationMessageTools.messageIdToCallbackMap[messageId] = callbacks;
        }

        return callbacks;
    },

    onMessage: (event) => {
        if (event.data && event.data.messageId) {
            console.log("FlashistAdaptation __ IframeAppCommunicationMessageTools | onMessage __ event.data: ", event.data);
            // const tempCallback = IframeAppCommunicationMessageTools.messageIdToCallbackMap[event.data.messageId];
            const tempCallbacks = IframeAppCommunicationMessageTools.getCallbacksForMessageId(event.data.messageId);
            if (tempCallbacks && tempCallbacks.length > 0) {
                // tempCallback(event.data);
                for (let singleCallback of tempCallbacks) {
                    singleCallback(event.data);
                }
            }
        }
    },
    addMessageCallbackOnce: (messageId, callback) => {
        const tempHandler = (data) => {
            callback(data);

            IframeAppCommunicationMessageTools.removeMessageCallback(messageId, tempHandler);
        };
        IframeAppCommunicationMessageTools.addMessageCallback(
            messageId,
            tempHandler
        );
    },
    addMessageCallback: (messageId, callback) => {
        // IframeAppCommunicationMessageTools.messageIdToCallbackMap[messageId] = callback;
        const tempCallbacks = IframeAppCommunicationMessageTools.getCallbacksForMessageId(messageId);
        if (tempCallbacks.indexOf(callback) !== -1) {
            return;
        }

        tempCallbacks.push(callback);
    },
    removeMessageCallback: (messageId, callback) => {
        // delete IframeAppCommunicationMessageTools.messageIdToCallbackMap[messageId];
        const tempCallbacks = IframeAppCommunicationMessageTools.getCallbacksForMessageId(messageId);
        const calbackIndex = tempCallbacks.indexOf(callback);
        if (calbackIndex === -1) {
            return;
        }

        // tempCallbacks.push(callback);
        tempCallbacks.splice(calbackIndex, 1);
    },
    sendMessageToParent: (messageId, data) => {
        window.parent.postMessage(
            {
                messageId: messageId,
                data: data
            },
            '*'
        );
    },
};
//
window.IframeAppCommunicationMessageTools = IframeAppCommunicationMessageTools;

// window.onmessage = function(e) {
//     if (e.data == 'hello') {
//         alert('It works!');
//     }
// };
window.onmessage = IframeAppCommunicationMessageTools.onMessage;

// Common Message Ids
const IframeAppCommunicationMessageId = {
    CHILD_IFRAME_TO_PARENT_APP_INIT: "childIframeToParent_appInit",

    CHILD_IFRAME_TO_PARENT_LOAD_PROGRESS: "childIframeToParent_LoadProgress",
    CHILD_IFRAME_TO_PARENT_ANALYTICS: "childIframeToParent_Analytics",
    // CHILD_IFRAME_TO_PARENT_WAIT_FOR_LANGUAGE: "childIFrameToParentWaitForLanguage",

    // PARENT_IFRAME_TO_CHILD_SET_LANGUAGE: "parentIframeToChildSetLanguage"
    PARENT_IFRAME_TO_CHILD_PAUSE: "parentIframeToChild_Pause",
    PARENT_IFRAME_TO_CHILD_RESUME: "parentIframeToChild_Resume",

    PARENT_IFRAME_TO_CHILD_MUTE: "parentIframeToChild_Mute",
    PARENT_IFRAME_TO_CHILD_UNMUTE: "parentIframeToChild_Unmute",

    CHILD_IFRAME_TO_PARENT_WAIT_APPROVE: "childIframeToParent_waitApprove",
    PARENT_IFRAME_TO_CHILD_WAIT_APPROVE_RESULT: "parentIframeToChild_waitApproveResult",

    // CHILD_IFRAME_TO_PARENT_SET_LEADERBOARD_SCORE: "childIframeToParent_setLeaderboardScore",
    CHILD_IFRAME_TO_PARENT_SET_TOTAL_SCORE: "childIframeToParent_setTotalScore",

    CHILD_IFRAME_TO_PARENT_SET_PLAYER_APP_DATA: "childIframeToParent_setPlayerAppData",
}

const IframeAppAnalyticEvents = {
    TUTORIAL_START: "tutorialStart",
    VIEW_ELEMENT: "viewElement",
    LEVEL_START_FIRST_PART: "level:start:"
}

const IframeAppLoadGroup = {
    SCRIPTS: "scripts",
    ASSETS: "assets"
};

const WaitApproveId = {
    RESTART: "restart",
    NEXT_LEVEL: "nextLevel",
    REWARDED: "rewarded"
}