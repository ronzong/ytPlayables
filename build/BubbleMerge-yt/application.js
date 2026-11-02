System.register([], function (_export, _context) {
  "use strict";

  var Application, cc, preinit;
  _export("Application", void 0);
  return {
    setters: [],
    execute: function () {
      preinit = window['__preinit'] ? window['__preinit']() : Promise.resolve();
      _export("Application", Application = class Application {
        constructor() {
          this.settingsPath = 'src/settings.json';
          this.showFPS = false;
        }
        init(engine) {
          cc = engine;
          cc.game.onPostBaseInitDelegate.add(this.onPostInitBase.bind(this));
          cc.game.onPostSubsystemInitDelegate.add(this.onPostSystemInit.bind(this));
        }
        onPostInitBase() {
          const {
            buildEnv
          } = window || {};
          const {
            webSdk,
            staticUrl,
            ccSettings
          } = buildEnv || {};
          const {
            launch,
            screen,
            blobImages
          } = ccSettings || {};
          const launchScene = launch?.launchScene;
          if (launchScene) {
            cc.settings.overrideSettings('launch', 'launchScene', launchScene);
          }
          if (blobImages) {
            cc.assetManager.allowImageBitmap = true;
          }
          cc.settings.overrideSettings('screen', 'exactFitScreen', false);
          if (staticUrl !== undefined) {
            cc.settings.overrideSettings('assets', 'server', staticUrl);
          }
        }
        onPostSystemInit() {
          function bannerHeight() {
            const h = getComputedStyle(document.documentElement).getPropertyValue('--banner-h').trim(); // e.g. "50px"
            return parseFloat(h) || 0; // returns 50 (number)
          }

          function usableHeight() {
            return document.body.classList.contains('with-banner') ? window.innerHeight - bannerHeight() : window.innerHeight;
          }
          function onResize() {
            const dpr = cc.screen.devicePixelRatio;
            const drawW = Math.round(window.innerWidth * dpr);
            const drawH = Math.round(usableHeight() * dpr);
            cc.screen.windowSize = new cc.Size(drawW, drawH);
          }

          /* ---- boot-time --------------------------------------------------- */
          cc.view.resizeWithBrowserSize(true);
          //cc.view.setResolutionPolicy(cc.ResolutionPolicy.NO_BORDER);

          onResize();
          window.addEventListener('resize', onResize);
          window.addEventListener('orientationchange', onResize);
          window.showBanner = () => {
            document.body.classList.add('with-banner');
            onResize();
          };
          window.hideBanner = () => {
            document.body.classList.remove('with-banner');
            onResize();
          };
        }
        startInternal() {
          if (true) {
            try {
              const consoleKey = '___console';
              let localStorageHasKey = false;
              let sessionStorageHasKey = false;
              try {
                localStorageHasKey = window.localStorage && window.localStorage.getItem(consoleKey) === consoleKey;
              } catch (e) {
                console.error("An error occurred while read key from localStorage: ", e.message);
              }
              try {
                sessionStorageHasKey = window.sessionStorage && window.sessionStorage.getItem(consoleKey) === consoleKey;
              } catch (e) {
                console.error("An error occurred while read key from sessionStorage: ", e.message);
              }
              if (localStorageHasKey || sessionStorageHasKey) {
                console.log("console enabled");
                console.disable = () => {
                  console.warn("console will be disabled after page refresh");
                  try {
                    if (localStorageHasKey && window.localStorage) {
                      window.localStorage.removeItem(consoleKey);
                    }
                    if (sessionStorageHasKey && window.sessionStorage) {
                      window.sessionStorage.removeItem(consoleKey);
                    }
                  } catch (e) {
                    console.error("An error occurred while removing key from storage: ", e.message);
                  }
                };
              } else {
                console.log("console disabled");
                if (!window.console) window.console = {};
                var methods = ["log", "info", "debug", "time", "timeEnd"];
                for (var i = 0; i < methods.length; i++) {
                  console[methods[i]] = function () {};
                }
                console.enable = () => {
                  console.warn("console will be enable after page refresh");
                  try {
                    if (window.localStorage) {
                      window.localStorage.setItem(consoleKey, consoleKey);
                    }
                    if (window.sessionStorage) {
                      window.sessionStorage.setItem(consoleKey, consoleKey);
                    }
                  } catch (e) {
                    console.error("An error occurred while adding key to storage: ", e.message);
                  }
                };
              }
            } catch (e) {
              // Fallback, disable all
              var methods = ["log", "info", "debug", "time", "timeEnd"];
              for (var i = 0; i < methods.length; i++) {
                console[methods[i]] = function () {};
              }
              console.error("An error occurred while accessing localStorage: ", e.message);
            }
          }
          preinit.then(() => {
            return cc.game.init({
              debugMode: false ? cc.DebugMode.INFO : cc.DebugMode.ERROR,
              settingsPath: this.settingsPath,
              overrideSettings: {
                profiling: {
                  showFPS: this.showFPS
                }
              }
            }).then(() => cc.game.run());
          }).catch(error => {
            console.error("Error during preinit or game initialization:", error);
          });
        }
        start() {
          this.startInternal();
        }
      });
    }
  };
});
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="b878b7f9-b890-538a-b0be-7f3000604fad")}catch(e){}}();
//# debugId=b878b7f9-b890-538a-b0be-7f3000604fad
