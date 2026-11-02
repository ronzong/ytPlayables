// Debug

// YYGGames
window.flashist_scenesLoadedCountYYGGames = 0;
window.flashist_prevProcessedGold;
// Images Replacement
window.flashist_preparedBlobUrlsMapYYGGames = {};
window.flashist_imageReplacementMapYYGGames = {
    // "image/logo.png": "../assets/images/image-logo.png",
    // "res/atlas/UIRes/win.png": "../assets/images/res_atlas_UIRes_win.png",
    // "res/atlas/UIRes/baoxiang.png": "../assets/images/res-atlas_UIRes_baoxiang.png",
    // "res/atlas/UIRes/qiandao.png": "../assets/images/res-atlas_UIRes_qiandao.png",
    // "res/atlas/UIRes/repeat.png": "../assets/images/res-atlas_UIRes_repeat.png",
    // "res/atlas/UIRes/shiyong.png": "../assets/images/res-atlas_UIRes_shiyong.png",
    // "res/atlas/UIRes/shop.png": "../assets/images/res-atlas_UIRes_shop.png",
    // "res/atlas/image.png": "../assets/images/res-atlas-image.png",
    // "res/atlas/UIRes/add.png": "../assets/images/res-atlas-UIRes-add.png",
    // "res/atlas/UIRes/fail.png": "../assets/images/res-atlas-UIRes-fail.png",
    // "res/atlas/UIRes/main.png": "../assets/images/res-atlas-UIRes-main.png",
    // "res/atlas/UIRes/shop2.png": "../assets/images/res-atlas-UIRes-shop2.png",
    // "UIRes/fail/Image_fail_01.png": "../assets/images/UIRes-fail-Image_fail_01.png",
    // "UIRes/qiandao/image_qiandao_16.png": "../assets/images/UIRes-qiandao_image_qiandao_16.png",
    // "UIRes/shiyong/Image_tuisong_01.png": "../assets/images/UIRes-shiyong_Image_tuisong_01.png",
    // "UIRes/shop2/Image_shop2_01.png": "../assets/images/UIRes-shop2_Image_shop2_01.png",
    // "UIRes/win/Image_win_01.png": "../assets/images/UIRes-win-Image_win_01.png"
}

window.flashist_textReplaceConfigsYYGGames = [
    { search: "Level", replace: "Уровень" },
    { search: "Upgrade successfully", replace: "Улучшено" },
    { search: "Upgrade", replace: "Улуч." },
    { search: "HP", replace: "ЗД." },
    { search: "Signed", replace: "Получено" },
    { search: "Sign In Successfully", replace: "Получено" },
    { search: "Not enough coin", replace: "Не достаточно монет" },
    { search: "No Available Video", replace: "Видео недоступно" },
    { search: "No, thanks", replace: "Нет, спасибо" },
    { search: "You boy has some skills, even can chase me here!", replace: "Ты умеешь ездить!\nТы даже смог догнать меня!" },
    { search: "Claim Successfully", replace: "Получено" },
    { search: "Dude, you're good at chasing. You can even catch up with a plane!", replace: "Ого, ты - мастер в погонях.\nТы даже можешь догнать\nсамолет!" },
    { search: "Bro, you were speeding, safety first!", replace: "Превышение скорости.\nВам выписан штраф!" },
    { search: "Get 2000 coins", replace: "Получено 2000 монет!" }, 
];
window.flashist_textReplaceCacheYYGGames = [];
//
window.flashist_replaceTextYYGGames = (sourceText) => {
    let result = sourceText;

    if (result) {
        let shouldReplace = true;
        // If there is a cached version of the text, then use it without search
        if (window.flashist_textReplaceCacheYYGGames) {
            if (window.flashist_textReplaceCacheYYGGames[result]) {
                result = window.flashist_textReplaceCacheYYGGames[result];

                shouldReplace = false;
            }
        }

        if (shouldReplace) {
            if (window.flashist_textReplaceConfigsYYGGames) {
                let replaceConfigCount = window.flashist_textReplaceConfigsYYGGames.length;
                for (let replaceConfigIndex = 0; replaceConfigIndex < replaceConfigCount; replaceConfigIndex++) {
                    let tempReplaceConfig = window.flashist_textReplaceConfigsYYGGames[replaceConfigIndex];
                    if (result.indexOf(tempReplaceConfig.search) !== -1) {
                        result = result.replace(tempReplaceConfig.search, tempReplaceConfig.replace);

                        // Save the replaced version of the text into the cache
                        // to reuse it in the future without searching for the replacement
                        window.flashist_textReplaceCacheYYGGames[result] = result;
                    }
                }
            }
        }
    }

    return result;
}
//
var flashist_YYGGames_Instance;
var flashist_YYGGames_Proxy;
window.flashist_injectYYGGames = () => {
    if (!flashist_YYGGames_Instance) {
        if (window.YYGGames) {
            flashist_YYGGames_Instance = window.YYGGames;
            //
            flashist_YYGGames_Instance.gameBanner = {};
            flashist_YYGGames_Instance.gameBox = {
                game1: {},
                game2: {}
            };
            flashist_YYGGames_Instance.icon = {};
            flashist_YYGGames_Instance.showInterstitial = async (cb) => {
                console.log("Flashist Adaptation || showInterstitial");
                
                // Flashist Adaptation
                const isApproved = await GameIframeCommunicationManager.waitApproveForNextLevel();
                if (!isApproved) {
                    return;
                }
                
                cb();
            };
            flashist_YYGGames_Instance.rewardReady = true;
            //
            const proxyHandler = {
                get: (target, prop, receiver) => {
                    let result = Reflect.get(target, prop, receiver);

                    switch (prop) {
                        case 'rewardReady': 
                            // Make sure it's always true
                            result = true;
                            break;
                    }

                    return result;
                },
                // set: (target, property, value, receiver) => {
                //     switch (property) {
                //         case 'rewardReady': 
                //             // Make sure it's always true
                //             value = true;
                //             break;
                //     }

                //     target[property] = value;
                // },

                // apply: (target, thisArg, args) => {
                //     console.log("Flashist Adaptation || apply __ target: ", target, " | property: ", property, " | value: ", value, " | receiver: ", receiver);
                // }
            };
            flashist_YYGGames_Proxy = new Proxy(flashist_YYGGames_Instance, proxyHandler);
            //
            window.YYGGames = flashist_YYGGames_Proxy;
        }
    }
}
// Init at the beginning (later it will be re-inited)
// window.flashist_injectYYGGames();
                        
// // Debugging site-lock location change
// window.navigation.addEventListener("navigate", (event) => {
//     console.log('location changed!');
//     alert('location changed!');
//     debugger;
// });

// // Debugging console
// const sourceConsoleLog = console.log;
// console.log = (...args) => {
//     sourceConsoleLog.call(console, ...args)
// }

// // Debugging LocalStorage
// const localStorageSetItemSource = window.__ytStorage.setItem;
// window.__ytStorage.setItem = (...args) => {
//     console.log("Flashist Adaptation __ localSTorage.setItem ___ ...args: ", ...args);
//     localStorageSetItemSource.call(window.__ytStorage, ...args);
// }

// COCOS CREATE
//
// HELPER: ADVS
window.flashist_skipAdvOnce = false;
//
// HELPER: LOCALIZATION
window.flashist_filesToLocalize = [
    'assets/LY01_HDPP/import/12/12303f4e-d857-414b-9820-f0b90d511874.f6478.json',
    'assets/LY01_HDPP/native/f8/f8adfd34-d4c5-4cd2-a823-939527d14cfd.0c1a5.png',
    'assets/LY01_HDPP/native/e2/e216ded6-3ba6-47af-a7ca-dda953a52e3b.095b7.png'
];
window.flashist_getLocalizedFilePath = (sourceFilePath) => {
    let result = sourceFilePath;
    
    if (flashist_parentAppGlobalVars.language && flashist_parentAppGlobalVars.language != "en") {
        if (flashist_filesToLocalize.indexOf(result) != -1) {
            let splitFilePathItems = result.split(".");
            if (splitFilePathItems.length > 1) {
                let extensionPart = splitFilePathItems.pop();
                // Adding the language-localization part
                splitFilePathItems.push(flashist_parentAppGlobalVars.language);
                // Adding the extension part back
                splitFilePathItems.push(extensionPart);

                result = splitFilePathItems.join(".");
            }
        }
    }

    return result;
};
//
// HELPER: LOADING ALL FILES
//
// Setting up debug config and variables
window.flashist_assetIdsCollection = [];
window.flashist_saveAllLoadPathsList = [];
window.flashist_saveAllNotLoadedPathsList = [];
//
window.flashist_cocosCreator_showAllNotLoadedPathsList = () => {
    const notLoadedPathsListStringified = JSON.stringify(flashist_saveAllNotLoadedPathsList)
    console.log(notLoadedPathsListStringified);
}
//
// window.flashistAdaptation_debugPreventAllLoads = true;
window.flashistAdaptation_debugPreventAllLoads = false;
window.flashist_cocosCreator_loadAllAssetIdsCollection = () => {
    // var allAssetIds = [];
    // cc.resources.load("2d/ui/bubble/three fire_2");
    let idsCount = flashist_assetIdsCollection.length;
    console.log("Ids count: ", idsCount);
    for (let idIndex = 0; idIndex < idsCount; idIndex++) {
        let tempAssetData = flashist_assetIdsCollection[idIndex];
        let tempAssetId = tempAssetData[0];
        // console.log("pathIndex: ", pathIndex, " | tempPathUrl: ", tempPathUrl);

        cc.resources.load(tempAssetId);
    }

    //
    console.log("     ");
    console.log("ALL LOADING PATHS: START");
    console.log(JSON.stringify(window.flashist_saveAllLoadPathsList));
    console.log("ALL LOADING PATHS: END");
    console.log("     ");
    alert("ALL LOADING PATHS: END");
}

// Object.defineProperty(
//     window.location, 
//     'href', {
//     get() {
//       return "test";
//     },
  
//     set(value) {
//       alert("Flashist Adaptation __ href __ set __ value: ", value);
//     }
//   });
// const locationHandler = {
//     set(obj, prop, value) {
//         console.log("Flashist Adaptation __ href __ set __ prop: ", prop, " | value: ", value);
//         if (prop === 'href') {
//             alert("Flashist Adaptation __ href __ set __ value: " + value);
//         }

//         return Reflect.set(...arguments);
//     },

//     open: (...args) => {
//         alert("Flashist Adaptation __ open");
//     },
//     assign: (...args) => {
//         alert("Flashist Adaptation __ assign");
//     },
//     replace: (...args) => {
//         alert("Flashist Adaptation __ replace");
//     }
// };
// const windowLocationProxy = new Proxy(window.location, locationHandler);

// const documentHandler = {
//     set(obj, prop, value) {
//         console.log("Flashist Adaptation __ document __ set __ prop: ", prop, " | value: ", value);
//         if (prop === 'location') {
//             alert("Flashist Adaptation __ document.location __ set __ value: ", value);
//         }

//         return Reflect.set(...arguments);
//     }
// }
// const documentProxy = new Proxy(document, documentHandler);

// // Yizhiyuan Network Technology Co., Ltd.
// var idhb = {
//     debug: (...args) => {
//         console.log("Flashist Adaptation __ idhb.debug __ ...args: ", ...args);
//     },

//     getConfig: (...args) => {
//         alert("Flashist Adaptation __ idhb.getConfig __ NOT IMPLEMENTED! __ ...args: ", ...args);
//     },

//     setAdserverTargeting: (...args) => {
//         console.log("Flashist Adaptation __ idhb.setAdserverTargeting __ ...args: ", ...args);
//     },

//     allowPersonalizedAds: (...args) => {
//         console.log("Flashist Adaptation __ idhb.allowPersonalizedAds ___ ...args: ", ...args);
//     },

//     addEventListener: (...args) => {
//         console.log("Flashist Adaptation __ idhb.addEventListener ___ ...args: ", ...args);
//     },

//     requestAds: async (config, ...args) => {
//         console.log("Flashist Adaptation __ idhb.requestAds ___ config: ", config, " | ...args: ", ...args);

//         config.callback();
//     },

//     isLoaded: () => {
//         console.log("Flashist Adaptation __ idhb.isLoaded");
//         return true;
//     },

//     getAdserverTargetingForAdSlot: (...args) => {
//         console.log("Flashist Adaptation __ idhb.getAdserverTargetingForAdSlot ___ ...args: ", ...args);
//     }
// }
// //
// var google = {
//     ima: {
//         AdsRequest: function AdsRequest (...args) {
//             console.log("Flashist Adaptation __ google.ima.AdsRequest ___ ...args: ", ...args);
//         }
//     }
// };
// //
// var regeneratorRuntime;

// RavalMatic
// // ADS: START
// var consent = {
//     ConsentStatus: {
//         Ready: "ready",
//         Required: "required",
//         Unknown: "unknown"
//     },

//     requestInfoUpdate: () => {
//         return Promise.resolve();
//     },

//     getConsentStatus: () => {
//         return Promise.resolve(consent.ConsentStatus.Ready);
//     }
// };
// //
// const adTypes = {
//     FULLSCREEN: "fullscreen",
//     REWARDED: "rewarded"
// };
// var admobCreateAdObject = (id, config) => {
//     var eventDispatcher = new EventTarget();
//     return {
//         eventDispatcher,
//         config,

//         on: (...args) => {
//             console.log("AdObject || on __ id: ", id, " | ...args: ", ...args);
//             eventDispatcher.addEventListener.call(eventDispatcher, ...args);
//         },

//         load: () => {
//             // TODO: implement something
//             console.log("AdObject || load __ id: ", id);
//             eventDispatcher.dispatchEvent(new Event('load'));
//         },

//         show: async () => {
//             // TODO: implement something
//             console.log("AdObject || show __ id: ", id);

//             if (id === adTypes.FULLSCREEN) {
//                 eventDispatcher.dispatchEvent(new Event('show'));
//                 await GameIframeCommunicationManager.waitApproveForNextLevel()
//                     .then(
//                         () =>{
//                             eventDispatcher.dispatchEvent(new Event('dismiss'));
//                         }
//                     );

//             } else if (id === adTypes.REWARDED) {
//                 await GameIframeCommunicationManager.waitApproveForRewarded()
//                     .then(
//                         (rewarded) =>{
//                             eventDispatcher.dispatchEvent(new Event('impression'));
//                             if (rewarded) {
//                                 eventDispatcher.dispatchEvent(new Event('reward'));
//                             }
//                             eventDispatcher.dispatchEvent(new Event('dismiss'));
//                         }
//                     );
//             }
//         }
//     }
// }
// var admob = {
//     InterstitialAd: function (config) {
//         return admobCreateAdObject(adTypes.FULLSCREEN, config);
//     },

//     RewardedAd: function (config) {
//         return admobCreateAdObject(adTypes.REWARDED, config);
//     }
// };
// // ADS: END

// // IAP: START
// var CdvPurchase = {
//     store: {
//         initialize: () => {
//             console.log("CdvPurchase || initialize");
//         },
        
//         ready: (callback, ...args) => {
//             console.log("CdvPurchase || ready __ callback: ", callback, " | ...args: ", ...args);
//             callback();
//         },

//         update: () => {
//             console.log("CdvPurchase || update");
//         },

//         restorePurchases: () => {
//             console.log("CdvPurchase || restorePurchases");
//         },

//         register: (...args) => {
//             console.log("CdvPurchase || register __ ...args: ", ...args);
//         },

//         when: () => {
//             return CdvPurchase.store;
//         },

//         approved: (callback, ...args) => {
//             console.log("CdvPurchase || approved __ callback: ", callback, " | ...args: ", ...args);
//             return CdvPurchase.store;
//         },
//         productUpdated: (callback, ...args) => {
//             console.log("CdvPurchase || approved __ callback: ", callback, " | ...args: ", ...args);
//             return CdvPurchase.store;
//         }
//     }
// };
// // IAP: END

// // GAME CENTER (?): START
// var game = {
//     _loggedin: false,

//     isLoggedIn: () => {
//         return game._loggedin;
//     },
//     setUp: () => {
// 		// TODO: do something
//     },
// 	login: (tag) => {
//         // TODO: do something
//         game._loggedin = true;
//     },

//     unlockAchievement: () => {
//         // TODO: do something
//     },

//     incrementAchievement(){
//         // TODO: do something
//     }
// }
// // GAME CENTER (?): END