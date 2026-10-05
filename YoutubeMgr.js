// YoutubeMgr.js - Cocos Creator 2.4.15 版本
const { ccclass } = cc._decorator;


/**
 * YouTube Playables 管理类
 *
 * 覆盖官方要求的“必接”与“推荐接入”能力：
 *   必接：ytgame.game.firstFrameReady / gameReady、ytgame.IN_PLAYABLES_ENV、
 *        ytgame.system.isAudioEnabled / onAudioEnabledChange / onPause / onResume、
 *        ytgame.game.loadData / saveData
 *   推荐：ytgame.system.getLanguage、ytgame.engagement.sendScore、ytgame.engagement.openYTContent、
 *        ytgame.health.logError / logWarning、ytgame.ads.requestInterstitialAd / requestRewardedAd
 *
 * 注意：SDK（https://www.youtube.com/game_api/v1）必须是 index.html 的第一个 <script>，
 * 不能带 async/defer，否则测试套件的 “SDK loaded before any game code” 会判不通过。
 */
export default class YoutubeMgr {
    
    static storageData = {};
    static SetMusic=null;

    static _uData;

    /** 当前是否处于暂停状态（SDK onPause/onResume 驱动） */
    static _paused = false;
    /** YouTube 侧音频是否开启（用于恢复正常时决定要不要接回声音） */
    static _audioEnabled = true;
    /** 暂停时是否真的把引擎主循环停了（防止重复调用） */
    static _inputGateInstalled = false;
    
    
    /**
     * 检查是否为 YouTube 环境
     * @returns {boolean}
     */
    static isYoutube() {
        return YoutubeMgr.getYtGame() !== null;
    }
    /**
     * 安全获取 ytgame 对象（防止直接访问 window.ytgame 报错）
     */
    static getYtGame() {
        if (typeof window !== 'undefined' && window['ytgame']) {
            return window['ytgame'];
        }
        return null;
    }

    /**
     * 是否真的运行在 YouTube Playables 环境里（用于区分“加载了 SDK”与“在平台上跑”）
     * @returns {boolean}
     */
    static isInPlayables() {
        var ytgame = YoutubeMgr.getYtGame();
        return !!(ytgame && ytgame.IN_PLAYABLES_ENV);
    }

    /**
     * SDK 版本号（排查线上问题时打日志用）
     * @returns {string}
     */
    static getSdkVersion() {
        var ytgame = YoutubeMgr.getYtGame();
        return (ytgame && ytgame.SDK_VERSION) || '';
    }
    /**
     * 初始化
     */
    static Init() {
        var ytgame = YoutubeMgr.getYtGame();
        if (!ytgame) {
            // cc.log('YoutubeMgr: ytgame not found, running outside Playables environment.');
            return;
        }
        cc.log("YoutubeMgr Init");

        // 认证要求：暂停/恢复只能走 SDK 的 onPause/onResume，
        // 不得使用 Page Visibility API 或 blur/focus 之类的“类似 Web API”。
        // 引擎和游戏自己注册的这类监听在这里统一拦掉（必须在引擎启动后、游戏逻辑前执行）。
        YoutubeMgr.blockVisibilityPause();
        
        try {
            ytgame.game.firstFrameReady();
            
            ytgame.system.onPause(function() {
                YoutubeMgr.pauseGame();
            });
            
            ytgame.system.onResume(function() {
                YoutubeMgr.resumeGame();
            });
        } catch (e) {
            cc.error("YoutubeMgr Init error:", e);
        }
    }

    /**
     * 屏蔽 visibilitychange / pagehide / pageshow / blur / focus 的注册，
     * 并把 document.hidden / visibilityState 固定为“可见”，
     * 保证暂停与恢复只有 SDK onPause/onResume 一条通路。
     */
    static blockVisibilityPause() {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;
        if (YoutubeMgr._visibilityBlocked) return;
        YoutubeMgr._visibilityBlocked = true;
        var blocked = {
            visibilitychange: 1, mozvisibilitychange: 1, msvisibilitychange: 1,
            webkitvisibilitychange: 1, qbrowservisibilitychange: 1,
            pagehide: 1, pageshow: 1, blur: 1, focus: 1
        };
        [window, document].forEach(function (target) {
            var original = target.addEventListener;
            if (typeof original !== 'function') return;
            target.addEventListener = function (type, listener, options) {
                if (blocked[String(type).toLowerCase()]) return;
                return original.apply(this, arguments);
            };
        });
        try {
            Object.defineProperty(document, 'hidden', { configurable: true, get: function () { return false; } });
        } catch (e) { /* ignore */ }
        try {
            Object.defineProperty(document, 'visibilityState', { configurable: true, get: function () { return 'visible'; } });
        } catch (e) { /* ignore */ }
    }

    /**
     * 暂停游戏：认证要求“停掉一切执行”——gameplay / 音乐 / 交互 / 渲染。
     * 1) cc.game.pause() 停 Cocos 主循环（update、schedule、渲染一起停）
     * 2) 暂停当前音乐与所有音效（恢复时按 _audioEnabled 决定是否接回）
     * 3) 捕获阶段拦下指针/键盘事件，游戏收不到输入
     */
    static pauseGame() {
        if (YoutubeMgr._paused) return;
        YoutubeMgr._paused = true;
        cc.log("YoutubeMgr: pauseGame");
        try { cc.game.pause(); } catch (e) { cc.error('pause error', e); }
        try {
            cc.audioEngine.pauseMusic();
            cc.audioEngine.pauseAllEffects();
        } catch (e) { /* 部分工程没有音频模块 */ }
        YoutubeMgr.setInputBlocked(true);
    }

    /**
     * 恢复游戏：先放输入与音频，再恢复主循环。
     */
    static resumeGame() {
        if (!YoutubeMgr._paused) return;
        YoutubeMgr._paused = false;
        cc.log("YoutubeMgr: resumeGame");
        YoutubeMgr.setInputBlocked(false);
        if (YoutubeMgr._audioEnabled) {
            try {
                cc.audioEngine.resumeMusic();
                cc.audioEngine.resumeAllEffects();
            } catch (e) { /* ignore */ }
        }
        try { cc.game.resume(); } catch (e) { cc.error('resume error', e); }
    }

    /**
     * 暂停时拦截输入事件（只阻断事件继续传给游戏，不影响其它脚本）
     * @param {boolean} blocked
     */
    static setInputBlocked(blocked) {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;
        if (!YoutubeMgr._inputGateInstalled) {
            YoutubeMgr._inputGateInstalled = true;
            YoutubeMgr._blockInput = function (e) {
                if (!YoutubeMgr._paused) return;
                e.stopImmediatePropagation();
                e.stopPropagation();
            };
            var events = ['pointerdown', 'pointermove', 'pointerup', 'pointercancel',
                'mousedown', 'mouseup', 'mousemove', 'click', 'touchstart', 'touchmove',
                'touchend', 'touchcancel', 'wheel', 'keydown', 'keyup', 'keypress'];
            for (var i = 0; i < events.length; i++) {
                var opt = { capture: true, passive: true };
                window.addEventListener(events[i], YoutubeMgr._blockInput, opt);
                document.addEventListener(events[i], YoutubeMgr._blockInput, opt);
            }
        }
    }
    /**
     * 初始化音频
     */
    static InitAudio() {
        var ytgame = YoutubeMgr.getYtGame();
        if (!ytgame) return;
        
        try {
            var self = this;
            ytgame.system.onAudioEnabledChange(function(enabled) {
                cc.log("-----onAudioEnabledChange:" + enabled);
                self.SetAudio(enabled);
            });
            this.SetAudio(ytgame.system.isAudioEnabled());
        } catch (e) {
            cc.error("YoutubeMgr InitAudio error:", e);
        }
    }


    /**
     * 游戏准备就绪
     */
    static gameReady() {
        var ytgame = YoutubeMgr.getYtGame();
        if (!ytgame) return;
        
        try {
            ytgame.game.gameReady();
        } catch (e) {
            cc.error("YoutubeMgr gameReady error:", e);
        }
    }

    /**
     * 设置音频开关
     * @param {boolean} enabled 
     */
    static SetAudio(enabled) {
        YoutubeMgr._audioEnabled = !!enabled;
        if(this._uData==null){
            cc.error("SetAudio error 1112");
            return
        }
        cc.error("SetAudio error 333344444:"+enabled+"  1bgmVolume:"+this._uData.getSetting().bgmVolume);
         this._uData.setSetting({effectSound: enabled});
        this._uData.setSetting({bgmSound: enabled});
        if(enabled){
            // cc.audioEngine.resumeMusic();
            // setTimeout(() => {
            //     cc.audioEngine.setMusicVolume(this._uData.getSetting().bgmVolume);
            // }, 0);
            window["GameSound"].playBGM();
            cc.audioEngine.resumeAllEffects();
            
        }else{
            window["GameSound"].stopBGM();
            //cc.audioEngine.setMusicVolume(0);
            cc.audioEngine.stopAllEffects();
        }
       
    }
    
    /**
     * 显示插屏广告
     * @param {Function} cb - 回调函数
     */
    static showInterstitial(cb) {
        var ytgame = YoutubeMgr.getYtGame();
        if (!ytgame) {
            if (cb) cb(false);
            return;
        }
        
        try {
            ytgame.ads.requestInterstitialAd().then(function() {
                if (cb) cb(true);
            }).catch(function() {
                if (cb) cb(true);
            });
        } catch (e) {
            if (cb) cb(false);
        }
    }

    /**
     * 显示激励广告（YouTube Playables 现在已支持）
     *
     * @param {string} rewardId 奖励 ID。同一种奖励必须始终使用同一个 ID，且不能包含任何用户数据，
     *                          例如 "revive-by-ad"、"100-coins" 或 UUID。
     * @param {Function} complete 回调：complete(rewarded:boolean, error)
     *
     * 与插屏广告的关键区别：
     *   requestRewardedAd(rewardId) 返回 Promise<boolean>
     *     resolve(true)  -> 用户满足获得奖励的条件，应当发奖
     *     resolve(false) -> 用户中途关闭或未满足条件，不发奖，且这不算错误
     *     reject         -> 请求失败（无填充、接口不可用等），不发奖
     *   只有 resolve(true) 才能发奖，其它情况一律不发。
     */
    static showRewardedAd(rewardId, complete) {
        var ytgame = YoutubeMgr.getYtGame();
        if (!ytgame || !ytgame.ads || typeof ytgame.ads.requestRewardedAd !== 'function') {
            if (complete) complete(false, new Error('Playables 激励广告接口不可用'));
            return;
        }
        if (!rewardId) {
            if (complete) complete(false, new Error('rewardId 不能为空'));
            return;
        }
        try {
            ytgame.ads.requestRewardedAd(rewardId).then(function(rewarded) {
                if (complete) complete(!!rewarded, null);
            }).catch(function(error) {
                cc.error('showRewardedAd 失败:', error);
                if (complete) complete(false, error);
            });
        } catch (e) {
            cc.error('showRewardedAd 异常:', e);
            if (complete) complete(false, e);
        }
    }

    /**
     * 读取用户语言（推荐）
     * 官方要求：不要用 navigator.language，也不要把语言存进云存档，一律用这个接口。
     * @returns {Promise<string>} 例如 "en-US"、"zh-CN"
     */
    static getLanguage() {
        var ytgame = YoutubeMgr.getYtGame();
        if (!ytgame || !ytgame.system || typeof ytgame.system.getLanguage !== 'function') {
            return Promise.resolve((typeof navigator !== 'undefined' && navigator.language) || 'en');
        }
        return ytgame.system.getLanguage().catch(function() {
            return (typeof navigator !== 'undefined' && navigator.language) || 'en';
        });
    }

    /**
     * 打开 YouTube 视频或另一个 Playable（推荐）
     * @param {string} id 视频 ID（11 位）或 Playable ID
     * @param {boolean} [isPlayable] true 表示 id 是 Playable
     */
    static openYTContent(id, isPlayable) {
        var ytgame = YoutubeMgr.getYtGame();
        if (!ytgame || !ytgame.engagement || typeof ytgame.engagement.openYTContent !== 'function') {
            return Promise.resolve();
        }
        var contentType = (ytgame.engagement.ContentType && ytgame.engagement.ContentType.PLAYABLE) || 1;
        return ytgame.engagement.openYTContent({
            id: id,
            contentType: isPlayable ? contentType : undefined
        }).catch(function(error) {
            cc.error('openYTContent 失败:', error);
        });
    }

    /**
     * 向 YouTube 上报错误 / 警告（推荐，便于线上定位问题；接口有频控，别刷日志）
     */
    static logError() {
        var ytgame = YoutubeMgr.getYtGame();
        if (ytgame && ytgame.health && typeof ytgame.health.logError === 'function') {
            try { ytgame.health.logError(); } catch (e) { /* ignore */ }
        }
    }

    /**
     * 向 YouTube 上报警告（推荐）
     */
    static logWarning() {
        var ytgame = YoutubeMgr.getYtGame();
        if (ytgame && ytgame.health && typeof ytgame.health.logWarning === 'function') {
            try { ytgame.health.logWarning(); } catch (e) { /* ignore */ }
        }
    }

    /**
     * 上报分数
     *
     * 官方要求：分数必须是整数且不能超过 Number.MAX_SAFE_INTEGER，
     * 否则 SDK 会直接抛错；这里先取整再上报。
     * @param {number} score 
     */
    static onScoreAwarded(score) {
        var ytgame = YoutubeMgr.getYtGame();
        if (!ytgame) return;
        var value = Math.round(Number(score) || 0);
        if (!Number.isSafeInteger(value) || value < 0) {
            cc.error('onScoreAwarded: 分数必须是 0 ~ MAX_SAFE_INTEGER 的整数，收到 ' + score);
            return;
        }
        try {
            ytgame.engagement.sendScore({ value: value }).catch(function(error) {
                cc.error('onScoreAwarded 上报失败:', error);
            });
        } catch (e) {
            cc.error('onScoreAwarded error', e);
        }
    }

    /**
     * 保存存档
     * @param {string} dataStr 
     */
    static saveData(dataStr) {
        var ytgame = YoutubeMgr.getYtGame();
        if (!ytgame) return;
        // cc.error("保存存档 saveData:"+dataStr);
        try {
            ytgame.game.saveData(dataStr);
        } catch (error) {
            cc.log("保存数据失败：" + error);
        }
    }

    /**
     * 读取存档
     * @param {Function} complete - 完成回调
     */
    static loadData(complete) {
        cc.error("开始读取数据11111");
        var ytgame = YoutubeMgr.getYtGame();
        if (!ytgame) {
            if (complete) complete();
            return;
        }
        
        cc.error("开始读取数据222");
        var self = this;
        try {
            ytgame.game.loadData().then(function(data) {
                if (data) {
                    cc.error("读取数据成功：" + data);
                    try {
                        YoutubeMgr.storageData = JSON.parse(data);
                    } catch (e) {
                        cc.error("解析数据失败:", e);
                        YoutubeMgr.storageData = {};
                    }
                }
                YoutubeMgr.gameReady();
                if (complete) complete();
            }).catch(function(error) {
                cc.error("读取数据失败：" + error);
                if (complete) complete();
            });
        } catch (error) {
            cc.error("读取数据异常：" + error);
            if (complete) complete();
        }
    }

    /**
     * 获取存储项
     * @param {string} key 
     * @param {*} defaultData 
     * @returns {*}
     */
    static getItem(key, defaultData) {
        if (this.isYoutube()) {
            if (!(key in this.storageData)) {
                return defaultData;
            }
            try {
                return JSON.parse(this.storageData[key]);
            } catch (e) {
                return this.storageData[key];
            }
        }
        return cc.sys.localStorage.getItem(key);
    }

    /**
     * 设置存储项
     * @param {string} key 
     * @param {*} value 
     */
    static setItem(key, value) {
        if (this.isYoutube()) {
            this.storageData[key] = JSON.stringify(value + "");
            this.saveData(JSON.stringify(this.storageData));
            return;
        }
        cc.sys.localStorage.setItem(key, value);
    }

    /**
     * 移除存储项
     * @param {string} key 
     */
    static removeItem(key) {
        if (this.isYoutube()) {
            delete this.storageData[key];
            this.saveData(JSON.stringify(this.storageData));
            return;
        }
        cc.sys.localStorage.removeItem(key);
    }

    /**
     * 清空存储
     */
    static clear() {
        if (this.isYoutube()) {
            this.storageData = {};
            this.saveData(JSON.stringify(this.storageData));
            return;
        }
        cc.sys.localStorage.clear();
    }

    /**
     * 显示视频
     */
    static showVideo() {
        var ytgame = YoutubeMgr.getYtGame();
        if (!ytgame) return;
        
        try {
            ytgame.engagement.openYTContent({ id: "8xBPs_CWVCQ" }).then(function() {
                cc.log("showVideo 成功");
            }).catch(function(error) {
                cc.log("showVideo 失败：" + error);
            });
        } catch (error) {
            cc.log("showVideo 异常：" + error);
        }
    }
}
