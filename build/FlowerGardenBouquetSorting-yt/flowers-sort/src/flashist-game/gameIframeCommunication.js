const GameIframeCommunicationManager = {

    flashistGlobalClass: null,

    isGamePausedByParentApp: false,
    isGameMutedByParentApp: false,
    checkIfPausedOrMuted: () => {
        let result = false;
        if (GameIframeCommunicationManager.isGamePausedByParentApp || GameIframeCommunicationManager.isGameMutedByParentApp) {
            result = true;
        }

        return result;
    },

    gameBlockingIframeCommunicationId: "gameIframeCommunication",
    allProblematicAudioSources: [],
    problematiceMusicId: "music_selectBg",

    // Cocos Creator
    cocosCreator_onChildAppShowCallback: null,
    cocosCreator_onChildAppHideCallback: null,

    // YYGGames
    // yyggames_gameController: null,

    addProblematicSound: (sound) => {
        if (GameIframeCommunicationManager.allProblematicAudioSources.indexOf(sound) !== -1) {
            return;
        }
        GameIframeCommunicationManager.allProblematicAudioSources.push(sound);
    },
    removeProblematicSound: (sound) => {
        let tempIndex = GameIframeCommunicationManager.allProblematicAudioSources.indexOf(sound);
        if (tempIndex !== -1) {
            GameIframeCommunicationManager.allProblematicAudioSources.splice(tempIndex, 1);
        }
    },
    pauseAllProblematicSounds: () => {
        let problematicSoundsCount = GameIframeCommunicationManager.allProblematicAudioSources.length;
        for (let problematicSoundIndex = 0; problematicSoundIndex < problematicSoundsCount; problematicSoundIndex++) {
            let tempSound = GameIframeCommunicationManager.allProblematicAudioSources[problematicSoundIndex];
            tempSound.pause();
        }
    },

    init: () => {
        console.log("Flashist Adaptation __ GameIframeCommunicationManager __ init");

        // Listening to important events from the -app
        IframeAppCommunicationMessageTools.addMessageCallback(
            IframeAppCommunicationMessageId.PARENT_IFRAME_TO_CHILD_MUTE,
            () => {
                GameIframeCommunicationManager.isGameMutedByParentApp = true;

                // disableSettingsFlag(SettingFlag.Sound);
                // disableSettingsFlag(SettingFlag.Music);
                // gmg.SoundManager._getInstance().setSoundMute(true);
                // gmg.SoundManager._getInstance().setMusicMute(true);

                // if (window && window.onblur) {
                //     window.onblur();
                // }
            }
        );
        IframeAppCommunicationMessageTools.addMessageCallback(
            IframeAppCommunicationMessageId.PARENT_IFRAME_TO_CHILD_UNMUTE,
            () => {
                GameIframeCommunicationManager.isGameMutedByParentApp = false;
                //
                if (GameIframeCommunicationManager.cocosCreator_onChildAppShowCallback) {
                    GameIframeCommunicationManager.cocosCreator_onChildAppShowCallback();
                }

                // enableSettingsFlag(SettingFlag.Sound);
                // enableSettingsFlag(SettingFlag.Music);
                // gmg.SoundManager._getInstance().setSoundMute(false);
                // gmg.SoundManager._getInstance().setMusicMute(false);

                // if (window && window.onfocus) {
                //     window.onfocus();
                // }
            }
        );
        IframeAppCommunicationMessageTools.addMessageCallback(
            IframeAppCommunicationMessageId.PARENT_IFRAME_TO_CHILD_PAUSE,
            () => {
                console.log("FlashistAdaptation __ GameIframeCommunicationManager | on PARENT_IFRAME_TO_CHILD_PAUSE");

                // Cocos Creator
                GameIframeCommunicationManager.isGamePausedByParentApp = true;
                cc.game.pause();
                //
                if (GameIframeCommunicationManager.cocosCreator_onChildAppHideCallback) {
                    GameIframeCommunicationManager.cocosCreator_onChildAppHideCallback();
                }
                // //
                // if (GameIframeCommunicationManager.flashistGlobalClass) {
                //     GameIframeCommunicationManager.flashistGlobalClass.pauseSound(GameIframeCommunicationManager.gameBlockingIframeCommunicationId);
                // }
                // //
                // GameIframeCommunicationManager.pauseAllProblematicSounds();

                // Flashist Adaptation: copying from iframe.html
                // document.dispatchEvent(new Event("audioPause"));
                // if (Laya.stage) {
                //     Laya.stage.renderingEnabled = false;
                // }
                // if (Laya.timer) {
                //     Laya.timer.pause();
                //     Laya.timer.scale = 0;
                // }

                // GameIframeCommunicationManager.isGameBlockedByParentApp = true;
                // //
                // if (GameIframeCommunicationManager.yyggames_gameController) {
                //     GameIframeCommunicationManager.yyggames_gameController.onVisibilitychange();
                // }

                // // Flashist Adaptation: copying from iframe.html
                // document.dispatchEvent(new Event("audioPause"));
                // Laya.stage.renderingEnabled = false;
                // Laya.timer.pause();
                // Laya.timer.scale = 0;

                // Construct
                // const curIsSuspended = runtime.isSuspended;
                // console.log("FlashistAdaptation __ GameIframeCommunicationManager | curIsSuspended: ", curIsSuspended);
                // if (!curIsSuspended) {
                //     runtime.setSuspended(true);
                // }

                // // Phaser
                // if (!phaserFacade.game.isPaused) {
                //     phaserFacade.game.pause();
                // }
                // if (window && window.onblur) {
                //     window.onblur();
                // }

                // wasMutedBeforeParent = phaserFacade.sound.mute;
                // if (!phaserFacade.sound.mute) {
                //     // phaserGame.sound.setMute(true);
                // }
                // phaserFacade.context.suspend();
                // phaserFacade.pauseAll();

                // // DEBUG
                // runtime.SetSuspended(true);
                // runtime.SetSuspended(true);
                // window.__ytGameTimers.setTimeout(
                //     () => {
                //         runtime.SetSuspended(true);
                //     },
                //     100
                // );
                // disableSettingsFlag(SettingFlag.Sound);
                // disableSettingsFlag(SettingFlag.Music);
                // gmg.SoundManager._getInstance().setSoundMute(true);
                // gmg.SoundManager._getInstance().setMusicMute(true);
            }
        );
        IframeAppCommunicationMessageTools.addMessageCallback(
            IframeAppCommunicationMessageId.PARENT_IFRAME_TO_CHILD_RESUME,
            () => {
                console.log("FlashistAdaptation __ GameIframeCommunicationManager | on PARENT_IFRAME_TO_CHILD_UNPAUSE");

                // Cocos Creator
                GameIframeCommunicationManager.isGamePausedByParentApp = false;
                cc.game.resume();
                //
                if (GameIframeCommunicationManager.cocosCreator_onChildAppShowCallback) {
                    GameIframeCommunicationManager.cocosCreator_onChildAppShowCallback();
                }
                // //
                // if (GameIframeCommunicationManager.flashistGlobalClass) {
                //     GameIframeCommunicationManager.flashistGlobalClass.resumeSound(GameIframeCommunicationManager.gameBlockingIframeCommunicationId);
                // }

                // Flashist Adaptation: copying from iframe.html
                // document.dispatchEvent(new Event("audioResume"));
                // if (Laya.stage) {
                //     Laya.stage.renderingEnabled = true;
                // }
                // if (Laya.timer) {
                //     Laya.timer.resume();
                //     Laya.timer.scale = 1;
                // }

                // GameIframeCommunicationManager.isGameBlockedByParentApp = false;
                // //
                // if (GameIframeCommunicationManager.yyggames_gameController) {
                //     GameIframeCommunicationManager.yyggames_gameController.onVisibilitychange();
                // }

                // // Phaser
                // if (phaserFacade.game.isPaused) {
                //     phaserFacade.game.resume();
                // }
                // if (window && window.onfocus) {
                //     window.onfocus();
                // }

                // if (wasMutedBeforeParent) {
                //     if (phaserFacade.mute) {
                //         // phaserGame.setMute(false);
                //     }
                // }
                // phaserFacade.context.resume();
                // phaserFacade.resumeAll();

                // // Construct
                // const curIsSuspended = runtime.isSuspended;
                // console.log("FlashistAdaptation __ GameIframeCommunicationManager | curIsSuspended: ", curIsSuspended);
                // if (curIsSuspended) {
                //     runtime.setSuspended(false);
                // }

                // disableSettingsFlag(SettingFlag.Sound);
                // disableSettingsFlag(SettingFlag.Music);
                // gmg.SoundManager._getInstance().setSoundMute(true);
                // gmg.SoundManager._getInstance().setMusicMute(true);
            }
        );

        // Child App Init Complete Event
        IframeAppCommunicationMessageTools.sendMessageToParent(
            IframeAppCommunicationMessageId.CHILD_IFRAME_TO_PARENT_APP_INIT
        );
    },

    // LOADING

    flashistScriptsLoaded: false,
    flashistScriptsLoadingCoef: 0.05,

    flashistDataLoaded: false,
    flashistDataLoadingCoef: 0.05,

    flashistAllLoadingComplete: false,
    // flashistAllLoadingCompleteCoef: 0.1,
    flashistAllLoadingCompleteCoef: 0.2,

    // flashistRegularLoadingCoef: 1 - flashistScriptsLoadingCoef - flashistDataLoadingCoef,
    getFlashistRegularLoadingCoef: () => {
        return 1 - GameIframeCommunicationManager.flashistScriptsLoadingCoef - GameIframeCommunicationManager.flashistDataLoadingCoef - GameIframeCommunicationManager.flashistAllLoadingCompleteCoef
    },
    flashistLastProcessedProgress: 0,
    //
    sendLoadingProgressMessage: (progressCoef) => {
        console.log("FlashistAdaptation | sendLoadingProgressMessage __ progressCoef: ", progressCoef);
        // if (progressCoef <= flashistLastProcessedProgress) {
        //     return;
        // }
        GameIframeCommunicationManager.flashistLastProcessedProgress = progressCoef;

        GameIframeCommunicationManager.commitLoadingProgressData();
    },
    //
    commitLoadingProgressData: () => {
        let flashist_ChildIframeTotalLoadingProgress = 0;
        if (GameIframeCommunicationManager.flashistAllLoadingComplete) {
            flashist_ChildIframeTotalLoadingProgress = 1;

        } else {
            if (GameIframeCommunicationManager.flashistScriptsLoaded) {
                flashist_ChildIframeTotalLoadingProgress += GameIframeCommunicationManager.flashistScriptsLoadingCoef;
            }
            if (GameIframeCommunicationManager.flashistDataLoaded) {
                flashist_ChildIframeTotalLoadingProgress += GameIframeCommunicationManager.flashistDataLoadingCoef;
            }

            flashist_ChildIframeTotalLoadingProgress += GameIframeCommunicationManager.flashistLastProcessedProgress * GameIframeCommunicationManager.getFlashistRegularLoadingCoef();
            if (flashist_ChildIframeTotalLoadingProgress > 1) {
                flashist_ChildIframeTotalLoadingProgress = 1;
            }
        }

        console.log("FlashistAdaptation | commitLoadingProgressData __ flashistLastProcessedProgress: ", GameIframeCommunicationManager.flashistLastProcessedProgress,
            " | flashist_ChildIframeTotalLoadingProgress: ", flashist_ChildIframeTotalLoadingProgress,
            " | flashistAllLoadingComplete: ", GameIframeCommunicationManager.flashistAllLoadingComplete,
            " | flashistScriptsLoaded: ", GameIframeCommunicationManager.flashistScriptsLoaded,
            " | flashistDataLoaded: ", GameIframeCommunicationManager.flashistDataLoaded,
        );

        // const curLoadingProgress = GameIframeCommunicationManager._runtime.GetAssetManager().GetLoadProgress();
        IframeAppCommunicationMessageTools.sendMessageToParent(
            IframeAppCommunicationMessageId.CHILD_IFRAME_TO_PARENT_LOAD_PROGRESS,
            {
                progress: flashist_ChildIframeTotalLoadingProgress,
                total: 1
            }
        );
    },
    //


    // WAIT APPROVE from the parent-app
    activeWaitApprovesMapById: {},
    getIsActiveWaitApprove: (waitApproveId) => {
        let result = GameIframeCommunicationManager.activeWaitApprovesMapById[waitApproveId];
        if (!result && result !== false) {
            result = false;
            GameIframeCommunicationManager.activeWaitApprovesMapById[waitApproveId] = result;
        }

        return result;
    },
    setIsActiveWaitApprove: (waitApproveId, isActive) => {
        console.log("gameIframeCommunication | setIsActiveWaitApprove __ waitApproveId: ", waitApproveId, " | isActive: ", isActive);

        GameIframeCommunicationManager.activeWaitApprovesMapById[waitApproveId] = isActive;
    },

    waitApproveForNextLevel: async () => {
        return new Promise(
            (resolve) => {
                // If there is already active wait for an approval, then
                const isWaitApproveForNextLevel = GameIframeCommunicationManager.getIsActiveWaitApprove(WaitApproveId.NEXT_LEVEL);
                console.log("gameIframeCommunication | waitApproveForNextLevel __ isWaitApproveForNextLevel: ", isWaitApproveForNextLevel);
                if (isWaitApproveForNextLevel) {
                    resolve(false);

                } else {
                    GameIframeCommunicationManager.setIsActiveWaitApprove(WaitApproveId.NEXT_LEVEL, true);

                    // Waiting level-complete actions from the parent-app
                    IframeAppCommunicationMessageTools.addMessageCallbackOnce(
                        IframeAppCommunicationMessageId.PARENT_IFRAME_TO_CHILD_WAIT_APPROVE_RESULT,
                        (data) => {
                            if (data.data.approveId === WaitApproveId.NEXT_LEVEL) {
                                GameIframeCommunicationManager.setIsActiveWaitApprove(WaitApproveId.NEXT_LEVEL, false);

                                console.log("gameIframeCommunication | waitApproveForNextLevel __ IframeAppCommunicationMessageTools.addMessageCallbackOnce __ resolve(true)");
                                resolve(true);
                            }
                        }
                    );
                    IframeAppCommunicationMessageTools.sendMessageToParent(
                        IframeAppCommunicationMessageId.CHILD_IFRAME_TO_PARENT_WAIT_APPROVE,
                        {
                            approveId: WaitApproveId.NEXT_LEVEL
                        }
                    );
                }
            }
        );
    },

    waitApproveForRewarded: async () => {
        return new Promise(
            (resolve) => {
                // If there is already active wait for an approval, then
                const tempApproveId = WaitApproveId.REWARDED;
                const isWaitApproveForRewardedActive = GameIframeCommunicationManager.getIsActiveWaitApprove(tempApproveId);
                console.log("gameIframeCommunication | waitApproveForRewarded __ isWaitApproveForRewardedActive: ", isWaitApproveForRewardedActive);
                if (isWaitApproveForRewardedActive) {
                    resolve(false);

                } else {
                    GameIframeCommunicationManager.setIsActiveWaitApprove(tempApproveId, true);

                    IframeAppCommunicationMessageTools.addMessageCallbackOnce(
                        IframeAppCommunicationMessageId.PARENT_IFRAME_TO_CHILD_WAIT_APPROVE_RESULT,
                        (data) => {
                            if (data.data.approveId === tempApproveId) {
                                GameIframeCommunicationManager.setIsActiveWaitApprove(tempApproveId, false);

                                resolve(data.data.isRewarded);
                            }
                        }
                    );
                    IframeAppCommunicationMessageTools.sendMessageToParent(
                        IframeAppCommunicationMessageId.CHILD_IFRAME_TO_PARENT_WAIT_APPROVE,
                        {
                            approveId: tempApproveId
                        }
                    );
                }

            }
        );
    },

    setPlayerAppData: async (data) => {
        IframeAppCommunicationMessageTools.sendMessageToParent(
            IframeAppCommunicationMessageId.CHILD_IFRAME_TO_PARENT_SET_PLAYER_APP_DATA,
            data
        );
    },

    // TOTAL SCORE
    setTotalScore: (totalScore) => {
        console.log("Flashist Adaptation __ GameIframeCommunicationManager __ setTotalScore __ totalScore: ", totalScore);
        flashist_parentAppGlobalVars.totalScore = totalScore;

        GameIframeCommunicationManager.commitTotalScoreData();
    },
    increaseTotalScore: (totalScore) => {
        console.log("Flashist Adaptation __ GameIframeCommunicationManager __ increaseTotalScore __ totalScore: ", totalScore);
        if (!flashist_parentAppGlobalVars.totalScore) {
            flashist_parentAppGlobalVars.totalScore = 0;
        }
        // flashist_parentAppGlobalVars.totalScore += totalScore;
        const newTotalScore = flashist_parentAppGlobalVars.totalScore + totalScore;

        GameIframeCommunicationManager.setTotalScore(newTotalScore);
    },
    commitTotalScoreData: () => {
        IframeAppCommunicationMessageTools.sendMessageToParent(
            IframeAppCommunicationMessageId.CHILD_IFRAME_TO_PARENT_SET_TOTAL_SCORE,
            {
                score: flashist_parentAppGlobalVars.totalScore
            }
        );
    },

    sendLevelStartAnalyticsEvent: (levelId) => {
        console.log("FlashistAdaptation | GameIframeCommunicationManager __ sendLevelStartAnalyticsEvent __ levelId: ", levelId);

        const analyticsEventId = IframeAppAnalyticEvents.LEVEL_START_FIRST_PART + levelId;
        GameIframeCommunicationManager.sendAnalyticsEvent(analyticsEventId);
    },

    sendAnalyticsEvent: (eventId, value) => {
        console.log("FlashistAdaptation | GameIframeCommunicationManager __ sendAnalyticsEvent __ eventId: ", eventId, " | value: ", value);

        IframeAppCommunicationMessageTools.sendMessageToParent(
            IframeAppCommunicationMessageId.CHILD_IFRAME_TO_PARENT_ANALYTICS,
            {
                analyticEventId: eventId,
                value: value
            }
        );
    },
};
//
window.GameIframeCommunicationManager = GameIframeCommunicationManager;