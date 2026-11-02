function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

window.wxMiniGame = function (exports, Laya) {
  'use strict';

  function ImageDataPolyfill() {
    var width, height, data;

    if (arguments.length == 3) {
      if (arguments[0] instanceof Uint8ClampedArray) {
        if (arguments[0].length % 4 !== 0) {
          throw new Error("Failed to construct 'ImageData': The input data length is not a multiple of 4.");
        }

        if (arguments[0].length !== arguments[1] * arguments[2] * 4) {
          throw new Error("Failed to construct 'ImageData': The input data length is not equal to (4 * width * height).");
        } else {
          data = arguments[0];
          width = arguments[1];
          height = arguments[2];
        }
      } else {
        throw new Error("Failed to construct 'ImageData': parameter 1 is not of type 'Uint8ClampedArray'.");
      }
    } else if (arguments.length == 2) {
      width = arguments[0];
      height = arguments[1];
      data = new Uint8ClampedArray(arguments[0] * arguments[1] * 4);
    } else if (arguments.length < 2) {
      throw new Error("Failed to construct 'ImageData': 2 arguments required, but only " + arguments.length + " present.");
    }

    var imgdata = Laya.Browser.canvas.getContext("2d").getImageData(0, 0, width, height);

    for (var i = 0; i < data.length; i += 4) {
      imgdata.data[i] = data[i];
      imgdata.data[i + 1] = data[i + 1];
      imgdata.data[i + 2] = data[i + 2];
      imgdata.data[i + 3] = data[i + 3];
    }

    return imgdata;
  }

  var MiniFileMgr = /*#__PURE__*/function () {
    function MiniFileMgr() {
      _classCallCheck(this, MiniFileMgr);
    }

    _createClass(MiniFileMgr, null, [{
      key: "isLocalNativeFile",
      value: function isLocalNativeFile(url) {
        for (var i = 0, sz = MiniAdpter.nativefiles.length; i < sz; i++) {
          if (url.indexOf(MiniAdpter.nativefiles[i]) != -1) return true;
        }

        return false;
      }
    }, {
      key: "isLocalNativeZipFile",
      value: function isLocalNativeZipFile(url) {
        for (var i = 0, sz = MiniAdpter.nativezipfiles.length; i < sz; i++) {
          if (url.indexOf(MiniAdpter.nativezipfiles[i]) != -1) return true;
        }

        return false;
      }
    }, {
      key: "isNetFile",
      value: function isNetFile(url) {
        return (url.indexOf("http://") != -1 || url.indexOf("https://") != -1) && url.indexOf(MiniAdpter.window.wx.env.USER_DATA_PATH) == -1;
      }
    }, {
      key: "getFileInfo",
      value: function getFileInfo(fileUrl) {
        var fileNativePath = fileUrl;
        var fileObj = MiniFileMgr.fakeObj[fileNativePath];
        if (fileObj == null) return null;else return fileObj;
      }
    }, {
      key: "read",
      value: function read(filePath) {
        var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "utf8";
        var callBack = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var readyUrl = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
        var isSaveFile = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
        var fileType = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : "";
        var fileUrl;

        if (readyUrl != "" && (readyUrl.indexOf("http://") != -1 || readyUrl.indexOf("https://") != -1)) {
          fileUrl = MiniFileMgr.getFileNativePath(filePath);
        } else {
          fileUrl = filePath;
        }

        fileUrl = Laya.URL.getAdptedFilePath(fileUrl);
        MiniFileMgr.fs.readFile({
          filePath: fileUrl,
          encoding: encoding,
          success: function success(data) {
            callBack != null && callBack.runWith([0, data]);
          },
          fail: function fail(data) {
            if (data && readyUrl != "") MiniFileMgr.downFiles(readyUrl, encoding, callBack, readyUrl, isSaveFile, fileType);else callBack != null && callBack.runWith([1]);
          }
        });
      }
    }, {
      key: "isFile",
      value: function isFile(url) {
        var stat;

        try {
          stat = MiniFileMgr.fs.statSync(url);
        } catch (err) {
          return false;
        }

        return stat.isFile();
      }
    }, {
      key: "downFiles",
      value: function downFiles(fileUrl) {
        var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "utf8";
        var callBack = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var readyUrl = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
        var isSaveFile = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
        var fileType = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : "";
        var isAutoClear = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : true;
        var downloadTask = MiniFileMgr.down({
          url: fileUrl,
          success: function success(data) {
            if (data.statusCode === 200) MiniFileMgr.readFile(data.tempFilePath, encoding, callBack, readyUrl, isSaveFile, fileType, isAutoClear);else if (data.statusCode === 403) {
              callBack != null && callBack.runWith([0, fileUrl]);
            } else {
              callBack != null && callBack.runWith([1, data]);
            }
          },
          fail: function fail(data) {
            callBack != null && callBack.runWith([1, data]);
          }
        });
        downloadTask.onProgressUpdate(function (data) {
          callBack != null && callBack.runWith([2, data.progress]);
        });
      }
    }, {
      key: "readFile",
      value: function readFile(filePath) {
        var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "utf8";
        var callBack = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var readyUrl = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
        var isSaveFile = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
        var fileType = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : "";
        var isAutoClear = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : true;
        filePath = Laya.URL.getAdptedFilePath(filePath);
        MiniFileMgr.fs.readFile({
          filePath: filePath,
          encoding: encoding,
          success: function success(data) {
            if ((filePath.indexOf("http://") != -1 || filePath.indexOf("https://") != -1) && filePath.indexOf(MiniAdpter.window.wx.env.USER_DATA_PATH) == -1) {
              if (MiniAdpter.AutoCacheDownFile || isSaveFile) {
                callBack != null && callBack.runWith([0, data]);
                MiniFileMgr.copyTOCache(filePath, readyUrl, null, encoding, isAutoClear);
              } else callBack != null && callBack.runWith([0, data]);
            } else callBack != null && callBack.runWith([0, data]);
          },
          fail: function fail(data) {
            if (data) callBack != null && callBack.runWith([1, data]);
          }
        });
      }
    }, {
      key: "downOtherFiles",
      value: function downOtherFiles(fileUrl) {
        var callBack = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var readyUrl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
        var isSaveFile = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
        var isAutoClear = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
        MiniFileMgr.down({
          url: fileUrl,
          success: function success(data) {
            if (data.statusCode === 200) {
              if ((MiniAdpter.autoCacheFile || isSaveFile) && readyUrl.indexOf("qlogo.cn") == -1 && readyUrl.indexOf(".php") == -1) {
                callBack != null && callBack.runWith([0, data.tempFilePath]);
                MiniFileMgr.copyTOCache(data.tempFilePath, readyUrl, null, "", isAutoClear);
              } else callBack != null && callBack.runWith([0, data.tempFilePath]);
            } else {
              callBack != null && callBack.runWith([1, data]);
            }
          },
          fail: function fail(data) {
            callBack != null && callBack.runWith([1, data]);
          }
        });
      }
    }, {
      key: "copyFile",
      value: function copyFile(src, dest) {
        var complete = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        MiniFileMgr.fs.copyFile({
          srcPath: src,
          destPath: dest,
          success: function success() {
            complete && complete.runWith(0);
          },
          fail: function fail(err) {
            complete && complete.runWith([1, err]);
          }
        });
      }
    }, {
      key: "downLoadFile",
      value: function downLoadFile(fileUrl) {
        var fileType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
        var callBack = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var encoding = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "utf8";

        if (window.navigator.userAgent.indexOf('MiniGame') < 0) {
          Laya.Laya.loader.load(fileUrl, callBack);
        } else {
          if (fileType == Laya.Loader.IMAGE || fileType == Laya.Loader.SOUND) MiniFileMgr.downOtherFiles(fileUrl, callBack, fileUrl, true, false);else MiniFileMgr.downFiles(fileUrl, encoding, callBack, fileUrl, true, fileType, false);
        }
      }
    }, {
      key: "copyTOCache",
      value: function copyTOCache(tempFilePath, readyUrl, callBack) {
        var encoding = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
        var isAutoClear = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
        var temp = tempFilePath.split("/");
        var tempFileName = temp[temp.length - 1];
        var fileurlkey = readyUrl;
        var fileObj = MiniFileMgr.getFileInfo(readyUrl);
        var saveFilePath = MiniFileMgr.getFileNativePath(tempFileName);
        MiniFileMgr.fakeObj[fileurlkey] = {
          md5: tempFileName,
          readyUrl: readyUrl,
          size: 0,
          times: Laya.Browser.now(),
          encoding: encoding,
          tempFilePath: tempFilePath
        };
        var totalSize = MiniAdpter.sizeLimit;
        var chaSize = 4 * 1024 * 1024;
        var fileUseSize = MiniFileMgr.getCacheUseSize();

        if (fileObj) {
          if (fileObj.readyUrl != readyUrl) {
            MiniFileMgr.fs.getFileInfo({
              filePath: tempFilePath,
              success: function success(data) {
                if (isAutoClear && fileUseSize + chaSize + data.size >= totalSize) {
                  if (data.size > MiniAdpter.minClearSize) MiniAdpter.minClearSize = data.size;
                  MiniFileMgr.onClearCacheRes();
                }

                MiniFileMgr.deleteFile(tempFilePath, readyUrl, callBack, encoding, data.size);
              },
              fail: function fail(data) {
                callBack != null && callBack.runWith([1, data]);
              }
            });
          } else callBack != null && callBack.runWith([0]);
        } else {
          MiniFileMgr.fs.getFileInfo({
            filePath: tempFilePath,
            success: function success(data) {
              if (isAutoClear && fileUseSize + chaSize + data.size >= totalSize) {
                if (data.size > MiniAdpter.minClearSize) MiniAdpter.minClearSize = data.size;
                MiniFileMgr.onClearCacheRes();
              }

              MiniFileMgr.fs.copyFile({
                srcPath: tempFilePath,
                destPath: saveFilePath,
                success: function success(data2) {
                  MiniFileMgr.onSaveFile(readyUrl, tempFileName, true, encoding, callBack, data.size);
                },
                fail: function fail(data) {
                  callBack != null && callBack.runWith([1, data]);
                }
              });
            },
            fail: function fail(data) {
              callBack != null && callBack.runWith([1, data]);
            }
          });
        }
      }
    }, {
      key: "onClearCacheRes",
      value: function onClearCacheRes() {
        var memSize = MiniAdpter.minClearSize;
        var tempFileListArr = [];

        for (var key in MiniFileMgr.filesListObj) {
          if (key != "fileUsedSize") tempFileListArr.push(MiniFileMgr.filesListObj[key]);
        }

        MiniFileMgr.sortOn(tempFileListArr, "times", MiniFileMgr.NUMERIC);
        var clearSize = 0;

        for (var i = 1, sz = tempFileListArr.length; i < sz; i++) {
          var fileObj = tempFileListArr[i];
          if (clearSize >= memSize) break;
          clearSize += fileObj.size;
          MiniFileMgr.deleteFile("", fileObj.readyUrl);
        }
      }
    }, {
      key: "sortOn",
      value: function sortOn(array, name) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        if (options == MiniFileMgr.NUMERIC) return array.sort(function (a, b) {
          return a[name] - b[name];
        });
        if (options == (MiniFileMgr.NUMERIC | MiniFileMgr.DESCENDING)) return array.sort(function (a, b) {
          return b[name] - a[name];
        });
        return array.sort(function (a, b) {
          return a[name] - b[name];
        });
      }
    }, {
      key: "getFileNativePath",
      value: function getFileNativePath(fileName) {
        return MiniFileMgr.fileNativeDir + "/" + fileName;
      }
    }, {
      key: "deleteFile",
      value: function deleteFile(tempFileName) {
        var readyUrl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
        var callBack = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var encoding = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
        var fileSize = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
        var fileObj = MiniFileMgr.getFileInfo(readyUrl);
        var deleteFileUrl = MiniFileMgr.getFileNativePath(fileObj.md5);
        MiniFileMgr.fs.unlink({
          filePath: deleteFileUrl,
          success: function success(data) {
            if (tempFileName != "") {
              var saveFilePath = MiniFileMgr.getFileNativePath(tempFileName);
              MiniFileMgr.fs.copyFile({
                srcPath: tempFileName,
                destPath: saveFilePath,
                success: function success(data) {
                  MiniFileMgr.onSaveFile(readyUrl, tempFileName, true, encoding, callBack, fileSize);
                },
                fail: function fail(data) {
                  callBack != null && callBack.runWith([1, data]);
                }
              });
            } else {
              MiniFileMgr.onSaveFile(readyUrl, tempFileName, false, encoding, callBack, fileSize);
            }
          },
          fail: function fail(data) {
            callBack != null && callBack.runWith([1, data]);
          }
        });

        if (readyUrl && readyUrl != "" && readyUrl.indexOf(".zip") != -1) {
          var nativepath = MiniAdpter.zipHeadFiles[readyUrl];

          if (nativepath) {
            try {
              MiniFileMgr.fs.rmdirSync(nativepath, true);
            } catch (e) {
              console.log("目录:" + nativepath + "delete fail");
              console.log(e);
            }
          }
        }
      }
    }, {
      key: "deleteAll",
      value: function deleteAll() {
        var tempFileListArr = [];

        for (var key in MiniFileMgr.filesListObj) {
          if (key != "fileUsedSize") tempFileListArr.push(MiniFileMgr.filesListObj[key]);
        }

        for (var i = 1, sz = tempFileListArr.length; i < sz; i++) {
          var fileObj = tempFileListArr[i];
          MiniFileMgr.deleteFile("", fileObj.readyUrl);
        }

        if (MiniFileMgr.filesListObj && MiniFileMgr.filesListObj.fileUsedSize) {
          MiniFileMgr.filesListObj.fileUsedSize = 0;
        }

        MiniFileMgr.writeFilesList("", JSON.stringify({}), false);
      }
    }, {
      key: "onSaveFile",
      value: function onSaveFile(readyUrl, md5Name) {
        var isAdd = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        var encoding = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
        var callBack = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
        var fileSize = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
        var fileurlkey = readyUrl;
        if (MiniFileMgr.filesListObj['fileUsedSize'] == null) MiniFileMgr.filesListObj['fileUsedSize'] = 0;

        if (isAdd) {
          var fileNativeName = MiniFileMgr.getFileNativePath(md5Name);
          MiniFileMgr.filesListObj[fileurlkey] = {
            md5: md5Name,
            readyUrl: readyUrl,
            size: fileSize,
            times: Laya.Browser.now(),
            encoding: encoding,
            tempFilePath: fileNativeName
          };
          MiniFileMgr.filesListObj['fileUsedSize'] = parseInt(MiniFileMgr.filesListObj['fileUsedSize']) + fileSize;
          MiniFileMgr.writeFilesList(fileurlkey, JSON.stringify(MiniFileMgr.filesListObj), true);
          callBack != null && callBack.runWith([0]);
        } else {
          if (MiniFileMgr.filesListObj[fileurlkey]) {
            var deletefileSize = parseInt(MiniFileMgr.filesListObj[fileurlkey].size);
            MiniFileMgr.filesListObj['fileUsedSize'] = parseInt(MiniFileMgr.filesListObj['fileUsedSize']) - deletefileSize;

            if (MiniFileMgr.fakeObj[fileurlkey].md5 == MiniFileMgr.filesListObj[fileurlkey].md5) {
              delete MiniFileMgr.fakeObj[fileurlkey];
            }

            delete MiniFileMgr.filesListObj[fileurlkey];
            MiniFileMgr.writeFilesList(fileurlkey, JSON.stringify(MiniFileMgr.filesListObj), false);
            callBack != null && callBack.runWith([0]);
          }
        }
      }
    }, {
      key: "writeFilesList",
      value: function writeFilesList(fileurlkey, filesListStr, isAdd) {
        var listFilesPath = MiniFileMgr.fileNativeDir + "/" + MiniFileMgr.fileListName;
        MiniFileMgr.fs.writeFile({
          filePath: listFilesPath,
          encoding: 'utf8',
          data: filesListStr,
          success: function success(data) {},
          fail: function fail(data) {}
        });

        if (!MiniAdpter.isZiYu && MiniAdpter.isPosMsgYu) {
          MiniAdpter.window.wx.postMessage({
            url: fileurlkey,
            data: MiniFileMgr.filesListObj[fileurlkey],
            isLoad: "filenative",
            isAdd: isAdd
          });
        }
      }
    }, {
      key: "getCacheUseSize",
      value: function getCacheUseSize() {
        if (MiniFileMgr.filesListObj && MiniFileMgr.filesListObj['fileUsedSize']) return MiniFileMgr.filesListObj['fileUsedSize'];
        return 0;
      }
    }, {
      key: "getCacheList",
      value: function getCacheList(dirPath, cb) {
        var stat;

        try {
          stat = MiniFileMgr.fs.statSync(dirPath);
        } catch (err) {
          stat = null;
        }

        if (stat) {
          MiniFileMgr.readSync(MiniFileMgr.fileListName, "utf8", cb);
        } else {
          MiniFileMgr.fs.mkdirSync(dirPath, true);
          cb && cb.runWith([1]);
        }
      }
    }, {
      key: "existDir",
      value: function existDir(dirPath, callBack) {
        MiniFileMgr.fs.mkdir({
          dirPath: dirPath,
          success: function success(data) {
            callBack != null && callBack.runWith([0, {
              data: JSON.stringify({})
            }]);
          },
          fail: function fail(data) {
            if (data.errMsg.indexOf("file already exists") != -1) MiniFileMgr.readSync(MiniFileMgr.fileListName, "utf8", callBack);else callBack != null && callBack.runWith([1, data]);
          }
        });
      }
    }, {
      key: "readSync",
      value: function readSync(filePath) {
        var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "utf8";
        var callBack = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var readyUrl = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
        var fileUrl = MiniFileMgr.getFileNativePath(filePath);
        var filesListStr;

        try {
          filesListStr = MiniFileMgr.fs.readFileSync(fileUrl, encoding);
          callBack != null && callBack.runWith([0, {
            data: filesListStr
          }]);
        } catch (error) {
          callBack != null && callBack.runWith([1]);
        }
      }
    }, {
      key: "setNativeFileDir",
      value: function setNativeFileDir(value) {
        MiniFileMgr.fileNativeDir = MiniAdpter.window.wx.env.USER_DATA_PATH + value;
      }
    }]);

    return MiniFileMgr;
  }();

  MiniFileMgr.fs = window.wx.getFileSystemManager();
  MiniFileMgr.down = window.wx.downloadFile;
  MiniFileMgr.filesListObj = {};
  MiniFileMgr.fakeObj = {};
  MiniFileMgr.fileListName = "layaairfiles.txt";
  MiniFileMgr.ziyuFileData = {};
  MiniFileMgr.ziyuFileTextureData = {};
  MiniFileMgr.loadPath = "";
  MiniFileMgr.DESCENDING = 2;
  MiniFileMgr.NUMERIC = 16;

  var MiniSoundChannel = /*#__PURE__*/function (_Laya$SoundChannel) {
    _inherits(MiniSoundChannel, _Laya$SoundChannel);

    var _super = _createSuper(MiniSoundChannel);

    function MiniSoundChannel(sound) {
      var _this;

      _classCallCheck(this, MiniSoundChannel);

      _this = _super.call(this);
      _this._sound = sound;
      _this._audio = sound._sound;
      _this._onCanplay = _this.onCanPlay.bind(_assertThisInitialized(_this));
      _this._onError = _this.onError.bind(_assertThisInitialized(_this));
      _this._onEnd = _this.__onEnd.bind(_assertThisInitialized(_this));

      _this.addEventListener();

      return _this;
    }

    _createClass(MiniSoundChannel, [{
      key: "addEventListener",
      value: function addEventListener() {
        this._audio.onError(this._onError);

        this._audio.onCanplay(this._onCanplay);
      }
    }, {
      key: "offEventListener",
      value: function offEventListener() {
        this._audio.offError(this._onError);

        this._audio.offCanplay(this._onCanplay);

        this._audio.offEnded(this._onEnd);
      }
    }, {
      key: "onError",
      value: function onError(error) {
        console.log("-----1---------------minisound-----url:", this.url);
        console.log(error);
        this.event(Laya.Event.ERROR);
        if (!this._audio) return;

        this._sound.dispose();

        this.offEventListener();
        this._sound = this._audio = null;
      }
    }, {
      key: "onCanPlay",
      value: function onCanPlay() {
        if (!this._audio) return;
        this.event(Laya.Event.COMPLETE);
        this.offEventListener();

        this._audio.onEnded(this._onEnd);

        if (!this.isStopped) {
          this.play();
        } else {
          this.stop();
        }
      }
    }, {
      key: "__onEnd",
      value: function __onEnd() {
        if (this.loops == 1) {
          if (this.completeHandler) {
            Laya.Laya.systemTimer.once(10, this, this.__runComplete, [this.completeHandler], false);
            this.completeHandler = null;
          }

          this.stop();
          this.event(Laya.Event.COMPLETE);
          return;
        }

        if (this.loops > 0) {
          this.loops--;
        }

        this.startTime = 0;
        this.play();
      }
    }, {
      key: "play",
      value: function play() {
        this.isStopped = false;
        Laya.SoundManager.addChannel(this);
        if (!this._audio) return;

        this._audio.play();
      }
    }, {
      key: "startTime",
      set: function set(time) {
        if (!this._audio) return;
        this._audio.startTime = time;
      }
    }, {
      key: "autoplay",
      get: function get() {
        if (!this._audio) return false;
        return this._audio.autoplay;
      },
      set: function set(value) {
        if (!this._audio) return;
        this._audio.autoplay = value;
      }
    }, {
      key: "position",
      get: function get() {
        if (!this._audio) return 0;
        return this._audio.currentTime;
      }
    }, {
      key: "duration",
      get: function get() {
        if (!this._audio) return 0;
        return this._audio.duration;
      }
    }, {
      key: "stop",
      value: function stop() {
        _get(_getPrototypeOf(MiniSoundChannel.prototype), "stop", this).call(this);

        this.isStopped = true;
        Laya.SoundManager.removeChannel(this);
        this.completeHandler = null;
        if (!this._audio) return;

        this._audio.stop();

        if (!this.loop) {
          this.offEventListener();

          this._sound.dispose();

          this._sound = null;
          this._audio = null;
        }
      }
    }, {
      key: "pause",
      value: function pause() {
        this.isStopped = true;
        if (!this._audio) return;

        this._audio.pause();
      }
    }, {
      key: "loop",
      get: function get() {
        if (!this._audio) return false;
        return this._audio.loop;
      },
      set: function set(value) {
        if (!this._audio) return;
        this._audio.loop = value;
      }
    }, {
      key: "resume",
      value: function resume() {
        this.isStopped = false;
        Laya.SoundManager.addChannel(this);
        if (!this._audio) return;

        this._audio.play();
      }
    }, {
      key: "volume",
      get: function get() {
        if (!this._audio) return 0;
        return this._audio.volume;
      },
      set: function set(v) {
        if (!this._audio) return;
        this._audio.volume = v;
      }
    }]);

    return MiniSoundChannel;
  }(Laya.SoundChannel);

  var MiniSound = /*#__PURE__*/function (_Laya$EventDispatcher) {
    _inherits(MiniSound, _Laya$EventDispatcher);

    var _super2 = _createSuper(MiniSound);

    function MiniSound() {
      var _this2;

      _classCallCheck(this, MiniSound);

      _this2 = _super2.call(this);
      _this2.loaded = false;
      _this2._sound = MiniSound._createSound();
      return _this2;
    }

    _createClass(MiniSound, [{
      key: "load",
      value: function load(url) {
        if (!MiniFileMgr.isLocalNativeFile(url)) {
          url = Laya.URL.formatURL(url);
        } else {
          if (!MiniFileMgr.isLocalNativeZipFile(url) && MiniFileMgr.isNetFile(url)) {
            if (MiniFileMgr.loadPath != "") {
              url = url.split(MiniFileMgr.loadPath)[1];
            } else {
              var tempStr = Laya.URL.rootPath != "" ? Laya.URL.rootPath : Laya.URL._basePath;
              if (tempStr != "") url = url.split(tempStr)[1];
            }
          }
        }

        this.url = url;
        this.readyUrl = url;

        if (MiniAdpter.autoCacheFile && MiniFileMgr.getFileInfo(url)) {
          this.onDownLoadCallBack(url, 0);
        } else {
          if (!MiniAdpter.autoCacheFile) {
            this.onDownLoadCallBack(url, 0);
          } else {
            if (MiniFileMgr.isLocalNativeFile(url)) {
              if (MiniAdpter.subNativeFiles && MiniAdpter.subNativeheads.length == 0) {
                for (var key in MiniAdpter.subNativeFiles) {
                  var tempArr = MiniAdpter.subNativeFiles[key];
                  MiniAdpter.subNativeheads = MiniAdpter.subNativeheads.concat(tempArr);

                  for (var i = 0; i < tempArr.length; i++) {
                    MiniAdpter.subMaps[tempArr[i]] = key + "/" + tempArr[i];
                  }
                }
              }

              if (MiniAdpter.subNativeFiles && url.indexOf("/") != -1) {
                var curfileHead = url.split("/")[0] + "/";

                if (curfileHead && MiniAdpter.subNativeheads.indexOf(curfileHead) != -1) {
                  var newfileHead = MiniAdpter.subMaps[curfileHead];
                  url = url.replace(curfileHead, newfileHead);
                }
              }

              this.onDownLoadCallBack(url, 0);
            } else {
              if (MiniFileMgr.isNetFile(url)) {
                MiniFileMgr.downOtherFiles(url, Laya.Handler.create(this, this.onDownLoadCallBack, [url]), url);
              } else {
                this.onDownLoadCallBack(url, 0);
              }
            }
          }
        }
      }
    }, {
      key: "onDownLoadCallBack",
      value: function onDownLoadCallBack(sourceUrl, errorCode) {
        var tempFilePath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        if (!errorCode && this._sound) {
          var fileNativeUrl;

          if (MiniAdpter.autoCacheFile) {
            if (!tempFilePath) {
              if (MiniFileMgr.isLocalNativeFile(sourceUrl)) {
                var tempStr = Laya.URL.rootPath != "" ? Laya.URL.rootPath : Laya.URL._basePath;
                var tempUrl = sourceUrl;
                if (tempStr != "" && (sourceUrl.indexOf("http://") != -1 || sourceUrl.indexOf("https://") != -1)) fileNativeUrl = sourceUrl.split(tempStr)[1];

                if (!fileNativeUrl) {
                  fileNativeUrl = tempUrl;
                }

                if (fileNativeUrl.indexOf(MiniAdpter.window.wx.env.USER_DATA_PATH) == -1 && MiniFileMgr.isLocalNativeZipFile(fileNativeUrl)) {
                  fileNativeUrl = MiniFileMgr.getFileNativePath(fileNativeUrl);
                }
              } else {
                var fileObj = MiniFileMgr.getFileInfo(sourceUrl);

                if (fileObj && fileObj.md5) {
                  fileNativeUrl = fileObj.tempFilePath || MiniFileMgr.getFileNativePath(fileObj.md5);
                } else {
                  fileNativeUrl = sourceUrl;
                }
              }
            } else {
              fileNativeUrl = tempFilePath;
            }

            this._sound.src = this.readyUrl = fileNativeUrl;
          } else {
            this._sound.src = this.readyUrl = sourceUrl;
          }
        } else {
          this.event(Laya.Event.ERROR);
        }
      }
    }, {
      key: "play",
      value: function play() {
        var startTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var loops = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        if (!this.url) return null;
        var channel = new MiniSoundChannel(this);
        channel.url = this.url;
        channel.loops = loops;
        channel.loop = loops === 0 ? true : false;
        channel.startTime = startTime;
        channel.isStopped = false;
        Laya.SoundManager.addChannel(channel);
        return channel;
      }
    }, {
      key: "duration",
      get: function get() {
        return this._sound.duration;
      }
    }, {
      key: "dispose",
      value: function dispose() {
        if (this._sound) {
          this._sound.destroy();

          this._sound = null;
          this.readyUrl = this.url = null;
        }
      }
    }], [{
      key: "_createSound",
      value: function _createSound() {
        MiniSound._id++;
        return MiniAdpter.window.wx.createInnerAudioContext();
      }
    }]);

    return MiniSound;
  }(Laya.EventDispatcher);

  MiniSound._id = 0;

  var MiniInput = /*#__PURE__*/function () {
    function MiniInput() {
      _classCallCheck(this, MiniInput);
    }

    _createClass(MiniInput, null, [{
      key: "_createInputElement",
      value: function _createInputElement() {
        Laya.Input['_initInput'](Laya.Input['area'] = Laya.Browser.createElement("textarea"));
        Laya.Input['_initInput'](Laya.Input['input'] = Laya.Browser.createElement("input"));
        Laya.Input['inputContainer'] = Laya.Browser.createElement("div");
        Laya.Input['inputContainer'].style.position = "absolute";
        Laya.Input['inputContainer'].style.zIndex = 1E5;
        Laya.Browser.container.appendChild(Laya.Input['inputContainer']);
        Laya.Laya.stage.on("resize", null, MiniInput._onStageResize);
        MiniAdpter.window.wx.onWindowResize && MiniAdpter.window.wx.onWindowResize(function (res) {});
        Laya.SoundManager._soundClass = MiniSound;
        Laya.SoundManager._musicClass = MiniSound;
        var model = MiniAdpter.systemInfo.model;
        var system = MiniAdpter.systemInfo.system;

        if (model.indexOf("iPhone") != -1) {
          Laya.Browser.onIPhone = true;
          Laya.Browser.onIOS = true;
          Laya.Browser.onIPad = true;
          Laya.Browser.onAndroid = false;
        }

        if (system.indexOf("Android") != -1 || system.indexOf("Adr") != -1) {
          Laya.Browser.onAndroid = true;
          Laya.Browser.onIPhone = false;
          Laya.Browser.onIOS = false;
          Laya.Browser.onIPad = false;
        }
      }
    }, {
      key: "_onStageResize",
      value: function _onStageResize() {
        var ts = Laya.Laya.stage._canvasTransform.identity();

        ts.scale(Laya.Browser.width / Laya.Render.canvas.width / Laya.Browser.pixelRatio, Laya.Browser.height / Laya.Render.canvas.height / Laya.Browser.pixelRatio);
      }
    }, {
      key: "wxinputFocus",
      value: function wxinputFocus(e) {
        var _inputTarget = Laya.Input['inputElement'].target;

        if (_inputTarget && !_inputTarget.editable) {
          return;
        }

        MiniAdpter.window.wx.offKeyboardConfirm();
        MiniAdpter.window.wx.offKeyboardInput();
        MiniAdpter.window.wx.showKeyboard({
          defaultValue: _inputTarget.text,
          maxLength: _inputTarget.maxChars,
          multiple: _inputTarget.multiline,
          confirmHold: true,
          confirmType: _inputTarget["confirmType"] || 'done',
          success: function success(res) {},
          fail: function fail(res) {}
        });
        MiniAdpter.window.wx.onKeyboardConfirm(function (res) {
          var str = res ? res.value : "";

          if (_inputTarget._restrictPattern) {
            str = str.replace(/\u2006|\x27/g, "");

            if (_inputTarget._restrictPattern.test(str)) {
              str = str.replace(_inputTarget._restrictPattern, "");
            }
          }

          _inputTarget.text = str;

          _inputTarget.event(Laya.Event.INPUT);

          MiniInput.inputEnter();

          _inputTarget.event("confirm");
        });
        MiniAdpter.window.wx.onKeyboardInput(function (res) {
          var str = res ? res.value : "";

          if (!_inputTarget.multiline) {
            if (str.indexOf("\n") != -1) {
              MiniInput.inputEnter();
              return;
            }
          }

          if (_inputTarget._restrictPattern) {
            str = str.replace(/\u2006|\x27/g, "");

            if (_inputTarget._restrictPattern.test(str)) {
              str = str.replace(_inputTarget._restrictPattern, "");
            }
          }

          _inputTarget.text = str;

          _inputTarget.event(Laya.Event.INPUT);
        });
      }
    }, {
      key: "inputEnter",
      value: function inputEnter() {
        Laya.Input['inputElement'].target.focus = false;
      }
    }, {
      key: "wxinputblur",
      value: function wxinputblur() {
        MiniInput.hideKeyboard();
      }
    }, {
      key: "hideKeyboard",
      value: function hideKeyboard() {
        MiniAdpter.window.wx.offKeyboardConfirm();
        MiniAdpter.window.wx.offKeyboardInput();
        MiniAdpter.window.wx.hideKeyboard({
          success: function success(res) {
            console.log('隐藏键盘');
          },
          fail: function fail(res) {
            console.log("隐藏键盘出错:" + (res ? res.errMsg : ""));
          }
        });
      }
    }]);

    return MiniInput;
  }();

  var MiniLoader = /*#__PURE__*/function (_Laya$EventDispatcher2) {
    _inherits(MiniLoader, _Laya$EventDispatcher2);

    var _super3 = _createSuper(MiniLoader);

    function MiniLoader() {
      _classCallCheck(this, MiniLoader);

      return _super3.call(this);
    }

    _createClass(MiniLoader, [{
      key: "_loadResourceFilter",
      value: function _loadResourceFilter(type, url) {
        var thisLoader = this;
        this.sourceUrl = Laya.URL.formatURL(url);

        if (MiniFileMgr.isNetFile(url)) {
          if (MiniFileMgr.loadPath != "") {
            url = url.split(MiniFileMgr.loadPath)[1];
          } else {
            var tempStr = Laya.URL.rootPath != "" ? Laya.URL.rootPath : Laya.URL._basePath;
            var tempUrl = url;
            if (tempStr != "") url = url.split(tempStr)[1];

            if (!url) {
              url = tempUrl;
            }
          }
        }

        if (MiniAdpter.subNativeFiles && MiniAdpter.subNativeheads.length == 0) {
          for (var key in MiniAdpter.subNativeFiles) {
            var tempArr = MiniAdpter.subNativeFiles[key];
            MiniAdpter.subNativeheads = MiniAdpter.subNativeheads.concat(tempArr);

            for (var aa = 0; aa < tempArr.length; aa++) {
              MiniAdpter.subMaps[tempArr[aa]] = key + "/" + tempArr[aa];
            }
          }
        }

        if (MiniAdpter.subNativeFiles && url.indexOf("/") != -1) {
          var curfileHead = url.split("/")[0] + "/";

          if (curfileHead && MiniAdpter.subNativeheads.indexOf(curfileHead) != -1) {
            var newfileHead = MiniAdpter.subMaps[curfileHead];
            url = url.replace(curfileHead, newfileHead);
          }
        }

        switch (type) {
          case Laya.Loader.IMAGE:
          case "htmlimage":
          case "nativeimage":
            MiniLoader._transformImgUrl(url, type, thisLoader);

            break;

          case Laya.Loader.SOUND:
            thisLoader._loadSound(url);

            break;

          default:
            thisLoader._loadResource(type, url);

        }
      }
    }, {
      key: "_loadSound",
      value: function _loadSound(url) {
        var thisLoader = this;

        if (!MiniAdpter.autoCacheFile) {
          MiniLoader.onDownLoadCallBack(url, thisLoader, 0);
        } else {
          var tempurl = Laya.URL.formatURL(url);

          if (!MiniFileMgr.isLocalNativeFile(url) && !MiniFileMgr.getFileInfo(tempurl)) {
            if (MiniFileMgr.isNetFile(tempurl)) {
              MiniFileMgr.downOtherFiles(tempurl, Laya.Handler.create(MiniLoader, MiniLoader.onDownLoadCallBack, [tempurl, thisLoader]), tempurl);
            } else {
              MiniLoader.onDownLoadCallBack(url, thisLoader, 0);
            }
          } else {
            MiniLoader.onDownLoadCallBack(url, thisLoader, 0);
          }
        }
      }
    }, {
      key: "complete",
      value: function complete(data) {
        if (data instanceof Laya.Resource) {
          data._setCreateURL(this.sourceUrl);
        } else if (data instanceof Laya.Texture && data.bitmap instanceof Laya.Resource) {
          data.bitmap._setCreateURL(this.sourceUrl);
        }

        this.originComplete(data);
      }
    }, {
      key: "_loadHttpRequestWhat",
      value: function _loadHttpRequestWhat(url, contentType) {
        var thisLoader = this;
        var encoding = MiniAdpter.getUrlEncode(url, contentType);
        if (Laya.Loader.preLoadedMap[url]) thisLoader.onLoaded(Laya.Loader.preLoadedMap[url]);else {
          var tempurl = Laya.URL.formatURL(url);

          if (!MiniAdpter.AutoCacheDownFile) {
            if (MiniFileMgr.isNetFile(tempurl)) {
              thisLoader._loadHttpRequest(tempurl, contentType, thisLoader, thisLoader.onLoaded, thisLoader, thisLoader.onProgress, thisLoader, thisLoader.onError);
            } else {
              if (url.indexOf(MiniAdpter.window.wx.env.USER_DATA_PATH) == -1 && MiniFileMgr.isLocalNativeZipFile(url)) {
                url = MiniFileMgr.getFileNativePath(url);
              }

              MiniFileMgr.readFile(url, encoding, new Laya.Handler(MiniLoader, MiniLoader.onReadNativeCallBack, [url, contentType, thisLoader]), url);
            }
          } else {
            if (!MiniFileMgr.isLocalNativeFile(url) && !MiniFileMgr.getFileInfo(tempurl)) {
              if (MiniFileMgr.isNetFile(tempurl)) {
                MiniFileMgr.downFiles(tempurl, encoding, new Laya.Handler(MiniLoader, MiniLoader.onReadNativeCallBack, [url, contentType, thisLoader]), tempurl, true);
              } else {
                MiniFileMgr.readFile(url, encoding, new Laya.Handler(MiniLoader, MiniLoader.onReadNativeCallBack, [url, contentType, thisLoader]), url);
              }
            } else {
              var tempUrl = url;
              var fileObj = MiniFileMgr.getFileInfo(tempurl);

              if (fileObj && fileObj.md5) {
                tempUrl = fileObj.tempFilePath || MiniFileMgr.getFileNativePath(fileObj.md5);
              }

              MiniFileMgr.readFile(tempUrl, encoding, new Laya.Handler(MiniLoader, MiniLoader.onReadNativeCallBack, [url, contentType, thisLoader]), url);
            }
          }
        }
      }
    }], [{
      key: "onDownLoadCallBack",
      value: function onDownLoadCallBack(sourceUrl, thisLoader, errorCode) {
        var tempFilePath = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

        if (!errorCode) {
          var fileNativeUrl;

          if (MiniAdpter.autoCacheFile) {
            if (!tempFilePath) {
              if (MiniFileMgr.isLocalNativeFile(sourceUrl)) {
                fileNativeUrl = sourceUrl;

                if (fileNativeUrl.indexOf(MiniAdpter.window.wx.env.USER_DATA_PATH) == -1 && MiniFileMgr.isLocalNativeZipFile(fileNativeUrl)) {
                  fileNativeUrl = MiniFileMgr.getFileNativePath(fileNativeUrl);
                }
              } else {
                var fileObj = MiniFileMgr.getFileInfo(sourceUrl);

                if (fileObj && fileObj.md5) {
                  fileNativeUrl = fileObj.tempFilePath || MiniFileMgr.getFileNativePath(fileObj.md5);
                } else {
                  fileNativeUrl = sourceUrl;
                }
              }
            } else {
              fileNativeUrl = tempFilePath;
            }
          } else {
            fileNativeUrl = Laya.URL.formatURL(sourceUrl);
          }

          sourceUrl = fileNativeUrl;
          var sound = new Laya.SoundManager._soundClass();
          sound.load(sourceUrl);
          thisLoader.onLoaded(sound);
        } else {
          thisLoader.event(Laya.Event.ERROR, "Load sound failed");
        }
      }
    }, {
      key: "onReadNativeCallBack",
      value: function onReadNativeCallBack(url) {
        var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var thisLoader = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var errorCode = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
        var data = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

        if (!errorCode) {
          var tempData;

          if (type == Laya.Loader.JSON || type == Laya.Loader.ATLAS || type == Laya.Loader.PREFAB || type == Laya.Loader.PLF) {
            tempData = MiniAdpter.getJson(data.data);
          } else if (type == Laya.Loader.XML) {
            tempData = Laya.Utils.parseXMLFromString(data.data);
          } else {
            tempData = data.data;
          }

          if (!MiniAdpter.isZiYu && MiniAdpter.isPosMsgYu && type != Laya.Loader.BUFFER) {
            MiniAdpter.window.wx.postMessage({
              url: url,
              data: tempData,
              isLoad: "filedata"
            });
          }

          thisLoader.onLoaded(tempData);
        } else if (errorCode == 1) {
          thisLoader._loadHttpRequest(url, type, thisLoader, thisLoader.onLoaded, thisLoader, thisLoader.onProgress, thisLoader, thisLoader.onError);
        }
      }
    }, {
      key: "_transformImgUrl",
      value: function _transformImgUrl(url, type, thisLoader) {
        if (MiniAdpter.isZiYu || MiniFileMgr.isLocalNativeFile(url)) {
          if (MiniFileMgr.isLocalNativeZipFile(url)) {
            url = MiniFileMgr.getFileNativePath(url);
          }

          thisLoader._loadImage(url, false);

          return;
        }

        if (!MiniAdpter.autoCacheFile) {
          thisLoader._loadImage(url);
        } else {
          var tempUrl = Laya.URL.formatURL(url);

          if (!MiniFileMgr.isLocalNativeFile(url) && !MiniFileMgr.getFileInfo(tempUrl)) {
            if (MiniFileMgr.isNetFile(tempUrl)) {
              MiniFileMgr.downOtherFiles(tempUrl, new Laya.Handler(MiniLoader, MiniLoader.onDownImgCallBack, [url, thisLoader]), tempUrl);
            } else {
              MiniLoader.onCreateImage(url, thisLoader, true);
            }
          } else {
            MiniLoader.onCreateImage(url, thisLoader);
          }
        }
      }
    }, {
      key: "onDownImgCallBack",
      value: function onDownImgCallBack(sourceUrl, thisLoader, errorCode) {
        var tempFilePath = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
        if (!errorCode) MiniLoader.onCreateImage(sourceUrl, thisLoader, false, tempFilePath);else {
          thisLoader.onError(null);
        }
      }
    }, {
      key: "onCreateImage",
      value: function onCreateImage(sourceUrl, thisLoader) {
        var isLocal = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var tempFilePath = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
        var fileNativeUrl;

        if (MiniAdpter.autoCacheFile) {
          if (!isLocal) {
            if (tempFilePath != "") {
              fileNativeUrl = tempFilePath;
            } else {
              var fileObj = MiniFileMgr.getFileInfo(Laya.URL.formatURL(sourceUrl));
              fileNativeUrl = fileObj.tempFilePath || MiniFileMgr.getFileNativePath(fileObj.md5);
            }
          } else if (MiniAdpter.isZiYu) {
            var tempUrl = Laya.URL.formatURL(sourceUrl);

            if (MiniFileMgr.ziyuFileTextureData[tempUrl]) {
              fileNativeUrl = MiniFileMgr.ziyuFileTextureData[tempUrl];
            } else fileNativeUrl = sourceUrl;
          } else fileNativeUrl = sourceUrl;
        } else {
          if (!isLocal) fileNativeUrl = tempFilePath;else fileNativeUrl = sourceUrl;
        }

        thisLoader._loadImage(fileNativeUrl, false);
      }
    }]);

    return MiniLoader;
  }(Laya.EventDispatcher);

  var MiniLocalStorage = /*#__PURE__*/function () {
    function MiniLocalStorage() {
      _classCallCheck(this, MiniLocalStorage);
    }

    _createClass(MiniLocalStorage, null, [{
      key: "__init__",
      value: function __init__() {
        MiniLocalStorage.items = MiniLocalStorage;
      }
    }, {
      key: "setItem",
      value: function setItem(key, value) {
        try {
          MiniAdpter.window.wx.setStorageSync(key, value);
        } catch (error) {
          MiniAdpter.window.wx.setStorage({
            key: key,
            data: value
          });
        }
      }
    }, {
      key: "getItem",
      value: function getItem(key) {
        return MiniAdpter.window.wx.getStorageSync(key);
      }
    }, {
      key: "setJSON",
      value: function setJSON(key, value) {
        MiniLocalStorage.setItem(key, value);
      }
    }, {
      key: "getJSON",
      value: function getJSON(key) {
        return MiniLocalStorage.getItem(key);
      }
    }, {
      key: "removeItem",
      value: function removeItem(key) {
        MiniAdpter.window.wx.removeStorageSync(key);
      }
    }, {
      key: "clear",
      value: function clear() {
        MiniAdpter.window.wx.clearStorageSync();
      }
    }, {
      key: "getStorageInfoSync",
      value: function getStorageInfoSync() {
        try {
          var res = MiniAdpter.window.wx.getStorageInfoSync();
          console.log(res.keys);
          console.log(res.currentSize);
          console.log(res.limitSize);
          return res;
        } catch (e) {}

        return null;
      }
    }]);

    return MiniLocalStorage;
  }();

  MiniLocalStorage.support = true;

  var MiniAdpter = /*#__PURE__*/function () {
    function MiniAdpter() {
      _classCallCheck(this, MiniAdpter);
    }

    _createClass(MiniAdpter, null, [{
      key: "getJson",
      value: function getJson(data) {
        return JSON.parse(data);
      }
    }, {
      key: "enable",
      value: function enable() {
        MiniAdpter.init(Laya.Laya.isWXPosMsg, Laya.Laya.isWXOpenDataContext);
      }
    }, {
      key: "init",
      value: function init() {
        var isPosMsg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var isSon = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        if (MiniAdpter._inited) return;
        MiniAdpter._inited = true;
        MiniAdpter.window = window;
        if (!MiniAdpter.window.hasOwnProperty("wx")) return;
        if (MiniAdpter.window.navigator.userAgent.indexOf('MiniGame') < 0) return;
        MiniAdpter.isZiYu = isSon;
        MiniAdpter.isPosMsgYu = isPosMsg;
        MiniAdpter.EnvConfig = {};

        if (!MiniAdpter.isZiYu) {
          MiniFileMgr.setNativeFileDir("/layaairGame");
          MiniFileMgr.getCacheList(MiniFileMgr.fileNativeDir, Laya.Handler.create(MiniAdpter, MiniAdpter.onMkdirCallBack));
        }

        MiniAdpter.systemInfo = MiniAdpter.window.wx.getSystemInfoSync();

        MiniAdpter.window.focus = function () {};

        Laya.Laya['_getUrlPath'] = function () {
          return "";
        };

        MiniAdpter.window.logtime = function (str) {};

        MiniAdpter.window.alertTimeLog = function (str) {};

        MiniAdpter.window.resetShareInfo = function () {};

        MiniAdpter.window.CanvasRenderingContext2D = function () {};

        MiniAdpter.window.CanvasRenderingContext2D.prototype = MiniAdpter.window.wx.createCanvas().getContext('2d').__proto__;

        MiniAdpter.window.document.body.appendChild = function () {};

        MiniAdpter.EnvConfig.pixelRatioInt = 0;
        Laya.Browser["_pixelRatio"] = MiniAdpter.pixelRatio();
        MiniAdpter._preCreateElement = Laya.Browser.createElement;
        Laya.Browser["createElement"] = MiniAdpter.createElement;
        Laya.RunDriver.createShaderCondition = MiniAdpter.createShaderCondition;
        Laya.Utils['parseXMLFromString'] = MiniAdpter.parseXMLFromString;
        Laya.Input['_createInputElement'] = MiniInput['_createInputElement'];

        if (!window.ImageData) {
          window.ImageData = ImageDataPolyfill;
        }

        Laya.Loader.prototype._loadResourceFilter = MiniLoader.prototype._loadResourceFilter;
        Laya.Loader.prototype.originComplete = Laya.Loader.prototype.complete;
        Laya.Loader.prototype.complete = MiniLoader.prototype.complete;
        Laya.Loader.prototype._loadSound = MiniLoader.prototype._loadSound;
        Laya.Loader.prototype._loadHttpRequestWhat = MiniLoader.prototype._loadHttpRequestWhat;
        Laya.LocalStorage._baseClass = MiniLocalStorage;

        MiniLocalStorage.__init__();

        MiniAdpter.window.wx.onMessage && MiniAdpter.window.wx.onMessage(MiniAdpter._onMessage);
      }
    }, {
      key: "_onMessage",
      value: function _onMessage(data) {
        switch (data.type) {
          case "changeMatrix":
            Laya.Laya.stage.transform.identity();
            Laya.Laya.stage._width = data.w;
            Laya.Laya.stage._height = data.h;
            Laya.Laya.stage._canvasTransform = new Laya.Matrix(data.a, data.b, data.c, data.d, data.tx, data.ty);
            break;

          case "display":
            Laya.Laya.stage.frameRate = data.rate || Laya.Stage.FRAME_FAST;
            break;

          case "undisplay":
            Laya.Laya.stage.frameRate = Laya.Stage.FRAME_SLEEP;
            break;
        }

        if (data['isLoad'] == "opendatacontext") {
          if (data.url) {
            MiniFileMgr.ziyuFileData[data.url] = data.atlasdata;
            MiniFileMgr.ziyuFileTextureData[data.imgReadyUrl] = data.imgNativeUrl;
          }
        } else if (data['isLoad'] == "openJsondatacontext") {
          if (data.url) {
            MiniFileMgr.ziyuFileData[data.url] = data.atlasdata;
          }
        } else if (data['isLoad'] == "openJsondatacontextPic") {
          MiniFileMgr.ziyuFileTextureData[data.imgReadyUrl] = data.imgNativeUrl;
        }
      }
    }, {
      key: "loadZip",
      value: function loadZip(zipurl, nativeurl, callBack, proCallBack) {
        var isUpdateType = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
        var fs = MiniFileMgr.fs;

        if (fs && fs.unzip) {
          MiniAdpter.nativefiles.push(nativeurl);
          MiniAdpter.nativezipfiles.push(nativeurl);
          var path = MiniFileMgr.fileNativeDir + "/" + nativeurl;
          MiniAdpter.zipHeadFiles[zipurl] = nativeurl;
          fs.access({
            path: path,
            success: function (data) {
              if (isUpdateType == 1) {
                try {
                  fs.rmdirSync(path, true);
                } catch (e) {
                  console.log("目录删除成功");
                  console.log(e);
                }

                fs.mkdir({
                  dirPath: path,
                  recursive: true,
                  success: function (data1) {
                    MiniAdpter.downZip(zipurl, path, fs, callBack, proCallBack);
                  }.bind(this),
                  fail: function (data1) {
                    callBack != null && callBack.runWith([{
                      errCode: 3,
                      errMsg: "创建压缩包目录失败",
                      wxData: data1
                    }]);
                  }.bind(this)
                });
              } else if (isUpdateType == 2) {
                MiniAdpter.downZip(zipurl, path, fs, callBack, proCallBack);
              } else {
                var fileObj = MiniFileMgr.getFileInfo(zipurl);

                if (!fileObj) {
                  MiniAdpter.downZip(zipurl, path, fs, callBack, proCallBack);
                } else {
                  callBack != null && callBack.runWith([{
                    errCode: 0,
                    errMsg: "zip包目录存在，直接返回完成",
                    wxData: data
                  }]);
                }
              }
            }.bind(this),
            fail: function (data) {
              if (data && data.errMsg.indexOf("access:fail no such file or directory") != -1) {
                fs.mkdir({
                  dirPath: path,
                  recursive: true,
                  success: function (data1) {
                    MiniAdpter.downZip(zipurl, path, fs, callBack, proCallBack);
                  }.bind(this),
                  fail: function (data1) {
                    callBack != null && callBack.runWith([{
                      errCode: 3,
                      errMsg: "创建压缩包目录失败",
                      wxData: data1
                    }]);
                  }.bind(this)
                });
              }
            }.bind(this)
          });
        } else {
          callBack != null && callBack.runWith([{
            errCode: 2,
            errMsg: "微信压缩接口不支持"
          }]);
        }
      }
    }, {
      key: "downZip",
      value: function downZip(zipurl, path, fs, callBack, proCallBack) {
        var obj = {
          zipFilePath: zipurl,
          targetPath: path,
          success: function (data) {
            callBack != null && callBack.runWith([{
              errCode: 0,
              errMsg: "解压成功",
              wxData: data
            }]);
          }.bind(this),
          fail: function (data) {
            callBack != null && callBack.runWith([{
              errCode: 1,
              errMsg: "解压失败",
              wxData: data
            }]);
          }.bind(this)
        };

        if (zipurl.indexOf('http://') == -1 && zipurl.indexOf('https://') == -1) {
          fs.unzip(obj);
        } else {
          var downloadTask = window.wx.downloadFile({
            url: zipurl,
            success: function (data) {
              if (data.statusCode === 200) {
                obj.zipFilePath = data.tempFilePath;
                fs.unzip(obj);
                MiniFileMgr.copyTOCache(data.tempFilePath, zipurl, null, 'utf8', true);
              } else {
                callBack != null && callBack.runWith([{
                  errCode: 4,
                  errMsg: "远端下载zip包失败",
                  wxData: data
                }]);
              }
            }.bind(this),
            fail: function (data) {
              callBack != null && callBack.runWith([{
                errCode: 4,
                errMsg: "远端下载zip包失败",
                wxData: data
              }]);
            }.bind(this)
          });
          downloadTask.onProgressUpdate(function (data) {
            proCallBack != null && proCallBack.runWith([{
              errCode: 5,
              errMsg: "zip包下载中",
              progress: data.progress
            }]);
          });
        }
      }
    }, {
      key: "getUrlEncode",
      value: function getUrlEncode(url, type) {
        if (type == "arraybuffer") return "";
        return "utf8";
      }
    }, {
      key: "downLoadFile",
      value: function downLoadFile(fileUrl) {
        var fileType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
        var callBack = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var encoding = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "utf8";
        var fileObj = MiniFileMgr.getFileInfo(fileUrl);
        if (!fileObj) MiniFileMgr.downLoadFile(fileUrl, fileType, callBack, encoding);else {
          callBack != null && callBack.runWith([0]);
        }
      }
    }, {
      key: "remove",
      value: function remove(fileUrl) {
        var callBack = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        MiniFileMgr.deleteFile("", fileUrl, callBack, "", 0);
      }
    }, {
      key: "removeAll",
      value: function removeAll() {
        MiniFileMgr.deleteAll();
      }
    }, {
      key: "hasNativeFile",
      value: function hasNativeFile(fileUrl) {
        return MiniFileMgr.isLocalNativeFile(fileUrl);
      }
    }, {
      key: "getFileInfo",
      value: function getFileInfo(fileUrl) {
        return MiniFileMgr.getFileInfo(fileUrl);
      }
    }, {
      key: "getFileList",
      value: function getFileList() {
        return MiniFileMgr.filesListObj;
      }
    }, {
      key: "exitMiniProgram",
      value: function exitMiniProgram() {
        MiniAdpter.window["wx"].exitMiniProgram();
      }
    }, {
      key: "onMkdirCallBack",
      value: function onMkdirCallBack(errorCode, data) {
        if (!errorCode) {
          MiniFileMgr.filesListObj = JSON.parse(data.data);
          MiniFileMgr.fakeObj = JSON.parse(data.data);
        } else {
          MiniFileMgr.fakeObj = {};
          MiniFileMgr.filesListObj = {};
        }

        var files = MiniFileMgr.fs.readdirSync(MiniFileMgr.fileNativeDir);
        if (!files.length) return;
        var tempMd5ListObj = {};
        var fileObj;

        for (var key in MiniFileMgr.filesListObj) {
          if (key != "fileUsedSize") {
            fileObj = MiniFileMgr.filesListObj[key];
            tempMd5ListObj[fileObj.md5] = fileObj.readyUrl;
          }
        }

        var fileName;

        for (var i = 0, sz = files.length; i < sz; i++) {
          fileName = files[i];
          if (fileName == MiniFileMgr.fileListName) continue;

          if (!tempMd5ListObj[fileName]) {
            var deleteFileUrl = MiniFileMgr.getFileNativePath(fileName);
            MiniFileMgr.fs.unlink({
              filePath: deleteFileUrl,
              success: function success(data) {
                console.log("删除无引用的磁盘文件:" + fileName);
              }
            });
          }

          delete tempMd5ListObj[fileName];
        }

        for (var _key in tempMd5ListObj) {
          delete MiniFileMgr.filesListObj[tempMd5ListObj[_key]];
          delete MiniFileMgr.fakeObj[tempMd5ListObj[_key]];
          console.log("删除错误记录：", tempMd5ListObj[_key]);
        }
      }
    }, {
      key: "pixelRatio",
      value: function pixelRatio() {
        if (!MiniAdpter.EnvConfig.pixelRatioInt) {
          try {
            MiniAdpter.EnvConfig.pixelRatioInt = MiniAdpter.systemInfo.pixelRatio;
            return MiniAdpter.systemInfo.pixelRatio;
          } catch (error) {}
        }

        return MiniAdpter.EnvConfig.pixelRatioInt;
      }
    }, {
      key: "createElement",
      value: function createElement(type) {
        if (type == "canvas") {
          var _source;

          if (MiniAdpter.idx == 1) {
            if (MiniAdpter.isZiYu) {
              _source = MiniAdpter.window.sharedCanvas;
              _source.style = {};
            } else {
              _source = MiniAdpter.window.canvas;
            }
          } else {
            _source = MiniAdpter.window.wx.createCanvas();
          }

          MiniAdpter.idx++;
          return _source;
        } else if (type == "textarea" || type == "input") {
          return MiniAdpter.onCreateInput(type);
        } else if (type == "div") {
          var node = MiniAdpter._preCreateElement(type);

          node.contains = function (value) {
            return null;
          };

          node.removeChild = function (value) {};

          return node;
        } else {
          return MiniAdpter._preCreateElement(type);
        }
      }
    }, {
      key: "onCreateInput",
      value: function onCreateInput(type) {
        var node = MiniAdpter._preCreateElement(type);

        node.focus = MiniInput.wxinputFocus;
        node.blur = MiniInput.wxinputblur;
        node.style = {};
        node.value = 0;
        node.parentElement = {};
        node.placeholder = {};
        node.type = {};

        node.setColor = function (value) {};

        node.setType = function (value) {};

        node.setFontFace = function (value) {};

        node.addEventListener = function (value) {};

        node.contains = function (value) {
          return null;
        };

        node.removeChild = function (value) {};

        return node;
      }
    }, {
      key: "createShaderCondition",
      value: function createShaderCondition(conditionScript) {
        var func = function func() {
          return this[conditionScript.replace("this.", "")];
        };

        return func;
      }
    }, {
      key: "sendAtlasToOpenDataContext",
      value: function sendAtlasToOpenDataContext(url) {
        if (!MiniAdpter.isZiYu) {
          var atlasJson = Laya.Loader.getRes(Laya.URL.formatURL(url));

          if (atlasJson) {
            var textureArr = atlasJson.meta.image.split(",");

            if (atlasJson.meta && atlasJson.meta.image) {
              var toloadPics = atlasJson.meta.image.split(",");
              var split = url.indexOf("/") >= 0 ? "/" : "\\";
              var idx = url.lastIndexOf(split);
              var folderPath = idx >= 0 ? url.substr(0, idx + 1) : "";

              for (var i = 0, len = toloadPics.length; i < len; i++) {
                toloadPics[i] = folderPath + toloadPics[i];
              }
            } else {
              toloadPics = [url.replace(".json", ".png")];
            }

            for (i = 0; i < toloadPics.length; i++) {
              var tempAtlasPngUrl = toloadPics[i];
              MiniAdpter.postInfoToContext(Laya.Laya.URL.formatURL(url), Laya.Laya.URL.formatURL(tempAtlasPngUrl), atlasJson);
            }
          } else {
            throw "传递的url没有获取到对应的图集数据信息，请确保图集已经过！";
          }
        }
      }
    }, {
      key: "postInfoToContext",
      value: function postInfoToContext(url, atlaspngUrl, atlasJson) {
        var postData = {
          "frames": atlasJson.frames,
          "meta": atlasJson.meta
        };
        var textureUrl = atlaspngUrl;
        var fileObj = MiniFileMgr.getFileInfo(Laya.URL.formatURL(atlaspngUrl));

        if (fileObj) {
          var fileNativeUrl = fileObj.tempFilePath || MiniFileMgr.getFileNativePath(fileObj.md5);
        } else {
          fileNativeUrl = textureUrl;
        }

        if (fileNativeUrl) {
          MiniAdpter.window.wx.postMessage({
            url: url,
            atlasdata: postData,
            imgNativeUrl: fileNativeUrl,
            imgReadyUrl: textureUrl,
            isLoad: "opendatacontext"
          });
        } else {
          throw "获取图集的磁盘url路径不存在！";
        }
      }
    }, {
      key: "sendSinglePicToOpenDataContext",
      value: function sendSinglePicToOpenDataContext(url) {
        var tempTextureUrl = Laya.URL.formatURL(url);
        var fileObj = MiniFileMgr.getFileInfo(tempTextureUrl);

        if (fileObj) {
          var fileNativeUrl = fileObj.tempFilePath || MiniFileMgr.getFileNativePath(fileObj.md5);
          url = tempTextureUrl;
        } else {
          fileNativeUrl = url;
        }

        if (fileNativeUrl) {
          url = Laya.Laya.URL.formatURL(url);
          MiniAdpter.window.wx.postMessage({
            url: url,
            imgNativeUrl: fileNativeUrl,
            imgReadyUrl: url,
            isLoad: "openJsondatacontextPic"
          });
        } else {
          throw "获取图集的磁盘url路径不存在！";
        }
      }
    }, {
      key: "sendJsonDataToDataContext",
      value: function sendJsonDataToDataContext(url) {
        if (!MiniAdpter.isZiYu) {
          url = Laya.Laya.URL.formatURL(url);
          var atlasJson = Laya.Loader.getRes(url);

          if (atlasJson) {
            MiniAdpter.window.wx.postMessage({
              url: url,
              atlasdata: atlasJson,
              isLoad: "openJsondatacontext"
            });
          } else {
            throw "传递的url没有获取到对应的图集数据信息，请确保图集已经过！";
          }
        }
      }
    }]);

    return MiniAdpter;
  }();

  MiniAdpter._inited = false;
  MiniAdpter.autoCacheFile = true;
  MiniAdpter.minClearSize = 5 * 1024 * 1024;
  MiniAdpter.sizeLimit = 200 * 1024 * 1024;
  MiniAdpter.nativefiles = ["layaNativeDir", "wxlocal"];
  MiniAdpter.nativezipfiles = [];
  MiniAdpter.zipRequestHead = "";
  MiniAdpter.zipHeadFiles = {};
  MiniAdpter.subNativeFiles = [];
  MiniAdpter.subNativeheads = [];
  MiniAdpter.subMaps = [];
  MiniAdpter.AutoCacheDownFile = false;

  MiniAdpter.parseXMLFromString = function (value) {
    var rst;
    value = value.replace(/>\s+</g, '><');

    try {
      rst = new MiniAdpter.window.Parser.DOMParser().parseFromString(value, 'text/xml');
    } catch (error) {
      throw "需要引入xml解析库文件";
    }

    return rst;
  };

  MiniAdpter.idx = 1;

  var MiniAccelerator = /*#__PURE__*/function (_Laya$EventDispatcher3) {
    _inherits(MiniAccelerator, _Laya$EventDispatcher3);

    var _super4 = _createSuper(MiniAccelerator);

    function MiniAccelerator() {
      _classCallCheck(this, MiniAccelerator);

      return _super4.call(this);
    }

    _createClass(MiniAccelerator, [{
      key: "on",
      value: function on(type, caller, listener) {
        var args = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

        _get(_getPrototypeOf(MiniAccelerator.prototype), "on", this).call(this, type, caller, listener, args);

        MiniAccelerator.startListen(this["onDeviceOrientationChange"]);
        return this;
      }
    }, {
      key: "off",
      value: function off(type, caller, listener) {
        var onceOnly = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
        if (!this.hasListener(type)) MiniAccelerator.stopListen();
        return _get(_getPrototypeOf(MiniAccelerator.prototype), "off", this).call(this, type, caller, listener, onceOnly);
      }
    }], [{
      key: "__init__",
      value: function __init__() {
        try {
          var Acc;
          Acc = Laya.Accelerator;
          if (!Acc) return;
          Acc["prototype"]["on"] = MiniAccelerator["prototype"]["on"];
          Acc["prototype"]["off"] = MiniAccelerator["prototype"]["off"];
        } catch (e) {}
      }
    }, {
      key: "startListen",
      value: function startListen(callBack) {
        MiniAccelerator._callBack = callBack;
        if (MiniAccelerator._isListening) return;
        MiniAccelerator._isListening = true;

        try {
          MiniAdpter.window.wx.onAccelerometerChange(MiniAccelerator.onAccelerometerChange);
        } catch (e) {}
      }
    }, {
      key: "stopListen",
      value: function stopListen() {
        MiniAccelerator._isListening = false;

        try {
          MiniAdpter.window.wx.stopAccelerometer({});
        } catch (e) {}
      }
    }, {
      key: "onAccelerometerChange",
      value: function onAccelerometerChange(res) {
        var e;
        e = {};
        e.acceleration = res;
        e.accelerationIncludingGravity = res;
        e.rotationRate = {};

        if (MiniAccelerator._callBack != null) {
          MiniAccelerator._callBack(e);
        }
      }
    }]);

    return MiniAccelerator;
  }(Laya.EventDispatcher);

  MiniAccelerator._isListening = false;

  var MiniLocation = /*#__PURE__*/function () {
    function MiniLocation() {
      _classCallCheck(this, MiniLocation);
    }

    _createClass(MiniLocation, null, [{
      key: "__init__",
      value: function __init__() {
        MiniAdpter.window.navigator.geolocation.getCurrentPosition = MiniLocation.getCurrentPosition;
        MiniAdpter.window.navigator.geolocation.watchPosition = MiniLocation.watchPosition;
        MiniAdpter.window.navigator.geolocation.clearWatch = MiniLocation.clearWatch;
      }
    }, {
      key: "getCurrentPosition",
      value: function getCurrentPosition() {
        var success = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var paramO;
        paramO = {};
        paramO.success = getSuccess;
        paramO.fail = error;
        MiniAdpter.window.wx.getLocation(paramO);

        function getSuccess(res) {
          if (success != null) {
            success(res);
          }
        }
      }
    }, {
      key: "watchPosition",
      value: function watchPosition() {
        var success = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        MiniLocation._curID++;
        var curWatchO;
        curWatchO = {};
        curWatchO.success = success;
        curWatchO.error = error;
        MiniLocation._watchDic[MiniLocation._curID] = curWatchO;
        Laya.Laya.systemTimer.loop(1000, null, MiniLocation._myLoop);
        return MiniLocation._curID;
      }
    }, {
      key: "clearWatch",
      value: function clearWatch(id) {
        delete MiniLocation._watchDic[id];

        if (!MiniLocation._hasWatch()) {
          Laya.Laya.systemTimer.clear(null, MiniLocation._myLoop);
        }
      }
    }, {
      key: "_hasWatch",
      value: function _hasWatch() {
        var key;

        for (key in MiniLocation._watchDic) {
          if (MiniLocation._watchDic[key]) return true;
        }

        return false;
      }
    }, {
      key: "_myLoop",
      value: function _myLoop() {
        MiniLocation.getCurrentPosition(MiniLocation._mySuccess, MiniLocation._myError);
      }
    }, {
      key: "_mySuccess",
      value: function _mySuccess(res) {
        var rst = {};
        rst.coords = res;
        rst.timestamp = Laya.Browser.now();
        var key;

        for (key in MiniLocation._watchDic) {
          if (MiniLocation._watchDic[key].success) {
            MiniLocation._watchDic[key].success(rst);
          }
        }
      }
    }, {
      key: "_myError",
      value: function _myError(res) {
        var key;

        for (key in MiniLocation._watchDic) {
          if (MiniLocation._watchDic[key].error) {
            MiniLocation._watchDic[key].error(res);
          }
        }
      }
    }]);

    return MiniLocation;
  }();

  MiniLocation._watchDic = {};
  MiniLocation._curID = 0;

  var MiniVideo = /*#__PURE__*/function () {
    function MiniVideo() {
      var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 320;
      var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 240;

      _classCallCheck(this, MiniVideo);

      this.videoend = false;
      this.videourl = "";
      this.videoElement = MiniAdpter.window.wx.createVideo({
        width: width,
        height: height,
        autoplay: true
      });
    }

    _createClass(MiniVideo, [{
      key: "on",
      value: function on(eventType, ths, callBack) {
        if (eventType == "loadedmetadata") {
          this.onPlayFunc = callBack.bind(ths);
          this.videoElement.onPlay = this.onPlayFunction.bind(this);
        } else if (eventType == "ended") {
          this.onEndedFunC = callBack.bind(ths);
          this.videoElement.onEnded = this.onEndedFunction.bind(this);
        }

        this.videoElement.onTimeUpdate = this.onTimeUpdateFunc.bind(this);
      }
    }, {
      key: "onTimeUpdateFunc",
      value: function onTimeUpdateFunc(data) {
        this.position = data.position;
        this._duration = data.duration;
      }
    }, {
      key: "duration",
      get: function get() {
        return this._duration;
      }
    }, {
      key: "onPlayFunction",
      value: function onPlayFunction() {
        if (this.videoElement) this.videoElement.readyState = 200;
        console.log("=====视频加载完成========");
        this.onPlayFunc != null && this.onPlayFunc();
      }
    }, {
      key: "onEndedFunction",
      value: function onEndedFunction() {
        if (!this.videoElement) return;
        this.videoend = true;
        console.log("=====视频播放完毕========");
        this.onEndedFunC != null && this.onEndedFunC();
      }
    }, {
      key: "off",
      value: function off(eventType, ths, callBack) {
        if (eventType == "loadedmetadata") {
          this.onPlayFunc = callBack.bind(ths);
          this.videoElement.offPlay = this.onPlayFunction.bind(this);
        } else if (eventType == "ended") {
          this.onEndedFunC = callBack.bind(ths);
          this.videoElement.offEnded = this.onEndedFunction.bind(this);
        }
      }
    }, {
      key: "load",
      value: function load(url) {
        if (!this.videoElement) return;
        this.videoElement.src = url;
      }
    }, {
      key: "play",
      value: function play() {
        if (!this.videoElement) return;
        this.videoend = false;
        this.videoElement.play();
      }
    }, {
      key: "pause",
      value: function pause() {
        if (!this.videoElement) return;
        this.videoend = true;
        this.videoElement.pause();
      }
    }, {
      key: "currentTime",
      get: function get() {
        if (!this.videoElement) return 0;
        return this.videoElement.initialTime;
      },
      set: function set(value) {
        if (!this.videoElement) return;
        this.videoElement.initialTime = value;
      }
    }, {
      key: "videoWidth",
      get: function get() {
        if (!this.videoElement) return 0;
        return this.videoElement.width;
      }
    }, {
      key: "videoHeight",
      get: function get() {
        if (!this.videoElement) return 0;
        return this.videoElement.height;
      }
    }, {
      key: "ended",
      get: function get() {
        return this.videoend;
      }
    }, {
      key: "loop",
      get: function get() {
        if (!this.videoElement) return false;
        return this.videoElement.loop;
      },
      set: function set(value) {
        if (!this.videoElement) return;
        this.videoElement.loop = value;
      }
    }, {
      key: "playbackRate",
      get: function get() {
        if (!this.videoElement) return 0;
        return this.videoElement.playbackRate;
      },
      set: function set(value) {
        if (!this.videoElement) return;
        this.videoElement.playbackRate = value;
      }
    }, {
      key: "muted",
      get: function get() {
        if (!this.videoElement) return false;
        return this.videoElement.muted;
      },
      set: function set(value) {
        if (!this.videoElement) return;
        this.videoElement.muted = value;
      }
    }, {
      key: "paused",
      get: function get() {
        if (!this.videoElement) return false;
        return this.videoElement.paused;
      }
    }, {
      key: "size",
      value: function size(width, height) {
        if (!this.videoElement) return;
        this.videoElement.width = width;
        this.videoElement.height = height;
      }
    }, {
      key: "x",
      get: function get() {
        if (!this.videoElement) return 0;
        return this.videoElement.x;
      },
      set: function set(value) {
        if (!this.videoElement) return;
        this.videoElement.x = value;
      }
    }, {
      key: "y",
      get: function get() {
        if (!this.videoElement) return 0;
        return this.videoElement.y;
      },
      set: function set(value) {
        if (!this.videoElement) return;
        this.videoElement.y = value;
      }
    }, {
      key: "currentSrc",
      get: function get() {
        return this.videoElement.src;
      }
    }, {
      key: "destroy",
      value: function destroy() {
        if (this.videoElement) this.videoElement.destroy();
        this.videoElement = null;
        this.onEndedFunC = null;
        this.onPlayFunc = null;
        this.videoend = false;
        this.videourl = null;
      }
    }, {
      key: "reload",
      value: function reload() {
        if (!this.videoElement) return;
        this.videoElement.src = this.videourl;
      }
    }], [{
      key: "__init__",
      value: function __init__() {}
    }]);

    return MiniVideo;
  }();

  exports.ImageDataPolyfill = ImageDataPolyfill;
  exports.MiniAccelerator = MiniAccelerator;
  exports.MiniAdpter = MiniAdpter;
  exports.MiniFileMgr = MiniFileMgr;
  exports.MiniInput = MiniInput;
  exports.MiniLoader = MiniLoader;
  exports.MiniLocalStorage = MiniLocalStorage;
  exports.MiniLocation = MiniLocation;
  exports.MiniSound = MiniSound;
  exports.MiniSoundChannel = MiniSoundChannel;
  exports.MiniVideo = MiniVideo;
};