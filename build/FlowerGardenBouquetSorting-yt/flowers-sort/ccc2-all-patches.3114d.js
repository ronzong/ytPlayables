// 请在 index.795c4.html 中，加载完 main.c692a.js 脚本之后，加载此脚本
/*
<script src="main.c692a.js" charset="utf-8"></script>
<script src="ccc2-all-patches.7224d.js" charset="utf-8"></script>
*/

(function() {

    if (!window.yyrt) {
        return;
    }
    
    function applyDisableCocosImageCachePatch() {
        cc.macro.CLEANUP_IMAGE_CACHE = true;
    
        let oldTexture2DClearImage = cc.Texture2D.prototype._clearImage;
    
        cc.Texture2D.prototype._clearImage = function() {
            oldTexture2DClearImage.apply(this, arguments);
    
            this._image = null;
        };
    }
    
    function applySetAnimFrame() {
        var oldSetAnimFrame = cc.game._setAnimFrame;
        cc.game._setAnimFrame = function() {
            oldSetAnimFrame.apply(this, arguments);
            var frameRate = cc.game.config.frameRate;
            this._frameTime = 1000 / frameRate;
            cc.director._maxParticleDeltaTime = this._frameTime / 1000 * 2;
        };
    }
    
    function applyTexture2DNativeAsset() {
        console.log('applyTexture2DNativeAsset');
        Object.defineProperty(cc.Texture2D.prototype, '_nativeAsset', {
            get: function get() {
                return this._image;
            },
            set: function set(data) {
                if (data instanceof HTMLImageElement) {
                   this.initWithElement(data);
                   return;
                }
                data._data ? this.initWithData(data._data, this._format, data.width, data.height) : this.initWithElement(data);
            },
    
            configurable: true,
            enumerable: true,
            override: true
        });
    }
    
    function applyCanvasContextDefaultTextBaseline() {
        var descWidth = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'width');
        var descHeight = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'height');
    
        // console.log(`cjh descWidth: ${descWidth.set}`);
    
        var oldSetWidth = descWidth.set;
        descWidth.set = function(value) {
            oldSetWidth.call(this, value);
            if (this._context2D) {
                this._context2D.textBaseline = "alphabetic";
            }
        };
    
        var oldSetHeight = descHeight.set;
        descHeight.set = function(value) {
            oldSetHeight.call(this, value);
            if (this._context2D) {
                this._context2D.textBaseline = "alphabetic";
            }
        };
    
        Object.defineProperty(HTMLCanvasElement.prototype, 'width', descWidth);
        Object.defineProperty(HTMLCanvasElement.prototype, 'height', descHeight);
    }
    
    var cccVersionInfo = {
        majorVersion: 0,
        featureVersion: 0,
        patchVersion: 0
    };
    
    var runtimeVersionInfo = {
        majorVersion: 0,
        featureVersion: 0,
        patchVersion: 0
    };
    
    function needPatchForVersionsLessThan(versionInfo, mV, fV, pV) {
        if (versionInfo.majorVersion < mV) {
            return true;
        }
        else if (versionInfo.majorVersion > mV) {
            return false;
        }
    
        if (versionInfo.featureVersion < fV) {
            return true;
        }
        else if (versionInfo.featureVersion > fV) {
            return false;
        }
    
        if (versionInfo.patchVersion < pV) {
            return true;
        }
    
        return false;
    }
    
    function checkCCCVersion() {
        console.log('CCC version: ' + cc.ENGINE_VERSION);
        var versionArr = cc.ENGINE_VERSION.split('.');
        if (!versionArr || versionArr.length !== 3) {
            console.error('Wrong CCC version: ' + version);
            return;
        }
    
        cccVersionInfo.majorVersion = parseInt(versionArr[0]);
        cccVersionInfo.featureVersion = parseInt(versionArr[1]);
        cccVersionInfo.patchVersion = parseInt(versionArr[2]);
    }
    
    function checkRuntimeVersion() {
        var version = yyrt.getRuntimeVersion();
        console.log('Runtime version: ' + version);
        var versionArr = version.split('.');
        if (!versionArr || versionArr.length !== 3) {
            console.error('Wrong runtime version: ' + version);
            return;
        }
    
        runtimeVersionInfo.majorVersion = parseInt(versionArr[0]);
        runtimeVersionInfo.featureVersion = parseInt(versionArr[1]);
        runtimeVersionInfo.patchVersion = parseInt(versionArr[2]);
    }
    
    var oldBoot = window.boot;
    
    window.boot = function() {
        checkRuntimeVersion();
        checkCCCVersion();
        applyDisableCocosImageCachePatch();
        applySetAnimFrame();
        if (!needPatchForVersionsLessThan(cccVersionInfo, 2, 4, 0)) {
            applyTexture2DNativeAsset();
        }
    
        if (needPatchForVersionsLessThan(runtimeVersionInfo, 3, 5, 13)) {
            applyCanvasContextDefaultTextBaseline();
        }
    
        oldBoot.apply(this, arguments);
    }
    
    })();
    